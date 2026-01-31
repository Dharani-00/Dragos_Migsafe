'use client'

import { useEffect, useState } from 'react'
import { ComplaintsTable } from '@/components/dashboard/complaints-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface Complaint {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
  workers: {
    full_name: string
    state: string
    district: string
  }
}

function getComplaints(status?: string): Complaint[] {
  try {
    // Get stored complaints from localStorage
    const storedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]')

    // Filter by status if provided
    let filteredComplaints = storedComplaints
    if (status && status !== 'all') {
      filteredComplaints = storedComplaints.filter((complaint: Complaint) => complaint.status === status)
    }

    // Sort by created date (newest first)
    filteredComplaints.sort((a: Complaint, b: Complaint) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return filteredComplaints
  } catch (err) {
    console.error('Error fetching complaints:', err)
    return []
  }
}

export default function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [status, setStatus] = useState<string>('open')

  useEffect(() => {
    const fetchParams = async () => {
      const params = await searchParams
      const currentStatus = params.status || 'open'
      setStatus(currentStatus)
      const fetchedComplaints = getComplaints(currentStatus)
      setComplaints(fetchedComplaints)
    }

    fetchParams()
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground">
            Manage worker and manager complaints
          </p>
        </div>
        <Link href="/dashboard/complaints/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Complaint
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Complaint Records</CardTitle>
          <CardDescription>
            Filter by status and manage complaint resolutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={status} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="open" asChild>
                <a href="/dashboard/complaints?status=open">Open</a>
              </TabsTrigger>
              <TabsTrigger value="in_review" asChild>
                <a href="/dashboard/complaints?status=in_review">In Review</a>
              </TabsTrigger>
              <TabsTrigger value="resolved" asChild>
                <a href="/dashboard/complaints?status=resolved">Resolved</a>
              </TabsTrigger>
              <TabsTrigger value="closed" asChild>
                <a href="/dashboard/complaints?status=closed">Closed</a>
              </TabsTrigger>
              <TabsTrigger value="all" asChild>
                <a href="/dashboard/complaints?status=all">All</a>
              </TabsTrigger>
            </TabsList>
            <TabsContent value={status} className="mt-0">
              <ComplaintsTable complaints={complaints} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
