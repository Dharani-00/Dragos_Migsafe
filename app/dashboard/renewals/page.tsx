'use client'

import { useEffect, useState } from 'react'
import { RenewalsTable } from '@/components/dashboard/renewals-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Calendar } from 'lucide-react'

interface Renewal {
  id: string
  status: string
  requested_at: string
  renewal_type: string
  notes: string
  workers: {
    id: string
    full_name: string
    aadhaar_number: string
    state: string
    district: string
    job_type: string
    stay_valid_from: string
    stay_valid_until: string
  }
}

interface ExpiringWorker {
  id: string
  full_name: string
  state: string
  stay_valid_until: string
}

function getRenewals(status?: string): Renewal[] {
  try {
    
    const storedRenewals = JSON.parse(localStorage.getItem('renewals') || '[]')

    // Filter by status if provided
    let filteredRenewals = storedRenewals
    if (status && status !== 'all') {
      filteredRenewals = storedRenewals.filter((renewal: Renewal) => renewal.status === status)
    }

    // Sort by requested date (newest first)
    filteredRenewals.sort((a: Renewal, b: Renewal) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())

    return filteredRenewals
  } catch (err) {
    console.error('Error fetching renewals:', err)
    return []
  }
}

function getExpiringWorkers(): ExpiringWorker[] {
  try {
    // Get stored registrations from localStorage
    const storedRegistrations = JSON.parse(localStorage.getItem('pending_approvals') || '[]')

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    // Filter approved workers with stay validity expiring within 30 days
    const expiringWorkers = storedRegistrations
      .filter((worker: any) =>
        worker.status === 'approved' &&
        worker.stay_valid_until &&
        new Date(worker.stay_valid_until) <= thirtyDaysFromNow
      )
      .map((worker: any) => ({
        id: worker.id,
        full_name: worker.full_name,
        state: worker.state,
        stay_valid_until: worker.stay_valid_until
      }))
      .sort((a: ExpiringWorker, b: ExpiringWorker) =>
        new Date(a.stay_valid_until).getTime() - new Date(b.stay_valid_until).getTime()
      )

    return expiringWorkers
  } catch (err) {
    console.error('Error fetching expiring workers:', err)
    return []
  }
}

export default function RenewalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const [renewals, setRenewals] = useState<Renewal[]>([])
  const [expiringWorkers, setExpiringWorkers] = useState<ExpiringWorker[]>([])
  const [status, setStatus] = useState<string>('pending')

  useEffect(() => {
    const fetchParams = async () => {
      const params = await searchParams
      const currentStatus = params.status || 'pending'
      setStatus(currentStatus)
      const fetchedRenewals = getRenewals(currentStatus)
      setRenewals(fetchedRenewals)
      const fetchedExpiringWorkers = getExpiringWorkers()
      setExpiringWorkers(fetchedExpiringWorkers)
    }

    fetchParams()
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Renewal Management</h1>
        <p className="text-muted-foreground">
          Process worker stay validity renewals and track expirations
        </p>
      </div>

      {/* Expiring Soon Alert */}
      {expiringWorkers.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-600">Expiring Soon</p>
              <p className="text-sm text-muted-foreground mb-3">
                {expiringWorkers.length} worker{expiringWorkers.length !== 1 ? 's' : ''} have stay validity expiring within 30 days
              </p>
              <div className="flex flex-wrap gap-2">
                {expiringWorkers.slice(0, 5).map((worker) => (
                  <div key={worker.id} className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-medium">{worker.full_name}</span>
                    <span className="text-muted-foreground">
                      expires {worker.stay_valid_until ? new Date(worker.stay_valid_until).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                ))}
                {expiringWorkers.length > 5 && (
                  <div className="flex items-center px-3 py-1.5 text-sm text-muted-foreground">
                    +{expiringWorkers.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Renewal Requests</CardTitle>
          <CardDescription>
            Review and process worker stay validity renewal applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={status} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" asChild>
                <a href="/dashboard/renewals?status=pending">Pending</a>
              </TabsTrigger>
              <TabsTrigger value="approved" asChild>
                <a href="/dashboard/renewals?status=approved">Approved</a>
              </TabsTrigger>
              <TabsTrigger value="rejected" asChild>
                <a href="/dashboard/renewals?status=rejected">Rejected</a>
              </TabsTrigger>
              <TabsTrigger value="all" asChild>
                <a href="/dashboard/renewals?status=all">All</a>
              </TabsTrigger>
            </TabsList>
            <TabsContent value={status} className="mt-0">
              <RenewalsTable renewals={renewals} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
