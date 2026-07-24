'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles,
  GraduationCap,
  Users,
  BookOpen,
  IndianRupee,
  TrendingUp,
  ArrowLeft,
  Loader2,
  Sun,
  Moon,
  Presentation,
  BarChart3,
  MessageSquare,
  Upload,
  Video,
  ClipboardList,
  Award,
  Trophy,
  Star,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-bold">{value}</div>
            {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
          </div>
          <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeacherPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('sb_token')
    if (!token) { router.push('/'); return }
    ;(async () => {
      try {
        const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        if (!r.ok) { router.push('/'); return }
        const data = await r.json()
        if (data.user.role !== 'teacher' && !data.user.isAdmin) {
          toast.error('Teacher access required. Please contact admin to promote your account.')
          router.push('/dashboard')
          return
        }
        setUser(data.user)
        const auth = { Authorization: `Bearer ${token}` }
        const [s, c, st] = await Promise.all([
          fetch('/api/teacher/stats', { headers: auth }).then((r) => r.json()),
          fetch('/api/teacher/courses', { headers: auth }).then((r) => r.json()),
          fetch('/api/teacher/students', { headers: auth }).then((r) => r.json()),
        ])
        setStats(s); setCourses(c.courses || []); setStudents(st.students || [])
      } catch { router.push('/') }
      finally { setLoading(false) }
    })()
  }, [router])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  )

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'courses', label: 'My Courses', icon: BookOpen },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'revenue', label: 'Revenue', icon: IndianRupee },
  ]

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[520px] w-[520px] rounded-full bg-teal-500/20 blur-3xl" />
      </div>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Home</span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm font-bold">Teacher Panel</div>
              <Badge className="ml-2 border-0 bg-emerald-500/15 text-emerald-400">Faculty</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"><Button size="sm" variant="ghost">Student View</Button></Link>
            <ThemeToggle />
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'T'}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur">
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {tab === 'overview' && stats && (
          <>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-cyan-900/40 p-6 md:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/30 blur-3xl" />
              <div className="relative">
                <div className="text-sm text-muted-foreground">Welcome back, Professor</div>
                <div className="text-2xl font-bold md:text-3xl">{user?.name} 🎓</div>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage your courses, engage with students, and grow your reach on Shiksha Bharti.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                    <Upload className="mr-2 h-4 w-4" /> Upload New Course
                  </Button>
                  <Button variant="outline" className="border-white/15 bg-white/5">
                    <Video className="mr-2 h-4 w-4" /> Schedule Live Class
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Total Students" value={stats.totalStudents} sub="Registered on platform" gradient="from-blue-500 to-cyan-400" />
              <StatCard icon={BookOpen} label="My Courses" value={stats.totalCourses} sub="Published" gradient="from-emerald-500 to-teal-400" />
              <StatCard icon={ClipboardList} label="Enrollments" value={stats.totalEnrollments} sub={`${stats.completed} completed`} gradient="from-fuchsia-500 to-purple-400" />
              <StatCard icon={IndianRupee} label="Revenue" value={`\u20b9${(stats.revenue || 0).toLocaleString('en-IN')}`} sub="Lifetime earnings" gradient="from-amber-500 to-orange-400" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Users, text: 'New student enrolled in JSSC CGL Course', time: '2 min ago', color: 'from-blue-500 to-cyan-400' },
                    { icon: Trophy, text: 'Ankit Kumar completed JSSC CGL - Certificate issued', time: '15 min ago', color: 'from-amber-500 to-orange-400' },
                    { icon: MessageSquare, text: 'New doubt on Python + AI/ML Bootcamp', time: '1 hour ago', color: 'from-fuchsia-500 to-purple-400' },
                    { icon: Star, text: '5-star review received on Full Stack MERN', time: 'yesterday', color: 'from-emerald-500 to-teal-400' },
                  ].map((a, i) => {
                    const Icon = a.icon
                    return (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${a.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{a.text}</div>
                          <div className="text-xs text-muted-foreground">{a.time}</div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Upload, label: 'Upload Video', color: 'from-blue-500 to-cyan-400' },
                    { icon: ClipboardList, label: 'Create Quiz', color: 'from-fuchsia-500 to-purple-400' },
                    { icon: Video, label: 'Live Class', color: 'from-red-500 to-orange-400' },
                    { icon: MessageSquare, label: 'Messages', color: 'from-emerald-500 to-teal-400' },
                    { icon: Award, label: 'Certificates', color: 'from-amber-500 to-yellow-400' },
                    { icon: BarChart3, label: 'Analytics', color: 'from-indigo-500 to-blue-400' },
                  ].map((q) => {
                    const Icon = q.icon
                    return (
                      <button key={q.label} className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10">
                        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${q.color} text-white shadow-lg`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-xs font-medium">{q.label}</div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {tab === 'courses' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Card key={c.id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur">
                <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${c.color}`}>
                  <Badge className="absolute right-3 top-3 border-0 bg-black/40 text-white backdrop-blur">{c.category}</Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="mb-2 line-clamp-1 font-semibold">{c.title}</h3>
                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="text-muted-foreground">Enrolled</div>
                      <div className="text-lg font-bold">{c.enrolledCount}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="text-muted-foreground">Avg. Progress</div>
                      <div className="text-lg font-bold">{c.avgProgress}%</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">Manage</Button>
                    <Button size="sm" variant="outline" className="border-white/15 bg-white/5"><BarChart3 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === 'students' && (
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader><CardTitle className="text-base">Students ({students.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {students.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No students enrolled yet.</div>
              ) : (
                <div className="divide-y divide-white/10">
                  {students.map((s) => (
                    <div key={s.student.id} className="flex items-start gap-3 p-4 hover:bg-white/5">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                        {s.student.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{s.student.name}</div>
                          <Badge className="border-0 bg-white/10">{s.enrollments.length} courses</Badge>
                        </div>
                        <div className="mb-2 text-xs text-muted-foreground">{s.student.email}</div>
                        <div className="space-y-1">
                          {s.enrollments.map((e) => (
                            <div key={e.id} className="flex items-center gap-2 text-xs">
                              <div className="min-w-0 flex-1 truncate">{e.courseTitle}</div>
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${e.progress}%` }} />
                              </div>
                              <div className="w-10 text-right">{e.progress}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'revenue' && stats && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 backdrop-blur">
                <CardContent className="p-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Total Revenue</div>
                  <div className="mt-2 text-3xl font-bold">\u20b9{(stats.revenue || 0).toLocaleString('en-IN')}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400"><TrendingUp className="h-3 w-3" /> Lifetime earnings</div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="p-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">This Month</div>
                  <div className="mt-2 text-3xl font-bold">\u20b9{Math.round((stats.revenue || 0) * 0.3).toLocaleString('en-IN')}</div>
                  <div className="text-xs text-muted-foreground">30% of lifetime</div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="p-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Payout Balance</div>
                  <div className="mt-2 text-3xl font-bold">\u20b9{Math.round((stats.revenue || 0) * 0.7 * 0.7).toLocaleString('en-IN')}</div>
                  <div className="text-xs text-muted-foreground">After 30% platform fee</div>
                </CardContent>
              </Card>
            </div>
            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader><CardTitle className="text-base">Payout Info</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Payouts are processed on the 1st of every month via bank transfer. Add your payout details in Settings.
                <Button className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">Set Up Payout Method</Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
