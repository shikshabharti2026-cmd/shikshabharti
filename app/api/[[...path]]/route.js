import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import Razorpay from 'razorpay'

export const runtime = 'nodejs'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-fallback-change-me'
const JWT_EXPIRES = '7d'

// Razorpay
let razorpay = null
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

function safeEqualHex(a, b) {
  try {
    if (!a || !b || a.length !== b.length) return false
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  } catch { return false }
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

function verifyToken(request) {
  try {
    const auth = request.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return null
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '')
}

async function verifyAdmin(request, db) {
  const payload = verifyToken(request)
  if (!payload) return null
  const user = await db.collection('users').findOne({ id: payload.sub })
  if (!user) return null
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase()
  if (adminEmail && user.email === adminEmail) return user
  return null
}

// MongoDB connection (cached)
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
  }
  if (!db) {
    db = client.db(process.env.DB_NAME)
  }
  return db
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// ---------- SHIKSHA BHARTI AI Tutor ----------
const LLM_BASE = (process.env.INTEGRATION_PROXY_URL || 'https://integrations.emergentagent.com') + '/llm'
const LLM_KEY = process.env.EMERGENT_LLM_KEY
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini'

const TUTOR_SYSTEM_PROMPT = `You are "Bharti", the AI Tutor for SHIKSHA BHARTI — a premium Indian EdTech platform (tagline: "Learn Today. Build Tomorrow.").

You help students across India (specially Jharkhand) with:
- School (Class 1-12, JAC/CBSE/ICSE), Higher Education (BA, BSc, BTech, MBA, MCA, etc.)
- Government Exams (JSSC, JPSC, SSC, Railway, Banking, UPSC, NEET, JEE, GATE)
- ITI Trades (Electrician, Fitter, Welder, COPA, Solar Technician, IoT, AI)
- Programming (Python, Java, JavaScript, React, Next.js, Full Stack)
- AI/ML, Data Science, Cyber Security, Cloud (AWS, Azure), DevOps
- Skills (Spoken English, Digital Marketing, Tally, Excel, Design)

RULES:
- Reply in the same language the student writes (Hindi, English, or Hinglish).
- Be concise, warm, structured. Use short paragraphs, bullets, and code blocks when useful.
- Explain step-by-step with a real-life Indian example when helpful.
- End with one crisp follow-up question when it aids learning.
- If asked "who are you" — say you are Bharti, AI Tutor at Shiksha Bharti.
- Never invent facts about pricing, refunds, or platform policies — say "Please contact support."`

async function callLLM(messages) {
  const res = await fetch(`${LLM_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_KEY}`,
      'X-App-ID': process.env.NEXT_PUBLIC_BASE_URL || 'shiksha-bharti',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      temperature: 0.5,
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`LLM error ${res.status}: ${t}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'Shiksha Bharti API' }))
    }

    // ---------- AI TUTOR CHAT ----------
    // POST /api/chat  { sessionId, message }
    if (route === '/chat' && method === 'POST') {
      if (!LLM_KEY) {
        return handleCORS(NextResponse.json({ error: 'AI key not configured' }, { status: 500 }))
      }
      const body = await request.json()
      const sessionId = body.sessionId || uuidv4()
      const userText = (body.message || '').toString().trim()
      if (!userText) {
        return handleCORS(NextResponse.json({ error: 'message is required' }, { status: 400 }))
      }

      // Load recent history
      const doc = await db.collection('chat_sessions').findOne({ sessionId })
      const history = (doc?.messages || []).slice(-16)

      const messages = [
        { role: 'system', content: TUTOR_SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userText },
      ]

      let reply = ''
      try {
        reply = await callLLM(messages)
      } catch (e) {
        console.error('LLM error:', e.message)
        return handleCORS(NextResponse.json({ error: 'AI is temporarily unavailable', detail: e.message }, { status: 502 }))
      }

      const now = new Date()
      await db.collection('chat_sessions').updateOne(
        { sessionId },
        {
          $setOnInsert: { sessionId, createdAt: now },
          $set: { updatedAt: now },
          $push: {
            messages: {
              $each: [
                { role: 'user', content: userText, createdAt: now },
                { role: 'assistant', content: reply, createdAt: now },
              ],
            },
          },
        },
        { upsert: true }
      )

      return handleCORS(NextResponse.json({ sessionId, reply }))
    }

    // GET /api/chat?sessionId=xxx  -> history
    if (route === '/chat' && method === 'GET') {
      const sessionId = new URL(request.url).searchParams.get('sessionId')
      if (!sessionId) return handleCORS(NextResponse.json({ messages: [] }))
      const doc = await db.collection('chat_sessions').findOne({ sessionId })
      const messages = (doc?.messages || []).map(({ _id, ...m }) => m)
      return handleCORS(NextResponse.json({ sessionId, messages }))
    }

    // ---------- LEAD / ENROLL (simple) ----------
    if (route === '/enroll' && method === 'POST') {
      const body = await request.json()
      if (!body.name || !body.phone) {
        return handleCORS(NextResponse.json({ error: 'name and phone required' }, { status: 400 }))
      }
      const lead = {
        id: uuidv4(),
        name: body.name,
        phone: body.phone,
        email: body.email || '',
        course: body.course || '',
        createdAt: new Date(),
      }
      await db.collection('leads').insertOne(lead)
      const { _id, ...safe } = lead
      return handleCORS(NextResponse.json({ ok: true, lead: safe }))
    }

    // ---------- COUNTERS ----------
    if (route === '/stats' && method === 'GET') {
      return handleCORS(NextResponse.json({
        students: 100000,
        courses: 500,
        liveClasses: 1000,
        mentors: 250,
        satisfaction: 98,
      }))
    }

    // ---------- AUTH: REGISTER ----------
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json()
      const name = (body.name || '').toString().trim()
      const email = (body.email || '').toString().trim().toLowerCase()
      const password = (body.password || '').toString()
      const role = ['student', 'teacher'].includes(body.role) ? body.role : 'student'
      if (!name || !isValidEmail(email) || password.length < 6) {
        return handleCORS(NextResponse.json({ error: 'Provide valid name, email, and password (min 6 chars)' }, { status: 400 }))
      }
      const existing = await db.collection('users').findOne({ email })
      if (existing) {
        return handleCORS(NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 409 }))
      }
      const passwordHash = await bcrypt.hash(password, 10)
      const user = { id: uuidv4(), name, email, passwordHash, role, createdAt: new Date() }
      await db.collection('users').insertOne(user)
      const token = signToken(user)
      const isAdmin = user.email === (process.env.ADMIN_EMAIL || '').toLowerCase()
      return handleCORS(NextResponse.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: isAdmin ? 'admin' : user.role, isAdmin },
      }))
    }

    // ---------- AUTH: LOGIN ----------
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const email = (body.email || '').toString().trim().toLowerCase()
      const password = (body.password || '').toString()
      if (!isValidEmail(email) || !password) {
        return handleCORS(NextResponse.json({ error: 'Enter a valid email and password' }, { status: 400 }))
      }
      const user = await db.collection('users').findOne({ email })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Invalid email or password' }, { status: 401 }))
      }
      const ok = await bcrypt.compare(password, user.passwordHash)
      if (!ok) {
        return handleCORS(NextResponse.json({ error: 'Invalid email or password' }, { status: 401 }))
      }
      const token = signToken(user)
      const isAdmin = user.email === (process.env.ADMIN_EMAIL || '').toLowerCase()
      const role = isAdmin ? 'admin' : (user.role || 'student')
      return handleCORS(NextResponse.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role, isAdmin },
      }))
    }

    // ---------- AUTH: ME ----------
    if (route === '/auth/me' && method === 'GET') {
      const payload = verifyToken(request)
      if (!payload) {
        return handleCORS(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }))
      }
      const user = await db.collection('users').findOne({ id: payload.sub })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }
      const isAdmin = user.email === (process.env.ADMIN_EMAIL || '').toLowerCase()
      const role = isAdmin ? 'admin' : (user.role || 'student')
      return handleCORS(NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, role, isAdmin } }))
    }

    // ---------- COURSES: SEED + LIST ----------
    if (route === '/courses' && method === 'GET') {
      const count = await db.collection('courses').countDocuments()
      if (count === 0) {
        const seed = [
          { id: 'jssc-cgl-2025', title: 'JSSC CGL - Complete Mastery', tag: 'Jharkhand', category: 'Jharkhand Govt. Exams', price: 2499, originalPrice: 6999, rating: 4.9, students: 18420, hours: 220, color: 'from-blue-600 via-indigo-600 to-purple-600', description: 'Complete JSSC CGL preparation with Hindi + English medium, mock tests, current affairs, PYQs, and live doubt sessions. Includes Jharkhand-specific GK.', instructor: 'Rajesh Kumar Singh', level: 'Intermediate', language: 'Hindi / English', curriculum: ['General Studies (JH GK, History, Polity)','Reasoning & Aptitude','Quantitative Mathematics','English & Hindi Grammar','Previous Year Papers (2015-2024)','20+ Full-length Mock Tests','Live Weekend Doubt Sessions','Current Affairs Monthly PDF'] },
          { id: 'python-ai-ml', title: 'Python + AI/ML Bootcamp', tag: 'Trending', category: 'AI & Data Science', price: 3999, originalPrice: 9999, rating: 4.8, students: 32110, hours: 180, color: 'from-emerald-500 via-teal-600 to-cyan-600', description: 'Zero-to-hero Python + Machine Learning bootcamp. Build real projects: chatbot, recommender, price predictor. Placement support included.', instructor: 'Dr. Ananya Roy', level: 'Beginner to Advanced', language: 'English / Hinglish', curriculum: ['Python Fundamentals','NumPy, Pandas, Matplotlib','Machine Learning with scikit-learn','Deep Learning with TensorFlow/PyTorch','NLP & Generative AI (LLMs)','Real-world Projects (5+)','Deployment to AWS/Vercel','Interview Preparation'] },
          { id: 'iti-electrician', title: 'ITI Electrician - Full Course', tag: 'Job Ready', category: 'ITI Trades', price: 1499, originalPrice: 4999, rating: 4.9, students: 11800, hours: 120, color: 'from-orange-500 via-amber-500 to-yellow-500', description: 'Complete ITI Electrician trade course as per NCVT syllabus. Practical + theory + workshop. Hindi medium.', instructor: 'Mahesh Prasad', level: 'Beginner', language: 'Hindi', curriculum: ['Basic Electricity & Safety','Wiring & Installation','Motors & Transformers','Generators & Alternators','Domestic Appliances Repair','Industrial Wiring','Solar Panel Installation','Workshop Practicals'] },
          { id: 'fullstack-mern', title: 'Full Stack Web Dev (MERN + Next.js)', tag: 'Placement', category: 'Programming', price: 4999, originalPrice: 12999, rating: 4.9, students: 24700, hours: 260, color: 'from-fuchsia-500 via-purple-600 to-indigo-600', description: 'Become a Full Stack developer with MongoDB, Express, React, Node & Next.js 15. 10+ real projects. Placement assistance.', instructor: 'Arjun Mehta', level: 'Beginner to Advanced', language: 'Hinglish', curriculum: ['HTML, CSS, JavaScript','React 19 + Hooks','Next.js 15 App Router','Node.js + Express','MongoDB + Mongoose','Authentication (JWT + OAuth)','Payment Integration (Razorpay)','Deploy to Vercel + AWS','10+ Portfolio Projects','Mock Interviews'] },
          { id: 'jpsc-2025', title: 'JPSC Prelims + Mains - 2025', tag: 'Jharkhand', category: 'Jharkhand Govt. Exams', price: 5499, originalPrice: 14999, rating: 4.8, students: 9340, hours: 320, color: 'from-rose-500 via-pink-600 to-red-600', description: 'JPSC Combined Civil Services (Prelims + Mains) with essay writing, optional subjects, and Jharkhand-focused GK.', instructor: 'IAS Nitin Sharma (Retd.)', level: 'Advanced', language: 'Hindi / English', curriculum: ['Prelims: Paper I & II','Jharkhand GK Deep Dive','Indian Polity, History, Geography','Essay Writing (Hindi/English)','Optional Subject Coaching','Interview Preparation','20+ Mock Tests','Answer Writing Practice'] },
          { id: 'genai-prompt', title: 'Generative AI + Prompt Engineering', tag: 'New', category: 'AI & Data Science', price: 1999, originalPrice: 5999, rating: 4.9, students: 7220, hours: 60, color: 'from-cyan-500 via-blue-600 to-indigo-700', description: 'Master ChatGPT, Claude, Gemini & build your own AI agents. Prompt engineering, RAG, fine-tuning, and monetization.', instructor: 'Kartik Verma', level: 'Beginner to Intermediate', language: 'English / Hinglish', curriculum: ['Intro to LLMs (GPT, Claude, Gemini)','Advanced Prompt Engineering','Building AI Agents (LangChain)','RAG - Retrieval Augmented Generation','Vector Databases','Fine-tuning Models','Building SaaS with AI','Monetization Strategies'] },
        ]
        await db.collection('courses').insertMany(seed)
      }
      const list = await db.collection('courses').find({}).toArray()
      return handleCORS(NextResponse.json({ courses: list.map(({ _id, ...c }) => c) }))
    }

    // ---------- COURSE DETAIL ----------
    if (route.startsWith('/courses/') && method === 'GET') {
      const id = route.split('/courses/')[1]
      const course = await db.collection('courses').findOne({ id })
      if (!course) return handleCORS(NextResponse.json({ error: 'Course not found' }, { status: 404 }))
      const { _id, ...safe } = course
      // Attach review summary
      const reviews = await db.collection('reviews').find({ courseId: id }).toArray()
      const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : safe.rating
      return handleCORS(NextResponse.json({ course: { ...safe, avgRating: +avgRating.toFixed(1), totalReviews: reviews.length } }))
    }

    // ---------- REVIEWS ----------
    if (route === '/reviews' && method === 'POST') {
      const payload = verifyToken(request)
      if (!payload) return handleCORS(NextResponse.json({ error: 'Please login' }, { status: 401 }))
      const body = await request.json()
      const rating = Math.max(1, Math.min(5, Number(body.rating) || 5))
      const comment = (body.comment || '').toString().trim().slice(0, 1000)
      const courseId = body.courseId
      if (!courseId || !comment) return handleCORS(NextResponse.json({ error: 'courseId and comment required' }, { status: 400 }))
      const user = await db.collection('users').findOne({ id: payload.sub })
      const existing = await db.collection('reviews').findOne({ userId: payload.sub, courseId })
      const doc = {
        id: existing?.id || uuidv4(),
        courseId,
        userId: payload.sub,
        userName: user?.name || 'Student',
        rating,
        comment,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
      }
      if (existing) {
        await db.collection('reviews').updateOne({ id: existing.id }, { $set: doc })
      } else {
        await db.collection('reviews').insertOne(doc)
      }
      return handleCORS(NextResponse.json({ ok: true, review: { ...doc } }))
    }

    if (route === '/reviews' && method === 'GET') {
      const url = new URL(request.url)
      const courseId = url.searchParams.get('courseId')
      if (!courseId) return handleCORS(NextResponse.json({ error: 'courseId required' }, { status: 400 }))
      const list = await db.collection('reviews').find({ courseId }).sort({ createdAt: -1 }).limit(50).toArray()
      const avg = list.length ? +(list.reduce((a, r) => a + r.rating, 0) / list.length).toFixed(1) : null
      return handleCORS(NextResponse.json({
        reviews: list.map(({ _id, userId, ...r }) => r),
        summary: { total: list.length, avg },
      }))
    }

    // ---------- ENROLL (free for MVP; Razorpay upgrade later) ----------
    if (route === '/enrollments' && method === 'POST') {
      const payload = verifyToken(request)
      if (!payload) return handleCORS(NextResponse.json({ error: 'Please login to enroll' }, { status: 401 }))
      const body = await request.json()
      const courseId = body.courseId
      const course = await db.collection('courses').findOne({ id: courseId })
      if (!course) return handleCORS(NextResponse.json({ error: 'Course not found' }, { status: 404 }))
      const existing = await db.collection('enrollments').findOne({ userId: payload.sub, courseId })
      if (existing) return handleCORS(NextResponse.json({ ok: true, alreadyEnrolled: true, enrollment: { id: existing.id, courseId, progress: existing.progress || 0 } }))
      const enrollment = {
        id: uuidv4(),
        userId: payload.sub,
        courseId,
        courseTitle: course.title,
        courseColor: course.color,
        courseHours: course.hours,
        enrolledAt: new Date(),
        progress: 0,
        status: 'active',
        paid: false,
      }
      await db.collection('enrollments').insertOne(enrollment)
      return handleCORS(NextResponse.json({ ok: true, enrollment: { id: enrollment.id, courseId, progress: 0 } }))
    }

    // ---------- MY ENROLLMENTS ----------
    if (route === '/enrollments' && method === 'GET') {
      const payload = verifyToken(request)
      if (!payload) return handleCORS(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }))
      const list = await db.collection('enrollments').find({ userId: payload.sub }).sort({ enrolledAt: -1 }).toArray()
      return handleCORS(NextResponse.json({ enrollments: list.map(({ _id, ...e }) => e) }))
    }

    // ---------- UPDATE PROGRESS ----------
    if (route === '/enrollments/progress' && method === 'POST') {
      const payload = verifyToken(request)
      if (!payload) return handleCORS(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }))
      const { enrollmentId, progress } = await request.json()
      const p = Math.max(0, Math.min(100, Number(progress) || 0))
      await db.collection('enrollments').updateOne(
        { id: enrollmentId, userId: payload.sub },
        { $set: { progress: p, updatedAt: new Date(), ...(p >= 100 ? { completedAt: new Date(), status: 'completed' } : {}) } }
      )
      return handleCORS(NextResponse.json({ ok: true, progress: p }))
    }

    // ---------- PAYMENTS: RAZORPAY ----------
    // POST /payments/create-order  { courseId }
    if (route === '/payments/create-order' && method === 'POST') {
      const payload = verifyToken(request)
      if (!payload) return handleCORS(NextResponse.json({ error: 'Please login' }, { status: 401 }))
      if (!razorpay) return handleCORS(NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 }))
      const body = await request.json()
      const course = await db.collection('courses').findOne({ id: body.courseId })
      if (!course) return handleCORS(NextResponse.json({ error: 'Course not found' }, { status: 404 }))
      const existing = await db.collection('enrollments').findOne({ userId: payload.sub, courseId: body.courseId, paid: true })
      if (existing) return handleCORS(NextResponse.json({ error: 'Already enrolled and paid' }, { status: 409 }))
      const amountPaise = course.price * 100
      const user = await db.collection('users').findOne({ id: payload.sub })
      try {
        const order = await razorpay.orders.create({
          amount: amountPaise,
          currency: 'INR',
          receipt: `sb_${payload.sub.slice(0, 8)}_${Date.now()}`,
          notes: { userId: payload.sub, courseId: body.courseId, courseTitle: course.title },
        })
        // Create pending enrollment record
        await db.collection('payments').insertOne({
          id: uuidv4(),
          orderId: order.id,
          userId: payload.sub,
          courseId: body.courseId,
          courseTitle: course.title,
          amountPaise,
          status: 'created',
          createdAt: new Date(),
        })
        return handleCORS(NextResponse.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          course: { id: course.id, title: course.title, price: course.price, color: course.color },
          user: { name: user?.name, email: user?.email },
        }))
      } catch (e) {
        console.error('Razorpay order error:', e.message)
        return handleCORS(NextResponse.json({ error: 'Failed to create order', detail: e.message }, { status: 500 }))
      }
    }

    // POST /payments/verify - verify signature and mark enrolled+paid
    if (route === '/payments/verify' && method === 'POST') {
      const payload = verifyToken(request)
      if (!payload) return handleCORS(NextResponse.json({ error: 'Please login' }, { status: 401 }))
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = await request.json()
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return handleCORS(NextResponse.json({ error: 'Missing payment data' }, { status: 400 }))
      }
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')
      if (!safeEqualHex(expected, razorpay_signature)) {
        await db.collection('payments').updateOne({ orderId: razorpay_order_id }, { $set: { status: 'invalid_signature', updatedAt: new Date() } })
        return handleCORS(NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 }))
      }
      const course = await db.collection('courses').findOne({ id: courseId })
      if (!course) return handleCORS(NextResponse.json({ error: 'Course not found' }, { status: 404 }))

      const now = new Date()
      // Update payment record
      await db.collection('payments').updateOne(
        { orderId: razorpay_order_id },
        { $set: { status: 'paid', paymentId: razorpay_payment_id, signature: razorpay_signature, paidAt: now, updatedAt: now } }
      )
      // Upsert enrollment as paid
      const existing = await db.collection('enrollments').findOne({ userId: payload.sub, courseId })
      if (existing) {
        await db.collection('enrollments').updateOne(
          { id: existing.id },
          { $set: { paid: true, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, paidAt: now } }
        )
      } else {
        await db.collection('enrollments').insertOne({
          id: uuidv4(),
          userId: payload.sub,
          courseId,
          courseTitle: course.title,
          courseColor: course.color,
          courseHours: course.hours,
          enrolledAt: now,
          progress: 0,
          status: 'active',
          paid: true,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          paidAt: now,
        })
      }
      return handleCORS(NextResponse.json({ ok: true, paymentId: razorpay_payment_id }))
    }

    // ---------- ADMIN ROUTES ----------
    if (route.startsWith('/admin/')) {
      const admin = await verifyAdmin(request, db)
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Admin access required' }, { status: 403 }))
      }

      // GET /admin/stats
      if (route === '/admin/stats' && method === 'GET') {
        const [users, enrollments, leads, chats, courses] = await Promise.all([
          db.collection('users').countDocuments(),
          db.collection('enrollments').countDocuments(),
          db.collection('leads').countDocuments(),
          db.collection('chat_sessions').countDocuments(),
          db.collection('courses').countDocuments(),
        ])
        const completed = await db.collection('enrollments').countDocuments({ progress: { $gte: 100 } })
        // Signups by day (last 7 days)
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const recentUsers = await db.collection('users').find({ createdAt: { $gte: since } }).sort({ createdAt: 1 }).toArray()
        const byDay = {}
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          const key = d.toISOString().slice(5, 10)
          byDay[key] = 0
        }
        for (const u of recentUsers) {
          const key = new Date(u.createdAt).toISOString().slice(5, 10)
          if (key in byDay) byDay[key]++
        }
        const signupsSeries = Object.entries(byDay).map(([day, count]) => ({ day, count }))

        // Enrollment by course
        const enrByCourse = await db.collection('enrollments').aggregate([
          { $group: { _id: '$courseId', count: { $sum: 1 }, title: { $first: '$courseTitle' } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]).toArray()

        return handleCORS(NextResponse.json({
          users, enrollments, leads, chats, courses, completed,
          signupsSeries,
          topCourses: enrByCourse.map((c) => ({ courseId: c._id, title: c.title, count: c.count })),
        }))
      }

      // GET /admin/users
      if (route === '/admin/users' && method === 'GET') {
        const users = await db.collection('users').find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).limit(200).toArray()
        return handleCORS(NextResponse.json({ users: users.map(({ _id, ...u }) => u) }))
      }

      // GET /admin/enrollments
      if (route === '/admin/enrollments' && method === 'GET') {
        const list = await db.collection('enrollments').find({}).sort({ enrolledAt: -1 }).limit(200).toArray()
        // Join user info
        const userIds = [...new Set(list.map((e) => e.userId))]
        const users = await db.collection('users').find({ id: { $in: userIds } }).project({ passwordHash: 0 }).toArray()
        const userMap = Object.fromEntries(users.map((u) => [u.id, { name: u.name, email: u.email }]))
        return handleCORS(NextResponse.json({
          enrollments: list.map(({ _id, ...e }) => ({ ...e, user: userMap[e.userId] || null })),
        }))
      }

      // GET /admin/leads
      if (route === '/admin/leads' && method === 'GET') {
        const list = await db.collection('leads').find({}).sort({ createdAt: -1 }).limit(200).toArray()
        return handleCORS(NextResponse.json({ leads: list.map(({ _id, ...l }) => l) }))
      }

      // GET /admin/chats
      if (route === '/admin/chats' && method === 'GET') {
        const list = await db.collection('chat_sessions').find({}, { projection: { messages: { $slice: -6 } } })
          .sort({ updatedAt: -1 }).limit(50).toArray()
        return handleCORS(NextResponse.json({
          chats: list.map(({ _id, messages, ...c }) => ({
            ...c,
            messagesCount: (messages || []).length,
            preview: (messages || []).slice(-4).map((m) => ({ role: m.role, content: (m.content || '').slice(0, 200), createdAt: m.createdAt })),
          })),
        }))
      }
      // POST /admin/users/role - promote/demote user role
      if (route === '/admin/users/role' && method === 'POST') {
        const { userId, role } = await request.json()
        if (!['student', 'teacher'].includes(role)) {
          return handleCORS(NextResponse.json({ error: 'Invalid role' }, { status: 400 }))
        }
        await db.collection('users').updateOne({ id: userId }, { $set: { role, updatedAt: new Date() } })
        return handleCORS(NextResponse.json({ ok: true }))
      }
    }

    // ---------- TEACHER ROUTES ----------
    if (route.startsWith('/teacher/')) {
      const payload = verifyToken(request)
      if (!payload) return handleCORS(NextResponse.json({ error: 'Please login' }, { status: 401 }))
      const user = await db.collection('users').findOne({ id: payload.sub })
      const isAdmin = user?.email === (process.env.ADMIN_EMAIL || '').toLowerCase()
      const isTeacher = user?.role === 'teacher' || isAdmin
      if (!isTeacher) return handleCORS(NextResponse.json({ error: 'Teacher access required' }, { status: 403 }))

      // GET /teacher/stats
      if (route === '/teacher/stats' && method === 'GET') {
        const [totalStudents, totalEnrollments, allCourses] = await Promise.all([
          db.collection('users').countDocuments({ $or: [{ role: 'student' }, { role: { $exists: false } }] }),
          db.collection('enrollments').countDocuments(),
          db.collection('courses').countDocuments(),
        ])
        const completed = await db.collection('enrollments').countDocuments({ progress: { $gte: 100 } })
        // Revenue mock - assume avg 3000 per enrollment
        const revenue = totalEnrollments * 3000
        return handleCORS(NextResponse.json({ totalStudents, totalEnrollments, totalCourses: allCourses, completed, revenue }))
      }

      // GET /teacher/courses
      if (route === '/teacher/courses' && method === 'GET') {
        const courses = await db.collection('courses').find({}).toArray()
        // Get enrollment count per course
        const enrCounts = await db.collection('enrollments').aggregate([
          { $group: { _id: '$courseId', count: { $sum: 1 }, avgProgress: { $avg: '$progress' } } },
        ]).toArray()
        const countMap = Object.fromEntries(enrCounts.map((c) => [c._id, { count: c.count, avgProgress: Math.round(c.avgProgress || 0) }]))
        return handleCORS(NextResponse.json({
          courses: courses.map(({ _id, ...c }) => ({ ...c, enrolledCount: countMap[c.id]?.count || 0, avgProgress: countMap[c.id]?.avgProgress || 0 })),
        }))
      }

      // GET /teacher/students
      if (route === '/teacher/students' && method === 'GET') {
        const enrollments = await db.collection('enrollments').find({}).sort({ enrolledAt: -1 }).limit(100).toArray()
        const userIds = [...new Set(enrollments.map((e) => e.userId))]
        const students = await db.collection('users').find({ id: { $in: userIds } }).project({ passwordHash: 0 }).toArray()
        const userMap = Object.fromEntries(students.map((u) => [u.id, u]))
        // Group enrollments by user
        const byStudent = {}
        for (const e of enrollments) {
          if (!byStudent[e.userId]) byStudent[e.userId] = { student: userMap[e.userId], enrollments: [] }
          byStudent[e.userId].enrollments.push({ id: e.id, courseId: e.courseId, courseTitle: e.courseTitle, progress: e.progress || 0, status: e.status })
        }
        return handleCORS(NextResponse.json({ students: Object.values(byStudent).filter((s) => s.student) }))
      }
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
