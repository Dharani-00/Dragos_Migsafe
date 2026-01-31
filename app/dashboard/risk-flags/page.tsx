'use client'

import { useEffect, useState } from 'react'
import { RiskFlagsTable } from '@/components/dashboard/risk-flags-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface Worker {
  id: string
  full_name: string
  aadhaar_number: string | null
  mobile_number: string | null
  state: string
  district: string
  job_type: string
  employer_name: string | null
  status: 'pending' | 'approved' | 'rejected'
  has_risk_flag: boolean
  risk_flag_reason: string | null
  risk_flag_date: string | null
  created_at: string
  [key: string]: any
}

function getRiskFlaggedWorkers(): Worker[] {
  try {
    // Get stored registrations from localStorage
    const storedRegistrations = JSON.parse(localStorage.getItem('pending_approvals') || '[]')

    // Filter workers with risk flags
    const riskFlaggedWorkers = storedRegistrations.filter((worker: Worker) => worker.has_risk_flag === true)

    // Sort by risk flag date (newest first)
    riskFlaggedWorkers.sort((a: Worker, b: Worker) => {
      const dateA = a.risk_flag_date ? new Date(a.risk_flag_date).getTime() : 0
      const dateB = b.risk_flag_date ? new Date(b.risk_flag_date).getTime() : 0
      return dateB - dateA
    })

    return riskFlaggedWorkers
  } catch (err) {
    console.error('Error fetching risk-flagged workers:', err)
    return []
  }
}

export default function RiskFlagsPage() {
  const [workers, setWorkers] = useState<Worker[]>([])

  useEffect(() => {
    const fetchedWorkers = getRiskFlaggedWorkers()
    setWorkers(fetchedWorkers)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Risk Flags</h1>
        <p className="text-muted-foreground">
          Workers flagged for additional verification or compliance issues
        </p>
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-600">Risk Flag System</p>
            <p className="text-sm text-muted-foreground">
              Risk flags are used to mark workers who require additional scrutiny. This may include
              workers with incomplete documentation, compliance violations, or pending investigations.
              Flags can be added or removed from the Pending Approvals section.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Workers</CardTitle>
          <CardDescription>
            {workers.length} worker{workers.length !== 1 ? 's' : ''} currently flagged
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RiskFlagsTable workers={workers} />
        </CardContent>
      </Card>
    </div>
  )
}
