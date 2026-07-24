'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Sparkles,
  ArrowLeft,
  Sun,
  Moon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Star,
  Users,
  Clock,
  BadgeCheck,
  Globe,
  Award,
  BookOpen,
  ChevronDown,
  MessageSquare,
  ShoppingCart,
  Heart,
  Share2,
  User,
  CheckCircle2,
  Loader2,
  PlayCircle,
  Video,
  FileText,
  Download,
  Zap,
  ThumbsUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toast } from 'sonner'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  if (!m) return <div className="h-9 w-9" />
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10">
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

function VideoPlayer({ src, poster }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const onTime = () => {
      setCurrent(v.currentTime)
      if (v.duration) setProgress((v.currentTime / v.duration) * 100)
    }
    const onLoad = () => setDuration(v.duration)
    const onEnd = () => setPlaying(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onLoad)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onLoad)
      v.removeEventListener('ended', onEnd)
    }
  }, [])

  function toggle() {
    const v = ref.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) } else { v.pause(); setPlaying(false) }
  }
  function seek(e) {
    const v = ref.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const p = (e.clientX - rect.left) / rect.width
    v.currentTime = p * duration
  }
  function toggleMute() {
    const v = ref.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }
  function changeSpeed() {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length]
    const v = ref.current
    if (v) v.playbackRate = next
    setSpeed(next)
  }
  function fullscreen() {
    const v = ref.current
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen()
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen()
  }
  function fmt(t) {
    if (!t || !isFinite(t)) return '0:00'
    const m = Math.floor(t / 60), s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video ref={ref} src={src} poster={poster} className="h-full w-full object-cover" playsInline preload="metadata" />
      {!playing && (
        <button onClick={toggle} className="absolute inset-0 grid place-items-center bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm transition hover:bg-black/40">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 shadow-2xl shadow-fuchsia-500/50 transition group-hover:scale-110">
            <Play className="h-8 w-8 fill-white text-white" />
          </div>
        </button>
      )}
      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
        <div onClick={seek} className="mb-2 h-1.5 cursor-pointer overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-gradient-to-r from-blue-500 to-fuchsia-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-2 text-white">
          <button onClick={toggle} className="rounded-full p-1.5 hover:bg-white/10">
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button onClick={toggleMute} className="rounded-full p-1.5 hover:bg-white/10">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <span className="text-xs">{fmt(current)} / {fmt(duration)}</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={changeSpeed} className="rounded-md bg-white/10 px-2 py-1 text-xs">{speed}x</button>
            <button onClick={fullscreen} className="rounded-full p-1.5 hover:bg-white/10"><Maximize className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
      <Badge className="absolute right-3 top-3 border-0 bg-black/60 text-white backdrop-blur">
        <Sparkles className="mr-1 h-3 w-3" /> Preview Lesson
      </Badge>
    </div>
  )
}

function Stars({ value, size = 4 }) {
  const s = size === 4 ? 'h-4 w-4' : 'h-3.5 w-3.5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${s} ${i <= Math.round(value || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
      ))}
    </div>
  )
}

const FAQ = [
  { q: 'Is this course suitable for beginners?', a: 'Yes! This course is designed to take you from zero to advanced. We cover fundamentals before diving into complex topics.' },
  { q: 'Will I get a certificate after completion?', a: 'Absolutely. On completing 100% of the course, you unlock a verifiable Shiksha Bharti certificate that you can share on LinkedIn.' },
  { q: 'What is the language of instruction?', a: 'Courses are taught in Hindi, English, or Hinglish depending on the instructor. You can also use the AI Tutor Bharti in your preferred language 24x7.' },
  { q: 'Do you provide placement assistance?', a: 'Yes, for career-focused programs (Full Stack, Python AI/ML, Data Science), we provide mock interviews, resume review, and connect you with hiring partners.' },
  { q: 'Can I access this course on mobile?', a: 'Yes, the entire platform is fully responsive and works perfectly on mobile, tablet, and desktop.' },
]

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [reviewsSummary, setReviewsSummary] = useState({ total: 0, avg: null })
  const [user, setUser] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [wishlist, setWishlist] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const cRes = await fetch(`/api/courses/${id}`)
        if (!cRes.ok) { toast.error('Course not found'); router.push('/'); return }
        const cData = await cRes.json()
        setCourse(cData.course)

        const rRes = await fetch(`/api/reviews?courseId=${id}`)
        if (rRes.ok) {
          const rData = await rRes.json()
          setReviews(rData.reviews || [])
          setReviewsSummary(rData.summary || { total: 0, avg: null })
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null
        if (token) {
          const meRes = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
          if (meRes.ok) {
            const meData = await meRes.json()
            setUser(meData.user)
            const enRes = await fetch('/api/enrollments', { headers: { Authorization: `Bearer ${token}` } })
            if (enRes.ok) {
              const enData = await enRes.json()
              setEnrolled((enData.enrollments || []).some((e) => e.courseId === id))
            }
          }
        }
      } catch (e) { toast.error('Failed to load course') }
      finally { setLoading(false) }
    })()
  }, [id, router])

  async function handleEnroll() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null
    if (!token) {
      toast.error('Please login first', { description: 'Go to home page and click Login/Register' })
      router.push('/')
      return
    }
    setEnrolling(true)
    try {
      // Load Razorpay SDK
      await new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve()
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = resolve
        s.onerror = () => reject(new Error('Failed to load Razorpay'))
        document.body.appendChild(s)
      })

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: id }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || 'Order failed')

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Shiksha Bharti',
        description: orderData.course.title,
        order_id: orderData.orderId,
        prefill: { name: orderData.user.name, email: orderData.user.email },
        theme: { color: '#8b5cf6' },
        handler: async (response) => {
          try {
            const v = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ...response, courseId: id }),
            })
            const vd = await v.json()
            if (!v.ok) throw new Error(vd.error || 'Verification failed')
            setEnrolled(true)
            toast.success(`\ud83c\udf89 Payment successful! Enrolled in ${course.title}`, {
              description: `Payment ID: ${response.razorpay_payment_id}`,
              action: { label: 'Go to Dashboard', onClick: () => router.push('/dashboard') },
            })
          } catch (e) {
            toast.error('Payment verification failed', { description: e.message })
          } finally {
            setEnrolling(false)
          }
        },
        modal: {
          ondismiss: () => { toast.info('Payment cancelled'); setEnrolling(false) },
        },
      })
      rzp.on('payment.failed', (resp) => {
        toast.error('Payment failed', { description: resp.error?.description || 'Please try again' })
        setEnrolling(false)
      })
      rzp.open()
    } catch (e) {
      toast.error(e.message)
      setEnrolling(false)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to leave a review')
      return
    }
    if (!newReview.comment.trim()) {
      toast.error('Please write a comment')
      return
    }
    setSubmittingReview(true)
    try {
      const token = localStorage.getItem('sb_token')
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: id, rating: newReview.rating, comment: newReview.comment }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      toast.success('Review posted!')
      const rRes = await fetch(`/api/reviews?courseId=${id}`)
      const rData = await rRes.json()
      setReviews(rData.reviews || [])
      setReviewsSummary(rData.summary || {})
      setNewReview({ rating: 5, comment: '' })
    } catch (e) { toast.error(e.message) }
    finally { setSubmittingReview(false) }
  }

  const groupedCurriculum = useMemo(() => {
    if (!course?.curriculum) return []
    // Group into modules of ~4 items each
    const modules = []
    const items = course.curriculum
    let i = 0, m = 1
    while (i < items.length) {
      const chunk = items.slice(i, i + Math.ceil(items.length / 4))
      modules.push({
        title: `Module ${m}: ${chunk[0].split(' ').slice(0, 4).join(' ')}`,
        lessons: chunk,
        duration: `${Math.round((course.hours / 4) * (chunk.length / (items.length / 4)))} hrs`,
      })
      i += chunk.length
      m++
    }
    return modules
  }, [course])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
    </div>
  )
  if (!course) return null

  const discount = course.originalPrice ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) : 0

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br ${course.color} opacity-20 blur-3xl`} />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" /> <span className="text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-fuchsia-500"><Sparkles className="h-4 w-4 text-white" /></div>
              <div className="text-sm font-bold">Shiksha Bharti</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-xs font-bold text-white">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${course.color} py-10`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-black/40" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className="border-0 bg-white/20 text-white backdrop-blur">{course.category}</Badge>
              <Badge className="border-0 bg-white/20 text-white backdrop-blur">{course.tag}</Badge>
              <Badge className="border-0 bg-emerald-500/90 text-white">{course.level}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-white md:text-5xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-white/85">{course.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
              <div className="flex items-center gap-1.5">
                <Stars value={course.avgRating || course.rating} />
                <span className="font-semibold">{course.avgRating || course.rating}</span>
                <span className="opacity-70">({course.totalReviews || course.students?.toLocaleString('en-IN')} learners)</span>
              </div>
              <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.students?.toLocaleString('en-IN')} enrolled</div>
              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.hours}+ hours</div>
              <div className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> {course.language}</div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-white">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs opacity-70">Instructor</div>
                <div className="font-semibold">{course.instructor}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Video Player */}
          <VideoPlayer
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            poster=""
          />

          {/* What you'll learn */}
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader><CardTitle className="text-base">What you&apos;ll learn</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {(course.curriculum || []).slice(0, 8).map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Curriculum accordion */}
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Curriculum</CardTitle>
              <div className="text-xs text-muted-foreground">{groupedCurriculum.length} modules &middot; {course.hours}+ hours</div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={['m-0']} className="w-full">
                {groupedCurriculum.map((mod, mi) => (
                  <AccordionItem key={mi} value={`m-${mi}`} className="border-white/10">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-1 items-center justify-between pr-2 text-left">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-fuchsia-500 text-xs font-bold text-white">{mi + 1}</div>
                          <div>
                            <div className="text-sm font-semibold">{mod.title}</div>
                            <div className="text-xs text-muted-foreground">{mod.lessons.length} lessons &middot; {mod.duration}</div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1.5 pl-11">
                        {mod.lessons.map((lesson, li) => (
                          <div key={li} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5">
                            <Video className="h-3.5 w-3.5 text-blue-400" />
                            <div className="flex-1">{lesson}</div>
                            <div className="text-xs text-muted-foreground">{5 + (li % 4) * 3} min</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader><CardTitle className="text-base">About the Instructor</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-fuchsia-500 text-2xl font-bold text-white">
                  {course.instructor?.[0]}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold">{course.instructor}</div>
                  <div className="text-sm text-muted-foreground">Senior Faculty at Shiksha Bharti</div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9 Rating</div>
                    <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 50,000+ Students</div>
                    <div className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> 12 Courses</div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    A passionate educator with 10+ years of experience teaching students across India. Known for a clear, practical teaching style with real-world examples and step-by-step guidance in Hindi &amp; English.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card id="reviews" className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Reviews ({reviewsSummary.total || 0})</span>
                {reviewsSummary.avg && (
                  <div className="flex items-center gap-2">
                    <Stars value={reviewsSummary.avg} />
                    <span className="text-sm font-semibold">{reviewsSummary.avg}</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Write a review */}
              {user && enrolled && (
                <form onSubmit={submitReview} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 text-sm font-semibold">Write a review</div>
                  <div className="mb-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" onClick={() => setNewReview({ ...newReview, rating: r })}>
                        <Star className={`h-6 w-6 transition ${r <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience with this course..."
                    rows={3}
                    className="bg-white/5"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button type="submit" disabled={submittingReview} className="bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600">
                      {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Review'}
                    </Button>
                  </div>
                </form>
              )}

              {reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
                  No reviews yet. {user && enrolled ? 'Be the first to write one!' : 'Enroll and complete some lessons to leave a review.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-sm font-bold text-white">
                            {r.userName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{r.userName}</div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <Stars value={r.rating} size={3.5} />
                              <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-xs text-muted-foreground hover:text-foreground"><ThumbsUp className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader><CardTitle className="text-base">Frequently Asked Questions</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {FAQ.map((f, i) => (
                  <AccordionItem key={i} value={`f-${i}`} className="border-white/10">
                    <AccordionTrigger className="text-left hover:no-underline">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur">
              <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${course.color}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_40%)]" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-white/25 backdrop-blur">
                    <PlayCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <Badge className="absolute right-3 top-3 border-0 bg-black/40 text-white backdrop-blur">Preview Free</Badge>
              </div>
              <CardContent className="p-5">
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">₹{course.price?.toLocaleString('en-IN')}</span>
                  {course.originalPrice && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">₹{course.originalPrice?.toLocaleString('en-IN')}</span>
                      <Badge className="bg-emerald-500/15 text-emerald-400">{discount}% off</Badge>
                    </>
                  )}
                </div>
                <div className="mb-4 text-xs text-rose-400">⏰ Offer ends in 3 days</div>
                {enrolled ? (
                  <div className="space-y-2">
                    <Link href="/dashboard" className="block">
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
                        <PlayCircle className="mr-2 h-4 w-4" /> Continue Learning
                      </Button>
                    </Link>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-center text-xs text-emerald-400">
                      <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> You&apos;re enrolled
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleEnroll} disabled={enrolling} className="w-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-fuchsia-600">
                    {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><ShoppingCart className="mr-2 h-4 w-4" /> Enroll Now</>)}
                  </Button>
                )}
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" onClick={() => { setWishlist(!wishlist); toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist') }} className="flex-1 border-white/15 bg-white/5">
                    <Heart className={`mr-1.5 h-4 w-4 ${wishlist ? 'fill-rose-500 text-rose-500' : ''}`} /> Wishlist
                  </Button>
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }} className="flex-1 border-white/15 bg-white/5">
                    <Share2 className="mr-1.5 h-4 w-4" /> Share
                  </Button>
                </div>
                <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">This course includes</div>
                  {[
                    { icon: Video, t: `${course.hours}+ hours video content` },
                    { icon: FileText, t: 'Downloadable PDF notes' },
                    { icon: Zap, t: 'AI Tutor (24x7) access' },
                    { icon: Award, t: 'Verifiable certificate' },
                    { icon: Users, t: 'Community & doubt support' },
                    { icon: Globe, t: 'Access on mobile & desktop' },
                  ].map((it) => {
                    const Icon = it.icon
                    return (
                      <div key={it.t} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 text-fuchsia-400" /> {it.t}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Certificate preview */}
            <Card className="mt-4 overflow-hidden border-white/10 bg-white/5 backdrop-blur">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-amber-400" /> Certificate Preview</CardTitle></CardHeader>
              <CardContent>
                <div className={`rounded-xl border border-white/15 bg-gradient-to-br ${course.color} p-0.5`}>
                  <div className="rounded-[10px] bg-background/85 p-3 text-center backdrop-blur">
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Shiksha Bharti</div>
                    <div className="text-[9px] text-muted-foreground">Certificate of Completion</div>
                    <div className="my-2 text-sm font-bold">Your Name</div>
                    <div className="text-[10px] text-muted-foreground">has successfully completed</div>
                    <div className="text-xs font-semibold bg-gradient-to-r from-blue-400 to-fuchsia-400 bg-clip-text text-transparent">{course.title}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </section>
    </div>
  )
}
