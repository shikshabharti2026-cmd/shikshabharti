'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Bot,
  BookOpen,
  Trophy,
  Award,
  Wallet,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  PlayCircle,
  Home,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  Star,
  Users,
  Loader2,
  Zap,
  ArrowLeft,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10">
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -top-20 right-0 h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
    </div>
  )
}

function Sidebar({ active, onSelect, user, onLogout }) {
  const items = [
    { key: 'overview', label: 'Overview', icon: Home },
    { key: 'courses', label: 'My Courses', icon: BookOpen },
    { key: 'certificates', label: 'Certificates', icon: Award },
    { key: 'achievements', label: 'Achievements', icon: Trophy },
    { key: 'wallet', label: 'Wallet', icon: Wallet },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-white/10 bg-background/40 p-4 backdrop-blur lg:flex">
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-lg font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user?.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const Icon = it.icon
          const isActive = active === it.key
          return (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-fuchsia-500/20 text-foreground shadow-inner'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-fuchsia-400' : ''}`} />
              {it.label}
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
            </button>
          )
        })}
      </nav>
      <button onClick={onLogout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-400 hover:bg-white/5">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </aside>
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

function ContinueLearningCard({ enrollment, onOpen, onProgress }) {
  const progress = enrollment.progress || 0
  const completed = progress >= 100
  return (
    <Card className="group overflow-hidden border-white/10 bg-white/5 backdrop-blur">
      <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${enrollment.courseColor || 'from-blue-600 to-fuchsia-600'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_40%)]" />
        {completed && (
          <Badge className="absolute right-3 top-3 border-0 bg-emerald-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )}
      </div>
      <CardContent className="p-5">
        <h3 className="mb-1 line-clamp-1 text-base font-semibold">{enrollment.courseTitle}</h3>
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {enrollment.courseHours} hours
          <span>&middot;</span>
          <span>Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
        </div>
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onProgress(enrollment, Math.min(100, progress + 15))} className="flex-1 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600">
            <PlayCircle className="mr-1.5 h-4 w-4" />
            {completed ? 'Review' : progress > 0 ? 'Continue' : 'Start'}
          </Button>
          {completed && (
            <Button size="sm" variant="outline" className="border-white/15 bg-white/5" onClick={() => onOpen(enrollment)}>
              <Award className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CertificateCard({ enrollment, userName }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className={`relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br ${enrollment.courseColor || 'from-blue-600 to-fuchsia-600'} p-1`}>
        <div className="rounded-xl bg-background/80 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-fuchsia-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Shiksha Bharti</div>
                <div className="text-[10px] text-muted-foreground">Certificate of Completion</div>
              </div>
            </div>
            <Award className="h-7 w-7 text-amber-400" />
          </div>
          <div className="my-5 text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">This certifies that</div>
            <div className="mt-1 text-2xl font-bold">{userName}</div>
            <div className="mt-1 text-xs text-muted-foreground">has successfully completed</div>
            <div className="mt-1 text-lg font-semibold bg-gradient-to-r from-blue-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">{enrollment.courseTitle}</div>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-muted-foreground">
            <div>ID: SB-{enrollment.id.slice(0, 8).toUpperCase()}</div>
            <div>{new Date(enrollment.completedAt || enrollment.enrolledAt).toLocaleDateString('en-IN')}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AchievementsBoard({ enrollments }) {
  const completed = enrollments.filter((e) => (e.progress || 0) >= 100).length
  const total = enrollments.length
  const badges = [
    { name: 'First Steps', desc: 'Enrolled in your first course', unlocked: total >= 1, icon: Zap, color: 'from-blue-500 to-cyan-400' },
    { name: 'Committed', desc: 'Enrolled in 3+ courses', unlocked: total >= 3, icon: Target, color: 'from-emerald-500 to-teal-400' },
    { name: 'Achiever', desc: 'Completed 1 course', unlocked: completed >= 1, icon: Trophy, color: 'from-amber-500 to-orange-400' },
    { name: 'Scholar', desc: 'Completed 5 courses', unlocked: completed >= 5, icon: GraduationCap, color: 'from-fuchsia-500 to-purple-400' },
    { name: 'On Fire', desc: '3-day learning streak', unlocked: true, icon: Flame, color: 'from-red-500 to-rose-400' },
    { name: 'Top Rated', desc: '5-star course rating', unlocked: false, icon: Star, color: 'from-yellow-500 to-orange-400' },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((b) => {
        const Icon = b.icon
        return (
          <Card key={b.name} className={`overflow-hidden border-white/10 bg-white/5 backdrop-blur transition ${b.unlocked ? '' : 'opacity-40 grayscale'}`}>
            <CardContent className="p-5">
              <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${b.color} text-white shadow-lg`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold">{b.name}</div>
              <div className="text-xs text-muted-foreground">{b.desc}</div>
              {b.unlocked && <Badge className="mt-3 bg-emerald-500/15 text-emerald-400">Unlocked</Badge>}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState('overview')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('sb_token')
    if (!token) { router.push('/'); return }
    ;(async () => {
      try {
        const [meRes, enRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/enrollments', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (!meRes.ok) { localStorage.removeItem('sb_token'); router.push('/'); return }
        const meData = await meRes.json()
        const enData = enRes.ok ? await enRes.json() : { enrollments: [] }
        setUser(meData.user)
        setEnrollments(enData.enrollments || [])
      } catch (e) {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  async function updateProgress(enrollment, newProgress) {
    const token = localStorage.getItem('sb_token')
    try {
      const r = await fetch('/api/enrollments/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enrollmentId: enrollment.id, progress: newProgress }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setEnrollments((prev) => prev.map((e) => e.id === enrollment.id ? { ...e, progress: d.progress, ...(d.progress >= 100 ? { status: 'completed', completedAt: new Date().toISOString() } : {}) } : e))
      if (d.progress >= 100) toast.success('\ud83c\udf89 Course completed! Certificate unlocked.')
      else toast.success(`Progress updated to ${d.progress}%`)
    } catch (e) { toast.error(e.message) }
  }

  function logout() {
    localStorage.removeItem('sb_token')
    toast.success('Signed out')
    router.push('/')
  }

  const stats = useMemo(() => {
    const total = enrollments.length
    const done = enrollments.filter((e) => (e.progress || 0) >= 100).length
    const active = total - done
    const totalHours = enrollments.reduce((a, e) => a + (e.courseHours || 0), 0)
    const avgProgress = total ? Math.round(enrollments.reduce((a, e) => a + (e.progress || 0), 0) / total) : 0
    return { total, done, active, totalHours, avgProgress }
  }, [enrollments])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Home</span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-fuchsia-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm font-bold">Student Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="hidden md:inline-flex">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex px-0 lg:px-4">
        <Sidebar active={active} onSelect={setActive} user={user} onLogout={logout} />

        <main className="min-w-0 flex-1 p-4 lg:p-8">
          {/* Mobile tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {['overview', 'courses', 'certificates', 'achievements', 'wallet'].map((k) => (
              <button key={k} onClick={() => setActive(k)} className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs capitalize ${active === k ? 'border-fuchsia-500/50 bg-fuchsia-500/10' : 'border-white/10 bg-white/5'}`}>{k}</button>
            ))}
          </div>

          {active === 'overview' && (
            <>
              {/* Welcome banner */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-fuchsia-900/40 p-6 md:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-500/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl" />
                <div className="relative">
                  <div className="text-sm text-muted-foreground">Welcome back,</div>
                  <div className="text-2xl font-bold md:text-3xl">{user?.name} 👋</div>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">You&apos;re on a roll! Keep learning to unlock certificates and climb the leaderboard.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/#courses">
                      <Button className="bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white hover:from-blue-600 hover:to-fuchsia-600">
                        <BookOpen className="mr-2 h-4 w-4" /> Explore Courses
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-white/15 bg-white/5" onClick={() => router.push('/#ai-learning')}>
                      <Bot className="mr-2 h-4 w-4" /> Ask AI Tutor
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={BookOpen} label="Enrolled" value={stats.total} sub={`${stats.active} active`} gradient="from-blue-500 to-cyan-400" />
                <StatCard icon={Trophy} label="Completed" value={stats.done} sub={`${stats.done} certificates`} gradient="from-amber-500 to-orange-400" />
                <StatCard icon={Clock} label="Learning Hours" value={stats.totalHours} sub="Content available" gradient="from-emerald-500 to-teal-400" />
                <StatCard icon={Target} label="Avg. Progress" value={`${stats.avgProgress}%`} sub="Across enrolled" gradient="from-fuchsia-500 to-purple-400" />
              </div>

              {/* Continue learning */}
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Continue Learning</h2>
                  <button onClick={() => setActive('courses')} className="text-xs text-muted-foreground hover:text-foreground">See all <ChevronRight className="inline h-3 w-3" /></button>
                </div>
                {enrollments.length === 0 ? (
                  <Card className="border-white/10 bg-white/5 backdrop-blur">
                    <CardContent className="p-10 text-center">
                      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-fuchsia-500">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-lg font-semibold">No courses yet</div>
                      <p className="mt-1 text-sm text-muted-foreground">Enroll in your first course to start learning.</p>
                      <Link href="/#courses">
                        <Button className="mt-4 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white">Browse Courses</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {enrollments.slice(0, 6).map((e) => (
                      <ContinueLearningCard key={e.id} enrollment={e} onProgress={updateProgress} onOpen={() => setActive('certificates')} />
                    ))}
                  </div>
                )}
              </div>

              {/* Leaderboard preview */}
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4 text-amber-400" /> Weekly Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { rank: 1, name: 'Ankit Kumar', points: 1240, region: 'Ranchi' },
                    { rank: 2, name: 'Priya Sharma', points: 1180, region: 'Dhanbad' },
                    { rank: 3, name: 'Rohit Mahto', points: 1050, region: 'Hazaribagh' },
                    { rank: 4, name: user?.name || 'You', points: 820, region: 'You' },
                  ].map((r) => (
                    <div key={r.rank} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${r.region === 'You' ? 'border-fuchsia-500/40 bg-fuchsia-500/10' : 'border-white/10 bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${r.rank === 1 ? 'bg-amber-500 text-black' : r.rank === 2 ? 'bg-slate-300 text-black' : r.rank === 3 ? 'bg-orange-600 text-white' : 'bg-white/10'}`}>
                          {r.rank}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.region}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-fuchsia-400">{r.points} pts</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {active === 'courses' && (
            <>
              <h2 className="mb-4 text-xl font-semibold">My Courses</h2>
              {enrollments.length === 0 ? (
                <Card className="border-white/10 bg-white/5 backdrop-blur">
                  <CardContent className="p-10 text-center">
                    <div className="text-sm text-muted-foreground">No enrollments yet.</div>
                    <Link href="/#courses"><Button className="mt-4 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white">Browse Courses</Button></Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {enrollments.map((e) => (
                    <ContinueLearningCard key={e.id} enrollment={e} onProgress={updateProgress} onOpen={() => setActive('certificates')} />
                  ))}
                </div>
              )}
            </>
          )}

          {active === 'certificates' && (
            <>
              <h2 className="mb-4 text-xl font-semibold">My Certificates</h2>
              {enrollments.filter((e) => (e.progress || 0) >= 100).length === 0 ? (
                <Card className="border-white/10 bg-white/5 backdrop-blur">
                  <CardContent className="p-10 text-center">
                    <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <div className="text-lg font-semibold">No certificates yet</div>
                    <p className="mt-1 text-sm text-muted-foreground">Complete a course to earn your first Shiksha Bharti certificate.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {enrollments.filter((e) => (e.progress || 0) >= 100).map((e) => (
                    <CertificateCard key={e.id} enrollment={e} userName={user.name} />
                  ))}
                </div>
              )}
            </>
          )}

          {active === 'achievements' && (
            <>
              <h2 className="mb-4 text-xl font-semibold">Achievements & Badges</h2>
              <AchievementsBoard enrollments={enrollments} />
            </>
          )}

          {active === 'wallet' && (
            <>
              <h2 className="mb-4 text-xl font-semibold">Wallet & Rewards</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/30 to-fuchsia-600/30 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Wallet Balance</div>
                    <div className="mt-2 text-3xl font-bold">\u20b9500.00</div>
                    <p className="mt-1 text-xs text-muted-foreground">Welcome bonus credited</p>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Referral Earnings</div>
                    <div className="mt-2 text-3xl font-bold">\u20b90.00</div>
                    <p className="mt-1 text-xs text-muted-foreground">Refer &amp; earn \u20b9200</p>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Reward Points</div>
                    <div className="mt-2 text-3xl font-bold">820</div>
                    <p className="mt-1 text-xs text-muted-foreground">Earn on quizzes &amp; streaks</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {active === 'notifications' && (
            <>
              <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="divide-y divide-white/10 p-0">
                  {[
                    { t: '🎉 Welcome to Shiksha Bharti!', d: 'Your \u20b9500 wallet bonus is now active.', time: 'just now' },
                    { t: '📚 New course available', d: 'Generative AI + Prompt Engineering is now live!', time: '2 hours ago' },
                    { t: '🏆 Weekly Leaderboard', d: 'You climbed to Rank #4 this week. Keep going!', time: 'yesterday' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 p-4">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-fuchsia-500">
                        <Bell className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{n.t}</div>
                        <div className="text-xs text-muted-foreground">{n.d}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{n.time}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {active === 'settings' && (
            <>
              <h2 className="mb-4 text-xl font-semibold">Settings</h2>
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="space-y-4 p-6">
                  <div>
                    <div className="text-xs text-muted-foreground">Name</div>
                    <div className="text-base font-semibold">{user?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="text-base font-semibold">{user?.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Member since</div>
                    <div className="text-base">{new Date(user?.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <Button variant="outline" onClick={logout} className="border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
