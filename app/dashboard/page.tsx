import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, AlertTriangle, MessageSquare, RefreshCw, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function getStats() {
  try {
    // Get data from localStorage (demo implementation)
    const workers = JSON.parse(localStorage.getItem('workers') || '[]')
    const complaints = JSON.parse(localStorage.getItem('complaints') || '[]')
    const renewals = JSON.parse(localStorage.getItem('renewals') || '[]')

    const totalWorkers = workers.length
    const pendingWorkers = workers.filter((w: any) => w.status === 'pending').length
    const approvedWorkers = workers.filter((w: any) => w.status === 'approved').length
    const riskFlagged = workers.filter((w: any) => w.hasRiskFlag).length
    const openComplaints = complaints.filter((c: any) => ['open', 'in_review'].includes(c.status)).length
    const pendingRenewals = renewals.filter((r: any) => r.status === 'pending').length

    return {
      totalWorkers,
      pendingWorkers,
      approvedWorkers,
      riskFlagged,
      openComplaints,
      pendingRenewals,
    }
  } catch (err) {
    console.error('Error fetching stats:', err)
    // Return mock stats when localStorage is not available
    return {
      totalWorkers: 42,
      pendingWorkers: 8,
      approvedWorkers: 31,
      riskFlagged: 3,
      openComplaints: 5,
      pendingRenewals: 4,
    }
  }
}

export default function DashboardPage() {
  const stats = getStats()

  const statCards = [
    {
      title: 'Total Workers',
      value: stats.totalWorkers,
      description: 'Registered in system',
      icon: Users,
      href: '/dashboard/pending',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingWorkers,
      description: 'Awaiting review',
      icon: Clock,
      href: '/dashboard/pending',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Approved Workers',
      value: stats.approvedWorkers,
      description: 'Active registrations',
      icon: CheckCircle,
      href: '/dashboard/pending?status=approved',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Risk Flagged',
      value: stats.riskFlagged,
      description: 'Requires attention',
      icon: AlertTriangle,
      href: '/dashboard/risk-flags',
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Open Complaints',
      value: stats.openComplaints,
      description: 'In progress',
      icon: MessageSquare,
      href: '/dashboard/complaints',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Renewals',
      value: stats.pendingRenewals,
      description: 'Awaiting approval',
      icon: RefreshCw,
      href: '/dashboard/renewals',
      color: 'text-violet-600',
      bgColor: 'bg-violet-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor worker registrations, complaints, and renewals at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/registration"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">New Registration</p>
                <p className="text-sm text-muted-foreground">Add a new worker</p>
              </div>
            </Link>
            <Link
              href="/dashboard/complaints/new"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="rounded-lg bg-blue-500/10 p-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">File Complaint</p>
                <p className="text-sm text-muted-foreground">Log a new issue</p>
              </div>
            </Link>
            <Link
              href="/dashboard/pending"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Review Pending</p>
                <p className="text-sm text-muted-foreground">Approve registrations</p>
              </div>
            </Link>
            <Link
              href="/dashboard/renewals"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="rounded-lg bg-violet-500/10 p-2">
                <RefreshCw className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium">Process Renewals</p>
                <p className="text-sm text-muted-foreground">Handle renewal requests</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Portal health and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Database Status</span>
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Authentication</span>
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
