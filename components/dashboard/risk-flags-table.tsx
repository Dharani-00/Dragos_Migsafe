'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Eye, FlagOff } from 'lucide-react'

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
}

interface RiskFlagsTableProps {
  workers: Worker[]
}

export function RiskFlagsTable({ workers }: RiskFlagsTableProps) {
  const router = useRouter()
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [actionType, setActionType] = useState<'view' | 'remove' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRemoveFlag = async () => {
    if (!selectedWorker) return
    setIsLoading(true)

    try {
      // Get current registrations from localStorage
      const storedRegistrations = JSON.parse(localStorage.getItem('pending_approvals') || '[]')

      // Find and update the worker
      const updatedRegistrations = storedRegistrations.map((worker: Worker) => {
        if (worker.id === selectedWorker.id) {
          return {
            ...worker,
            has_risk_flag: false,
            risk_flag_reason: null,
            risk_flag_date: null,
          }
        }
        return worker
      })

      // Save back to localStorage
      localStorage.setItem('pending_approvals', JSON.stringify(updatedRegistrations))

      setSelectedWorker(null)
      setActionType(null)
      // Refresh the page to update the data
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">Pending</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (workers.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 opacity-50" />
        <p>No workers are currently flagged.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">State</TableHead>
              <TableHead className="hidden lg:table-cell">Job Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Flag Reason</TableHead>
              <TableHead className="hidden md:table-cell">Flag Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    {worker.full_name}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{worker.state}</TableCell>
                <TableCell className="hidden lg:table-cell">{worker.job_type}</TableCell>
                <TableCell>{getStatusBadge(worker.status)}</TableCell>
                <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                  {worker.risk_flag_reason || '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {worker.risk_flag_date 
                    ? new Date(worker.risk_flag_date).toLocaleDateString('en-IN')
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedWorker(worker)
                        setActionType('view')
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-emerald-600 hover:text-emerald-700"
                      onClick={() => {
                        setSelectedWorker(worker)
                        setActionType('remove')
                      }}
                    >
                      <FlagOff className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={actionType === 'view'} onOpenChange={() => { setActionType(null); setSelectedWorker(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Risk Flag Details
            </DialogTitle>
            <DialogDescription>Worker information and flag details</DialogDescription>
          </DialogHeader>
          {selectedWorker && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Full Name</p>
                  <p>{selectedWorker.full_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Aadhaar Number</p>
                  <p>{selectedWorker.aadhaar_number || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Mobile Number</p>
                  <p>{selectedWorker.mobile_number || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">State / District</p>
                  <p>{selectedWorker.state}, {selectedWorker.district}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Job Type</p>
                  <p>{selectedWorker.job_type}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Registration Status</p>
                  {getStatusBadge(selectedWorker.status)}
                </div>
              </div>
              <div className="rounded-md bg-amber-500/10 p-4">
                <p className="font-medium text-amber-600 mb-2">Risk Flag Information</p>
                <div className="grid grid-cols-2 gap-2 text-amber-600/80">
                  <div>
                    <p className="text-xs font-medium">Flag Date</p>
                    <p>{selectedWorker.risk_flag_date 
                      ? new Date(selectedWorker.risk_flag_date).toLocaleDateString('en-IN')
                      : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Reason</p>
                    <p>{selectedWorker.risk_flag_reason || 'No reason provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Flag Dialog */}
      <Dialog open={actionType === 'remove'} onOpenChange={() => { setActionType(null); setSelectedWorker(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Risk Flag</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the risk flag from {selectedWorker?.full_name}? 
              This action indicates that the worker has been verified and cleared.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button onClick={handleRemoveFlag} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? 'Removing...' : 'Remove Flag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
