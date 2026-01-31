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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, X, Eye, AlertTriangle, Flag } from 'lucide-react'

interface Worker {
  id: string | number
  full_name: string
  aadhaar_number: string | null
  mobile_number: string | null
  email: string | null
  date_of_birth: string | null
  gender: string | null
  state: string
  district: string
  address: string | null
  pincode: string | null
  job_type: string
  contractor_id: string | null
  employer_name: string | null
  worksite_location: string | null
  stay_valid_from: string | null
  stay_valid_until: string | null
  status: 'pending' | 'approved' | 'rejected'
  registration_type: string
  site: string
  aadhaar_image: string | null
  registration_number?: string
  created_at: string
  updated_at: string
  approved_at?: string
  rejection_reason?: string
  has_risk_flag?: boolean
  risk_flag_reason?: string | null
  risk_flag_date?: string | null
}

interface PendingWorkersTableProps {
  workers: Worker[]
}

export function PendingWorkersTable({ workers }: PendingWorkersTableProps) {
  const router = useRouter()
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [actionType, setActionType] = useState<'view' | 'process' | 'reject' | 'flag' | null>(null)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    if (!selectedWorker || !actionType) return
    setIsLoading(true)

    try {
      // Get current registrations from localStorage
      const currentRegistrations = JSON.parse(localStorage.getItem('pending_approvals') || '[]')

      // Find and update the selected worker
      const updatedRegistrations = currentRegistrations.map((worker: any) => {
        if (worker.id === selectedWorker.id) {
          if (actionType === 'process') {
            // Generate unique registration number
            const uniqueNumber = generateUniqueRegistrationNumber()
            const approvedWorker = {
              ...worker,
              status: 'approved',
              registration_number: uniqueNumber,
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            // Store in approved workers localStorage
            const approvedWorkers = JSON.parse(localStorage.getItem('approved_workers') || '[]')
            approvedWorkers.push(approvedWorker)
            localStorage.setItem('approved_workers', JSON.stringify(approvedWorkers))

            return approvedWorker
          } else if (actionType === 'reject') {
            return {
              ...worker,
              status: 'rejected',
              rejection_reason: reason,
              updated_at: new Date().toISOString()
            }
          } else if (actionType === 'flag') {
            return {
              ...worker,
              has_risk_flag: !worker.has_risk_flag,
              risk_flag_reason: worker.has_risk_flag ? null : reason,
              risk_flag_date: worker.has_risk_flag ? null : new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        }
        return worker
      })

      // Save back to localStorage
      localStorage.setItem('pending_approvals', JSON.stringify(updatedRegistrations))

      setSelectedWorker(null)
      setActionType(null)
      setReason('')
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating registration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate unique registration number
  const generateUniqueRegistrationNumber = (): string => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `MIG${timestamp}${random}`
  }

  const getStatusBadge = (status: string, hasRiskFlag: boolean) => {
    if (hasRiskFlag) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Risk Flagged</Badge>
    }
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
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        No workers found in this category.
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
              <TableHead className="hidden md:table-cell">Aadhaar</TableHead>
              <TableHead className="hidden sm:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Job Type</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">
                  <div>
                    {worker.full_name}
                    <p className="text-xs text-muted-foreground md:hidden">
                      {worker.mobile_number}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div>
                    {worker.aadhaar_number || 'N/A'}
                    {worker.aadhaar_image && (
                      <p className="text-xs text-blue-600 mt-1">📎 Image attached</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {worker.mobile_number || worker.email || 'N/A'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{worker.job_type}</TableCell>
                <TableCell>{worker.site}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                    {worker.status}
                  </Badge>
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
                    {worker.status === 'pending' && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            setSelectedWorker(worker)
                            setActionType('process')
                          }}
                          title="Process and approve registration"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedWorker(worker)
                            setActionType('reject')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className={worker.has_risk_flag ? 'text-amber-600' : 'text-muted-foreground'}
                      onClick={() => {
                        setSelectedWorker(worker)
                        setActionType('flag')
                        setReason(worker.risk_flag_reason || '')
                      }}
                    >
                      <Flag className="h-4 w-4" />
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
            <DialogTitle>Worker Details</DialogTitle>
            <DialogDescription>Complete registration information</DialogDescription>
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
                  <p className="font-medium text-muted-foreground">Email</p>
                  <p>{selectedWorker.email || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Date of Birth</p>
                  <p>{selectedWorker.date_of_birth ? new Date(selectedWorker.date_of_birth).toLocaleDateString('en-IN') : '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Gender</p>
                  <p>{selectedWorker.gender || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Address</p>
                  <p>{selectedWorker.address || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">PIN Code</p>
                  <p>{selectedWorker.pincode || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Worksite Location</p>
                  <p>{selectedWorker.worksite_location || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Stay Validity</p>
                  <p>
                    {selectedWorker.stay_valid_from && selectedWorker.stay_valid_until
                      ? `${new Date(selectedWorker.stay_valid_from).toLocaleDateString('en-IN')} - ${new Date(selectedWorker.stay_valid_until).toLocaleDateString('en-IN')}`
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Registration Number</p>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {selectedWorker.registration_number || 'Not assigned'}
                  </p>
                </div>
              </div>
              
              {/* Aadhaar Image Display */}
              {selectedWorker.aadhaar_image && (
                <div className="mt-4">
                  <p className="font-medium text-muted-foreground mb-2">Aadhaar Image</p>
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img
                      src={selectedWorker.aadhaar_image}
                      alt="Aadhaar Card"
                      className="max-w-full h-auto max-h-64 rounded"
                    />
                  </div>
                </div>
              )}
              {selectedWorker.has_risk_flag && selectedWorker.risk_flag_reason && (
                <div className="rounded-md bg-red-500/10 p-3">
                  <p className="font-medium text-red-600">Risk Flag Reason</p>
                  <p className="text-red-600/80">{selectedWorker.risk_flag_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog open={actionType === 'process'} onOpenChange={() => { setActionType(null); setSelectedWorker(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Registration</DialogTitle>
            <DialogDescription>
              This will automatically approve the registration for {selectedWorker?.full_name} and generate a unique registration number.
              The approved worker details will be stored privately with their registration number.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-blue-500/10 p-4">
              <p className="font-medium text-blue-600 mb-2">What happens next:</p>
              <ul className="text-sm text-blue-600/80 space-y-1">
                <li>• Registration status changes to "Approved"</li>
                <li>• Unique registration number is generated (format: MIG[timestamp][random])</li>
                <li>• Worker details are stored in approved workers database</li>
                <li>• Registration number is kept private and secure</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Processing...' : 'Process & Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === 'reject'} onOpenChange={() => { setActionType(null); setSelectedWorker(null); setReason('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedWorker?.full_name}&apos;s registration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Rejection Reason</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={isLoading || !reason} variant="destructive">
              {isLoading ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={actionType === 'flag'} onOpenChange={() => { setActionType(null); setSelectedWorker(null); setReason('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedWorker?.has_risk_flag ? 'Remove Risk Flag' : 'Add Risk Flag'}
            </DialogTitle>
            <DialogDescription>
              {selectedWorker?.has_risk_flag
                ? `Remove the risk flag from ${selectedWorker?.full_name}?`
                : `Add a risk flag to ${selectedWorker?.full_name}. This will mark the worker for additional verification.`}
            </DialogDescription>
          </DialogHeader>
          {!selectedWorker?.has_risk_flag && (
            <div className="py-4">
              <Label htmlFor="flag-reason">Flag Reason</Label>
              <Textarea
                id="flag-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for flagging..."
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button
              onClick={handleAction}
              disabled={isLoading || (!selectedWorker?.has_risk_flag && !reason)}
              className={selectedWorker?.has_risk_flag ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}
            >
              {isLoading
                ? 'Processing...'
                : selectedWorker?.has_risk_flag
                  ? 'Remove Flag'
                  : 'Add Flag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
