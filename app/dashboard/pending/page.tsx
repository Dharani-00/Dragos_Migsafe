'use client'

import { useEffect, useState } from 'react'
import { PendingWorkersTable } from '@/components/dashboard/pending-workers-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Worker {
  id: string
  full_name: string
  mobile_number: string
  email: string
  job_type: string
  worksite_location: string
  status: string
  created_at: string
  aadhaar_image?: string
  [key: string]: any
}

function getWorkers(status?: string): Worker[] {
  try {
    // Get stored registrations from localStorage
    const storedRegistrations = JSON.parse(localStorage.getItem('pending_approvals') || '[]')

    // Filter by status if provided
    let filteredWorkers = storedRegistrations
    if (status) {
      filteredWorkers = storedRegistrations.filter((worker: Worker) => worker.status === status)
    }

    // Sort by creation date (newest first)
    filteredWorkers.sort((a: Worker, b: Worker) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return filteredWorkers
  } catch (err) {
    console.error('Error fetching stored registrations:', err)
    return []
  }
}

export default function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [status, setStatus] = useState<string>('pending')

  useEffect(() => {
    const fetchParams = async () => {
      const params = await searchParams
      const currentStatus = params.status || 'pending'
      setStatus(currentStatus)
      const fetchedWorkers = getWorkers(currentStatus === 'all' ? undefined : currentStatus)
      setWorkers(fetchedWorkers)
    }

    fetchParams()
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Worker Registrations</h1>
        <p className="text-muted-foreground">
          Review and manage worker registration requests
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Registration Queue</CardTitle>
          <CardDescription>
            Filter by status and take action on registration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={status} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" asChild>
                <a href="/dashboard/pending?status=pending">Pending</a>
              </TabsTrigger>
              <TabsTrigger value="approved" asChild>
                <a href="/dashboard/pending?status=approved">Approved</a>
              </TabsTrigger>
              <TabsTrigger value="rejected" asChild>
                <a href="/dashboard/pending?status=rejected">Rejected</a>
              </TabsTrigger>
              <TabsTrigger value="all" asChild>
                <a href="/dashboard/pending?status=all">All</a>
              </TabsTrigger>
            </TabsList>
            <TabsContent value={status} className="mt-0">
              <PendingWorkersTable workers={workers} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
