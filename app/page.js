'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Sparkles,
  GraduationCap,
  Bot,
  Send,
  Sun,
  Moon,
  Search,
  Award,
  PlayCircle,
  ChevronRight,
  Menu,
  X,
  Zap,
  Cpu,
  Code2,
  Briefcase,
  Landmark,
  Wrench,
  Palette,
  ShieldCheck,
  MessagesSquare,
  Star,
  MapPin,
  Phone,
  Mail,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  CheckCircle2,
  Loader2,
  Rocket,
  User,
  LogOut,
  Lock,
  UserPlus,
  LogIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

const NAV_ITEMS = ['Home', 'Courses', 'Live Classes', 'Jharkhand', 'Programming', 'AI Learning', 'Placements', 'Blog', 'Contact']

const CATEGORIES = [
  { icon: Landmark, title: 'Jharkhand Govt. Exams', color: 'from-blue-500 to-cyan-400', items: ['JSSC', 'JPSC', 'Jharkhand Police', 'Forest Guard', 'Excise Constable', 'JTET', 'High Court'] },
  { icon: Wrench, title: 'ITI Trades', color: 'from-orange-500 to-amber-400', items: ['Electrician', 'Fitter', 'Welder', 'COPA', 'Diesel Mechanic', 'Solar Technician', 'IoT', 'AI Technician'] },
  { icon: Code2, title: 'Programming', color: 'from-emerald-500 to-teal-400', items: ['Python', 'Java', 'JavaScript', 'React', 'Next.js', 'Full Stack', 'Flutter', 'Android Dev'] },
  { icon: Cpu, title: 'AI & Data Science', color: 'from-purple-500 to-fuchsia-400', items: ['Machine Learning', 'Deep Learning', 'Generative AI', 'ChatGPT & Prompt Eng.', 'Data Science', 'Power BI'] },
  { icon: GraduationCap, title: 'School (1-12)', color: 'from-pink-500 to-rose-400', items: ['JAC Board', 'CBSE', 'ICSE', 'NTSE', 'Olympiad', 'Foundation JEE/NEET'] },
  { icon: Briefcase, title: 'Career & Skills', color: 'from-indigo-500 to-blue-400', items: ['Spoken English', 'Digital Marketing', 'Tally Prime', 'Advanced Excel', 'Resume Building', 'Interview Prep'] },
  { icon: Palette, title: 'Design & Media', color: 'from-yellow-500 to-orange-400', items: ['Photoshop', 'Illustrator', 'Canva', 'Premiere Pro', 'After Effects', 'UI/UX'] },
  { icon: ShieldCheck, title: 'Competitive Exams', color: 'from-red-500 to-rose-500', items: ['SSC CGL', 'SSC GD', 'Railway RRB', 'Banking', 'UPSC', 'NEET', 'JEE Main', 'GATE', 'Agniveer'] },
]

const COURSES = [
  { id: 'jssc-cgl-2025', title: 'JSSC CGL - Complete Mastery', tag: 'Jharkhand', price: '\u20b92,499', original: '\u20b96,999', rating: 4.9, students: '18,420', hours: 220, color: 'from-blue-600 via-indigo-600 to-purple-600' },
  { id: 'python-ai-ml', title: 'Python + AI/ML Bootcamp', tag: 'Trending', price: '\u20b93,999', original: '\u20b99,999', rating: 4.8, students: '32,110', hours: 180, color: 'from-emerald-500 via-teal-600 to-cyan-600' },
  { id: 'iti-electrician', title: 'ITI Electrician - Full Course', tag: 'Job Ready', price: '\u20b91,499', original: '\u20b94,999', rating: 4.9, students: '11,800', hours: 120, color: 'from-orange-500 via-amber-500 to-yellow-500' },
  { id: 'fullstack-mern', title: 'Full Stack Web Dev (MERN + Next.js)', tag: 'Placement', price: '\u20b94,999', original: '\u20b912,999', rating: 4.9, students: '24,700', hours: 260, color: 'from-fuchsia-500 via-purple-600 to-indigo-600' },
  { id: 'jpsc-2025', title: 'JPSC Prelims + Mains - 2025', tag: 'Jharkhand', price: '\u20b95,499', original: '\u20b914,999', rating: 4.8, students: '9,340', hours: 320, color: 'from-rose-500 via-pink-600 to-red-600' },
  { id: 'genai-prompt', title: 'Generative AI + Prompt Engineering', tag: 'New', price: '\u20b91,999', original: '\u20b95,999', rating: 4.9, students: '7,220', hours: 60, color: 'from-cyan-500 via-blue-600 to-indigo-700' },
]

const TESTIMONIALS = [
  { name: 'Ankit Kumar', from: 'Ranchi, Jharkhand', text: 'Bharti AI tutor ne mujhe JSSC CGL ke doubts 2 min me clear karwa diye. Selection ho gaya!', rating: 5 },
  { name: 'Priya Sharma', from: 'Dhanbad, Jharkhand', text: 'Full Stack course + live doubt sessions are gold. Placed at a startup in Bengaluru at \u20b96 LPA.', rating: 5 },
  { name: 'Rohit Mahto', from: 'Hazaribagh', text: 'ITI Electrician course helped me start my own shop. Hindi + English mix teaching is perfect.', rating: 5 },
]

// --- AUTH HOOK ---
function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null
    if (!t) { setLoading(false); return }
    setToken(t)
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.user) setUser(data.user); else { localStorage.removeItem('sb_token'); setToken(null) } })
      .finally(() => setLoading(false))
  }, [])

  const login = (t, u) => {
    localStorage.setItem('sb_token', t)
    setToken(t); setUser(u)
  }
  const logout = () => {
    localStorage.removeItem('sb_token')
    setToken(null); setUser(null)
  }
  return { user, token, loading, login, logout }
}

// --- AUTH DIALOG ---
function AuthDialog({ open, onOpenChange, onAuth, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab)
  useEffect(() => { setTab(defaultTab) }, [defaultTab, open])
  const [loading, setLoading] = useState(false)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [reg, setReg] = useState({ name: '', email: '', password: '', role: 'student' })

  async function submitLogin(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Login failed')
      onAuth(d.token, d.user)
      toast.success(`Welcome back, ${d.user.name}!`)
      onOpenChange(false)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  async function submitRegister(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Registration failed')
      onAuth(d.token, d.user)
      toast.success(`Welcome to Shiksha Bharti, ${d.user.name}!`)
      onOpenChange(false)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-white/10 bg-background/95 p-0 backdrop-blur-xl">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-500" />
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogHeader className="p-0">
                  <DialogTitle className="text-base">Welcome to Shiksha Bharti</DialogTitle>
                </DialogHeader>
                <div className="text-xs text-muted-foreground">Learn Today. Build Tomorrow.</div>
              </div>
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4" />Login</TabsTrigger>
                <TabsTrigger value="register"><UserPlus className="mr-2 h-4 w-4" />Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <form onSubmit={submitLogin} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} placeholder="you@example.com" className="pl-9 bg-white/5" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} placeholder="••••••" className="pl-9 bg-white/5" />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    New here?{' '}
                    <button type="button" onClick={() => setTab('register')} className="text-foreground underline underline-offset-4">Create an account</button>
                  </p>
                </form>
              </TabsContent>
              <TabsContent value="register" className="mt-4">
                <form onSubmit={submitRegister} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">I want to join as</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setReg({ ...reg, role: 'student' })}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-sm transition ${reg.role === 'student' ? 'border-fuchsia-500/50 bg-fuchsia-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-fuchsia-500 text-white">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold">Student</div>
                          <div className="text-[10px] text-muted-foreground">Learn & get certified</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReg({ ...reg, role: 'teacher' })}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-sm transition ${reg.role === 'teacher' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold">Teacher</div>
                          <div className="text-[10px] text-muted-foreground">Teach & earn</div>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Full name</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input required value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} placeholder="Your name" className="pl-9 bg-white/5" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" required value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} placeholder="you@example.com" className="pl-9 bg-white/5" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Password (min 6 chars)</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" required minLength={6} value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} placeholder="••••••" className="pl-9 bg-white/5" />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create free account'}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('login')} className="text-foreground underline underline-offset-4">Login</button>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Portals({ user, onOpenAuth }) {
  const cards = [
    {
      role: 'student',
      title: 'Student Portal',
      subtitle: 'Learn & Grow',
      description: 'Enrollments, live classes, AI Tutor, certificates, achievements & leaderboard.',
      icon: User,
      href: user ? '/dashboard' : null,
      color: 'from-blue-500 via-indigo-500 to-purple-500',
      shadow: 'shadow-blue-500/30',
      badge: user && !user.isAdmin && (user.role === 'student' || !user.role) ? 'You' : null,
    },
    {
      role: 'teacher',
      title: 'Teacher Portal',
      subtitle: 'Teach & Earn',
      description: 'Upload courses, host live classes, manage students, track revenue.',
      icon: GraduationCap,
      href: user ? '/teacher' : null,
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      shadow: 'shadow-emerald-500/30',
      badge: user?.role === 'teacher' ? 'You' : null,
    },
    {
      role: 'admin',
      title: 'Admin Panel',
      subtitle: 'Manage Platform',
      description: 'Full control over users, courses, enrollments, leads, AI chats & analytics.',
      icon: ShieldCheck,
      href: user ? '/admin' : null,
      color: 'from-fuchsia-500 via-purple-500 to-pink-500',
      shadow: 'shadow-fuchsia-500/30',
      badge: user?.isAdmin ? 'You' : null,
    },
  ]

  function handleClick(card, e) {
    if (!user) {
      e.preventDefault()
      onOpenAuth('login')
      return
    }
    // If logged in but wrong role, show info
    if (card.role === 'teacher' && !user.isAdmin && user.role !== 'teacher') {
      e.preventDefault()
      toast.info('Teacher access required', {
        description: 'Register as Teacher, or ask admin to promote your account.',
      })
      return
    }
    if (card.role === 'admin' && !user.isAdmin) {
      e.preventDefault()
      toast.info('Admin access required', {
        description: 'Only the platform admin can access this panel.',
      })
      return
    }
  }

  return (
    <section id="portals" className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <Badge className="mb-3 border-white/10 bg-white/5">Login Portals</Badge>
          <h2 className="text-3xl font-bold md:text-4xl">Choose your gateway</h2>
          <p className="mt-2 text-muted-foreground">Aap Student, Teacher ya Admin - sab ke liye alag experience.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon
            const href = c.href || '#portals'
            return (
              <a
                key={c.role}
                href={href}
                onClick={(e) => handleClick(c, e)}
                className="block"
              >
                <Card className="group relative h-full overflow-hidden border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/10 cursor-pointer">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.color} opacity-90`} />
                  <div className={`pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${c.color} opacity-30 blur-3xl transition group-hover:opacity-50`} />
                  <CardContent className="relative p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-xl ${c.shadow}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {c.badge && <Badge className="bg-emerald-500/15 text-emerald-400">{c.badge}</Badge>}
                    </div>
                    <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">{c.subtitle}</div>
                    <h3 className="mb-2 text-xl font-bold">{c.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{c.description}</p>
                    <div className={`inline-flex items-center gap-1 text-sm font-medium bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>
                      {user ? 'Open Portal' : 'Login / Register'} <ChevronRight className="h-4 w-4 text-fuchsia-400" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
        {!user && (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <span className="opacity-70">Note: To promote a user to Teacher/Admin role, login as admin at <code className="rounded bg-white/5 px-1.5 py-0.5">admin@shikshabharti.in</code>.</span>
          </div>
        )}
      </div>
    </section>
  )
}

function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-500/30 blur-3xl animate-pulse" />
      <div className="absolute -top-20 right-0 h-[520px] w-[520px] rounded-full bg-purple-500/30 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10" aria-label="Toggle theme">
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

function Counter({ to, suffix = '', duration = 1600 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.floor(eased * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <span ref={ref}>{n.toLocaleString('en-IN')}{suffix}</span>
}

function Navbar({ onOpenTutor, user, onOpenAuth, onLogout }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-background/70 backdrop-blur-xl' : 'bg-transparent'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#home" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide">SHIKSHA BHARTI</div>
            <div className="text-[10px] text-muted-foreground">Learn Today. Build Tomorrow.</div>
          </div>
        </a>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((n) => (
            <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, '-')}`} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">{n}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button onClick={onOpenTutor} size="sm" className="hidden bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-fuchsia-600 md:inline-flex">
            <Bot className="mr-2 h-4 w-4" /> Ask AI Tutor
          </Button>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 backdrop-blur hover:bg-white/10"
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden text-sm md:inline">{user.name?.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-background/95 shadow-xl backdrop-blur-xl">
                  <div className="border-b border-white/10 p-3">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <a href="/dashboard" className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5">
                    <User className="h-4 w-4" /> Student Dashboard
                  </a>
                  {(user.role === 'teacher' || user.isAdmin) && (
                    <a href="/teacher" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-white/5">
                      <GraduationCap className="h-4 w-4" /> Teacher Panel
                    </a>
                  )}
                  {user.isAdmin && (
                    <a href="/admin" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-fuchsia-400 hover:bg-white/5">
                      <Sparkles className="h-4 w-4" /> Admin Panel
                    </a>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); onLogout() }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button onClick={() => onOpenAuth('login')} size="sm" variant="ghost" className="hidden md:inline-flex">
                Login
              </Button>
              <Button onClick={() => onOpenAuth('register')} size="sm" variant="outline" className="hidden border-white/15 bg-white/5 backdrop-blur md:inline-flex">
                Register
              </Button>
            </>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
            {NAV_ITEMS.map((n) => (
              <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-white/5">{n}</a>
            ))}
            {!user && (
              <div className="mt-2 flex gap-2">
                <Button onClick={() => { setOpen(false); onOpenAuth('login') }} variant="outline" className="flex-1 border-white/15 bg-white/5">Login</Button>
                <Button onClick={() => { setOpen(false); onOpenAuth('register') }} className="flex-1 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white">Register</Button>
              </div>
            )}
            <Button onClick={() => { setOpen(false); onOpenTutor() }} className="mt-2 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white">
              <Bot className="mr-2 h-4 w-4" /> Ask AI Tutor
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

function AITutorDialog({ open, onOpenChange }) {
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Namaste! Main Bharti hoon - aapki AI Tutor.\n\nAap koi bhi doubt puchh sakte hain: JSSC/JPSC, Programming, AI, ITI, NEET/JEE, ya spoken English.\n\nHindi, English, ya Hinglish - jaisi bhi bhaasha ho - boliye!" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI error')
      if (data.sessionId) setSessionId(data.sessionId)
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (e) {
      toast.error('AI Tutor error', { description: e.message })
      setMessages([...next, { role: 'assistant', content: 'Sorry, I hit a snag. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = ['JSSC CGL syllabus 2025 in Hindi', 'Explain photosynthesis simply', 'Python me list vs tuple kya hai?', 'Write a resume for BCA fresher']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden border-white/10 bg-background/95 p-0 backdrop-blur-xl">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-500" />
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-base font-semibold">Bharti - Your AI Tutor</div>
                <div className="text-xs text-muted-foreground">Hindi &middot; English &middot; Hinglish</div>
              </div>
              <Badge className="ml-auto bg-emerald-500/15 text-emerald-400">Online</Badge>
            </DialogTitle>
          </DialogHeader>
          <div ref={scrollRef} className="max-h-[52vh] overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'border border-white/10 bg-white/5 text-foreground backdrop-blur'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-muted-foreground backdrop-blur">
                    <Loader2 className="h-4 w-4 animate-spin" /> Bharti is thinking...
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-white/10 px-6 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-white/10 hover:text-foreground">{s}</button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} rows={1} placeholder="Ask anything... (Hindi / English)" className="max-h-32 min-h-[44px] resize-none bg-white/5" />
              <Button onClick={send} disabled={loading || !input.trim()} className="h-11 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Hero({ onOpenTutor }) {
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <Aurora />
      <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs backdrop-blur">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500">
              <Zap className="h-3 w-3 text-white" />
            </span>
            India&apos;s first AI-Powered EdTech for Jharkhand &amp; Beyond
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Learn Today.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">Build Tomorrow.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Master JSSC, JPSC, ITI, Programming, AI &amp; more - with live classes, downloadable notes, and a 24x7 <span className="font-semibold text-foreground">AI Tutor</span> that speaks Hindi, English &amp; Hinglish.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={onOpenTutor} size="lg" className="group h-12 bg-gradient-to-r from-blue-500 to-fuchsia-500 px-6 text-white shadow-xl shadow-blue-500/30 hover:from-blue-600 hover:to-fuchsia-600">
              <Bot className="mr-2 h-5 w-5" /> Try AI Tutor - Free
              <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-white/15 bg-white/5 px-6 backdrop-blur hover:bg-white/10" onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}>
              <PlayCircle className="mr-2 h-5 w-5" /> Explore Courses
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[
              { n: 100000, s: '+', l: 'Students' },
              { n: 500, s: '+', l: 'Courses' },
              { n: 1000, s: '+', l: 'Live Classes' },
              { n: 250, s: '+', l: 'Mentors' },
              { n: 98, s: '%', l: 'Satisfaction' },
            ].map((it) => (
              <div key={it.l} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur transition hover:bg-white/10">
                <div className="text-xl font-bold md:text-2xl"><Counter to={it.n} suffix={it.s} /></div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{it.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative lg:col-span-5">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/40 via-fuchsia-500/30 to-purple-500/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
              <img src="https://images.pexels.com/photos/7972949/pexels-photo-7972949.jpeg" alt="Students learning" className="h-[420px] w-full rounded-2xl object-cover" />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -left-6 top-8 flex items-center gap-2 rounded-2xl border border-white/15 bg-background/80 px-3 py-2 shadow-xl backdrop-blur">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold">Selected in JSSC</div>
                  <div className="text-muted-foreground">2 min ago &middot; Ranchi</div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-4 bottom-10 flex items-center gap-2 rounded-2xl border border-white/15 bg-background/80 px-3 py-2 shadow-xl backdrop-blur">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold">AI Tutor Bharti</div>
                  <div className="text-muted-foreground">24x7 doubt solver</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Categories() {
  return (
    <section id="courses" className="relative py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Badge className="mb-3 border-white/10 bg-white/5 text-foreground">Explore</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Categories built for India &amp; Jharkhand</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">From JAC school syllabus and ITI trades to JSSC/JPSC prep, coding, and Generative AI - all under one premium platform.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search e.g. JSSC, Python, ITI..." className="pl-9 bg-white/5" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon
            return (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}>
                <Card className="group relative h-full overflow-hidden border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.color} opacity-80`} />
                  <CardHeader className="pb-2">
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {c.items.slice(0, 5).map((it) => (
                        <span key={it} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">{it}</span>
                      ))}
                      {c.items.length > 5 && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">+{c.items.length - 5} more</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CourseGrid({ onOpenTutor, user, onEnroll, onLogin, enrolledIds }) {
  return (
    <section id="live-classes" className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Badge className="mb-3 border-white/10 bg-white/5">Top Rated</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Popular courses</h2>
          </div>
          <a href="/dashboard" className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex">Go to dashboard <ChevronRight className="ml-1 h-4 w-4 inline" /></a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c, i) => {
            const isEnrolled = enrolledIds?.has(c.id)
            return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <Card className="group h-full overflow-hidden border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
                <a href={`/courses/${c.id}`}>
                  <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${c.color} cursor-pointer`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_40%)]" />
                    <Badge className="absolute right-3 top-3 border-0 bg-black/40 text-white backdrop-blur">{c.tag}</Badge>
                    {isEnrolled && (
                      <Badge className="absolute left-3 top-3 border-0 bg-emerald-500/90 text-white backdrop-blur">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Enrolled
                      </Badge>
                    )}
                    <div className="absolute bottom-3 left-3 text-xs text-white/90">{c.hours}+ hours &middot; Certified</div>
                  </div>
                </a>
                <CardContent className="p-5">
                  <a href={`/courses/${c.id}`}>
                    <h3 className="mb-2 line-clamp-2 text-base font-semibold hover:text-fuchsia-400 cursor-pointer">{c.title}</h3>
                  </a>
                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{c.rating}</span>
                    <span>&middot;</span>
                    <span>{c.students} learners</span>
                  </div>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-xl font-bold">{c.price}</span>
                    <span className="text-xs text-muted-foreground line-through">{c.original}</span>
                    <Badge className="bg-emerald-500/15 text-emerald-400">64% off</Badge>
                  </div>
                  <div className="flex gap-2">
                    {isEnrolled ? (
                      <a href="/dashboard" className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
                          <PlayCircle className="mr-1.5 h-4 w-4" /> Continue Learning
                        </Button>
                      </a>
                    ) : (
                      <Button
                        onClick={() => user ? onEnroll(c) : onLogin('login')}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600"
                      >
                        Enroll Now
                      </Button>
                    )}
                    <Button variant="outline" className="border-white/15 bg-white/5" onClick={onOpenTutor}><Bot className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  )
}

function AIStrip({ onOpenTutor }) {
  const feats = [
    { icon: Bot, t: 'AI Tutor', d: 'Ask doubts in Hindi/English 24x7' },
    { icon: MessagesSquare, t: 'AI Chatbot', d: 'Instant support & course guidance' },
    { icon: Code2, t: 'AI Code Reviewer', d: 'Get feedback on your programs' },
    { icon: Rocket, t: 'AI Roadmap', d: 'Personal career & study roadmap' },
    { icon: Award, t: 'AI Quiz Gen', d: 'Practice with unlimited MCQs' },
    { icon: Cpu, t: 'AI Notes', d: 'Auto notes from any lecture' },
  ]
  return (
    <section id="ai-learning" className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-fuchsia-900/40 p-8 backdrop-blur">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-3 border-white/10 bg-white/10">AI-Powered Learning</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">
                A tutor that never sleeps.<br />
                Powered by <span className="bg-gradient-to-r from-blue-300 to-fuchsia-300 bg-clip-text text-transparent">GPT-class AI</span>.
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">Bharti explains concepts, solves problems step-by-step, generates quizzes, reviews your code, and even builds a personal study roadmap - all inside one seamless dashboard.</p>
              <div className="mt-6 flex gap-3">
                <Button size="lg" onClick={onOpenTutor} className="bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600">
                  <Sparkles className="mr-2 h-4 w-4" /> Try AI Tutor Free
                </Button>
                <Button size="lg" variant="outline" className="border-white/15 bg-white/5">
                  <PlayCircle className="mr-2 h-4 w-4" /> Watch Demo
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {feats.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.t} className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10">
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-fuchsia-500 text-white shadow-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-semibold">{f.t}</div>
                    <div className="text-xs text-muted-foreground">{f.d}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="placements" className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <Badge className="mb-3 border-white/10 bg-white/5">Success Stories</Badge>
          <h2 className="text-3xl font-bold md:text-4xl">Students who built their tomorrow</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Card className="h-full border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-sm font-bold text-white">{t.name[0]}</div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.from}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  const [form, setForm] = useState({ name: '', phone: '', course: '' })
  const [loading, setLoading] = useState(false)
  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.phone) { toast.error('Please enter your name and phone'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!r.ok) throw new Error('Failed')
      toast.success('Thanks! Our team will call you shortly.')
      setForm({ name: '', phone: '', course: '' })
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }
  return (
    <section id="contact" className="relative py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-fuchsia-600/20 p-8 backdrop-blur md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.25),transparent_50%)]" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Ready to build your tomorrow?</h2>
              <p className="mt-3 max-w-lg text-muted-foreground">Get a free demo class, a personalized study roadmap, and \u20b9500 wallet credit for your first course. Fill this in 30 seconds.</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free demo</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> AI Tutor access</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Placement support</span>
              </div>
            </div>
            <form onSubmit={submit} className="space-y-3 rounded-2xl border border-white/10 bg-background/60 p-5 backdrop-blur">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="bg-white/5" />
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (WhatsApp)" className="bg-white/5" />
              <Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="Course you're interested in (e.g. JSSC, Python)" className="bg-white/5" />
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Free Demo'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/60 py-10 backdrop-blur">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-fuchsia-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold">SHIKSHA BHARTI</div>
              <div className="text-[10px] text-muted-foreground">Learn Today. Build Tomorrow.</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">India&apos;s AI-powered EdTech platform - built with love for Jharkhand and every learner across Bharat.</p>
          <div className="mt-4 flex gap-2">
            {[Youtube, Instagram, Facebook, Twitter].map((Ic, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10">
                <Ic className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Learn</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Programming</li><li>AI &amp; Data Science</li><li>ITI Trades</li><li>JSSC / JPSC</li><li>NEET / JEE</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Platform</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Live Classes</li><li>Certificates</li><li>Placements</li><li>Blog</li><li>Careers</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Ranchi, Jharkhand</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 90000 00000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@shikshabharti.in</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 px-4 pt-6 text-xs text-muted-foreground md:flex-row">
        <div>&copy; {new Date().getFullYear()} Shiksha Bharti (Avix Nexa). All rights reserved.</div>
        <div className="flex gap-4"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Refund</a></div>
      </div>
    </footer>
  )
}

function FloatingAI({ onClick }) {
  return (
    <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, type: 'spring' }} onClick={onClick} className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 shadow-2xl shadow-fuchsia-500/40 transition hover:scale-110" aria-label="Open AI Tutor">
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-fuchsia-500/40" />
      <Bot className="h-6 w-6 text-white" />
    </motion.button>
  )
}

function App() {
  const [tutorOpen, setTutorOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [enrolledIds, setEnrolledIds] = useState(new Set())
  const auth = useAuth()

  const openAuth = (tab = 'login') => { setAuthTab(tab); setAuthOpen(true) }

  // Fetch enrollments when user changes
  useEffect(() => {
    if (!auth.token) { setEnrolledIds(new Set()); return }
    fetch('/api/enrollments', { headers: { Authorization: `Bearer ${auth.token}` } })
      .then((r) => r.ok ? r.json() : { enrollments: [] })
      .then((d) => setEnrolledIds(new Set((d.enrollments || []).map((e) => e.courseId))))
      .catch(() => {})
  }, [auth.token])

  async function enrollCourse(course) {
    if (!auth.user) { openAuth('login'); return }
    // Open Razorpay checkout
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

      // Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ courseId: course.id }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || 'Order failed')

      // Open checkout
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Shiksha Bharti',
        description: orderData.course.title,
        order_id: orderData.orderId,
        image: '/favicon.ico',
        prefill: { name: orderData.user.name, email: orderData.user.email },
        theme: { color: '#8b5cf6' },
        handler: async (response) => {
          try {
            const v = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course.id,
              }),
            })
            const vd = await v.json()
            if (!v.ok) throw new Error(vd.error || 'Verification failed')
            setEnrolledIds((s) => new Set([...s, course.id]))
            toast.success(`\ud83c\udf89 Payment successful! Enrolled in ${course.title}`, {
              description: `Payment ID: ${response.razorpay_payment_id}`,
              action: { label: 'Go to Dashboard', onClick: () => { window.location.href = '/dashboard' } },
            })
          } catch (e) {
            toast.error('Payment verification failed', { description: e.message })
          }
        },
        modal: {
          ondismiss: () => toast.info('Payment cancelled'),
        },
      })
      rzp.on('payment.failed', (resp) => {
        toast.error('Payment failed', { description: resp.error?.description || 'Please try again' })
      })
      rzp.open()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Navbar
        onOpenTutor={() => setTutorOpen(true)}
        user={auth.user}
        onOpenAuth={openAuth}
        onLogout={() => { auth.logout(); setEnrolledIds(new Set()); toast.success('Signed out') }}
      />
      <Hero onOpenTutor={() => setTutorOpen(true)} />
      <Categories />
      <CourseGrid
        onOpenTutor={() => setTutorOpen(true)}
        user={auth.user}
        onEnroll={enrollCourse}
        onLogin={openAuth}
        enrolledIds={enrolledIds}
      />
      <Portals user={auth.user} onOpenAuth={openAuth} />
      <AIStrip onOpenTutor={() => setTutorOpen(true)} />
      <Testimonials />
      <CTA />
      <Footer />
      <FloatingAI onClick={() => setTutorOpen(true)} />
      <AITutorDialog open={tutorOpen} onOpenChange={setTutorOpen} />
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
        onAuth={(t, u) => auth.login(t, u)}
      />
    </div>
  )
}

export default App
