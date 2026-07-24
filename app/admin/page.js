'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ShieldCheck,
  Users,
  BookOpen,
  IndianRupee,
  MessagesSquare,
  Trophy,
  Award,
  ArrowLeft,
  Bot,
  Home,
  UserCog,
  FileText,
  BarChart3,
  Loader2,
  Search,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute -top-20 right-0 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.08),transparent_50%)]" />
    </div>
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

function SignupsChart({ series }) {
  const max = Math.max(1, ...series.map((s) => s.count))
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-emerald-400" /> New Signups (Last 7 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-3 px-1">
          {series.map((s) => (
            <div key={s.day} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20 transition-all"
                  style={{ height: `${(s.count / max) * 100}%`, minHeight: s.count > 0 ? '8px' : '2px' }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground">{s.day}</div>
              <div className="text-[10px] font-semibold">{s.count}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TopCoursesCard({ topCourses }) {
  const max = Math.max(1, ...topCourses.map((c) => c.count))
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-amber-400" /> Top Courses by Enrollment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topCourses.length === 0 ? (
          <div className="text-sm text-muted-foreground">No enrollments yet.</div>
        ) : topCourses.map((c) => (
          <div key={c.courseId}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="truncate">{c.title || c.courseId}</span>
              <span className="font-semibold">{c.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500" style={{ width: `${(c.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ChatViewer({ chat, onClose }) {
  if (!chat) return null
  return (
    <Dialog open={!!chat} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-white/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            Chat Session <span className="font-mono text-xs text-muted-foreground">{chat.sessionId?.slice(0, 8)}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {(chat.preview || []).map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'border border-white/10 bg-white/5'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [leads, setLeads] = useState([])
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('sb_token')
    if (!token) { router.push('/'); return }
    ;(async () => {
      try {
        const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        if (!r.ok) { router.push('/'); return }
        const data = await r.json()
        if (!data.user.isAdmin) {
          toast.error('Admin access required')
          router.push('/dashboard')
          return
        }
        setUser(data.user)
        await loadAll(token)
      } catch { router.push('/') }
      finally { setLoading(false) }
    })()
  }, [router])

  async function loadAll(token) {
    const auth = { Authorization: `Bearer ${token}` }
    const [s, u, e, l, c] = await Promise.all([
      fetch('/api/admin/stats', { headers: auth }).then((r) => r.json()),
      fetch('/api/admin/users', { headers: auth }).then((r) => r.json()),
      fetch('/api/admin/enrollments', { headers: auth }).then((r) => r.json()),
      fetch('/api/admin/leads', { headers: auth }).then((r) => r.json()),
      fetch('/api/admin/chats', { headers: auth }).then((r) => r.json()),
    ])
    setStats(s)
    setUsers(u.users || [])
    setEnrollments(e.enrollments || [])
    setLeads(l.leads || [])
    setChats(c.chats || [])
  }

  function logout() {
    localStorage.removeItem('sb_token')
    router.push('/')
  }

  const filteredUsers = useMemo(() => {
    if (!q) return users
    const s = q.toLowerCase()
    return users.filter((u) => (u.name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s))
  }, [users, q])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
      </div>
    )
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'enrollments', label: 'Enrollments', icon: BookOpen },
    { key: 'leads', label: 'Leads', icon: Mail },
    { key: 'chats', label: 'AI Chats', icon: MessagesSquare },
  ]

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Home</span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm font-bold">Admin Panel</div>
              <Badge className="ml-2 border-0 bg-fuchsia-500/15 text-fuchsia-400">Shiksha Bharti</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button size="sm" variant="ghost">Student View</Button>
            </Link>
            <ThemeToggle />
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 lg:p-8">
        {/* Tabs bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur">
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {tab === 'overview' && stats && (
          <>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Total Users" value={stats.users} sub="Registered students" gradient="from-blue-500 to-cyan-400" />
              <StatCard icon={BookOpen} label="Enrollments" value={stats.enrollments} sub={`${stats.completed} completed`} gradient="from-fuchsia-500 to-purple-400" />
              <StatCard icon={Mail} label="Leads" value={stats.leads} sub="Demo requests" gradient="from-amber-500 to-orange-400" />
              <StatCard icon={MessagesSquare} label="AI Chats" value={stats.chats} sub="Tutor sessions" gradient="from-emerald-500 to-teal-400" />
            </motion.div>
            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <SignupsChart series={stats.signupsSeries || []} />
              <TopCoursesCard topCourses={stats.topCourses || []} />
            </div>
            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Course Catalog</div>
                  <div className="mt-1 text-2xl font-bold">{stats.courses}</div>
                  <div className="text-xs text-emerald-400">All active</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Completion Rate</div>
                  <div className="mt-1 text-2xl font-bold">{stats.enrollments ? Math.round((stats.completed / stats.enrollments) * 100) : 0}%</div>
                  <div className="text-xs text-muted-foreground">Across all enrollments</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Tutor</div>
                  <div className="mt-1 flex items-center gap-2 text-lg font-bold"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Operational</div>
                  <div className="text-xs text-muted-foreground">GPT-4o powered</div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {tab === 'users' && (
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Users ({filteredUsers.length})</CardTitle>
              <div className="relative w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email..." className="pl-9 bg-white/5" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-xs font-bold text-white">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="font-medium">{u.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          {u.email === 'admin@shikshabharti.in' ? (
                            <Badge className="border-0 bg-fuchsia-500/15 text-fuchsia-400">Admin</Badge>
                          ) : (
                            <select
                              defaultValue={u.role || 'student'}
                              onChange={async (e) => {
                                const newRole = e.target.value
                                const token = localStorage.getItem('sb_token')
                                try {
                                  const r = await fetch('/api/admin/users/role', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ userId: u.id, role: newRole }),
                                  })
                                  if (!r.ok) throw new Error('Failed')
                                  toast.success(`${u.name} is now a ${newRole}`)
                                  setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: newRole } : x))
                                } catch { toast.error('Failed to update role') }
                              }}
                              className="cursor-pointer rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs backdrop-blur"
                            >
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'enrollments' && (
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader><CardTitle className="text-base">Enrollments ({enrollments.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Course</th>
                      <th className="px-4 py-3 text-left">Progress</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {enrollments.map((e) => (
                      <tr key={e.id} className="hover:bg-white/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{e.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{e.user?.email}</div>
                        </td>
                        <td className="px-4 py-3">{e.courseTitle}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-white/5">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-fuchsia-500" style={{ width: `${e.progress || 0}%` }} />
                            </div>
                            <span className="text-xs">{e.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {e.status === 'completed' ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400">Completed</Badge>
                          ) : (
                            <Badge className="bg-blue-500/15 text-blue-400">Active</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(e.enrolledAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'leads' && (
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader><CardTitle className="text-base">Leads ({leads.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {leads.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No leads yet. Fill the "Get Free Demo" form on the home page to see leads here.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-y border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Phone</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Course Interest</th>
                        <th className="px-4 py-3 text-left">Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 font-medium">{l.name}</td>
                          <td className="px-4 py-3"><a href={`tel:${l.phone}`} className="hover:text-fuchsia-400">{l.phone}</a></td>
                          <td className="px-4 py-3 text-muted-foreground">{l.email || '\u2014'}</td>
                          <td className="px-4 py-3">{l.course || '\u2014'}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'chats' && (
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader><CardTitle className="text-base">AI Tutor Chat Sessions ({chats.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {chats.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No chat sessions yet.</div>
              ) : (
                <div className="divide-y divide-white/10">
                  {chats.map((c) => {
                    const lastUser = [...(c.preview || [])].reverse().find((m) => m.role === 'user')
                    return (
                      <button
                        key={c.sessionId}
                        onClick={() => setSelectedChat(c)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/5"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-fuchsia-500">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate text-sm font-medium">{lastUser?.content || 'New session'}</div>
                            <div className="shrink-0 text-[10px] text-muted-foreground">{new Date(c.updatedAt).toLocaleString('en-IN')}</div>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">{c.sessionId?.slice(0, 8)}</span>
                            <span>&middot;</span>
                            <span>{c.messagesCount} messages</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ChatViewer chat={selectedChat} onClose={() => setSelectedChat(null)} />
    </div>
  )
}
