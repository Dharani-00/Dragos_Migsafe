'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Eye, Check, X, RefreshCw } from 'lucide-react'

interface Renewal {
  id: string
  worker_id: string
  current_valid_from: string
  current_valid_until: string
  new_valid_from: string | null
  new_valid_until: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  requested_at: string
  processed_at: string | null
  workers: {
    id: string
    full_name: string
    aadhaar_number: string | null
    state: string
    district: string
    job_type: string
    stay_valid_from: string | null
    stay_valid_until: string | null
  } | null
}

interface RenewalsTableProps {
  renewals: Renewal[]
}

export function RenewalsTable({ renewals }: RenewalsTableProps) {
  const router = useRouter()
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null)
  const [actionType, setActionType] = useState<'view' | 'approve' | 'reject' | null>(null)
  const [newValidFrom, setNewValidFrom] = useState('')
  const [newValidUntil, setNewValidUntil] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    if (!selectedRenewal || !newValidFrom || !newValidUntil) return
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Update renewal record
      await supabase
        .from('renewals')
        .update({
          status: 'approved',
          new_valid_from: newValidFrom,
          new_valid_until: newValidUntil,
          processed_at: new Date().toISOString(),
        })
        .eq('id', selectedRenewal.id)

      // Update worker's stay validity
      await supabase
        .from('workers')
        .update({
          stay_valid_from: newValidFrom,
          stay_valid_until: newValidUntil,
        })
        .eq('id', selectedRenewal.worker_id)

      closeDialogs()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRenewal || !rejectionReason) return
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      await supabase
        .from('renewals')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          processed_at: new Date().toISOString(),
        })
        .eq('id', selectedRenewal.id)

      closeDialogs()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const closeDialogs = () => {
    setSelectedRenewal(null)
    setActionType(null)
    setNewValidFrom('')
    setNewValidUntil('')
    setRejectionReason('')
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

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (renewals.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <RefreshCw className="h-8 w-8 opacity-50" />
        <p>No renewal requests found in this category.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead>
              <TableHead className="hidden md:table-cell">Current Validity</TableHead>
              <TableHead className="hidden lg:table-cell">Job Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renewals.map((renewal) => (
              <TableRow key={renewal.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{renewal.workers?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {renewal.workers?.state}, {renewal.workers?.district}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm">
                    <p>{formatDate(renewal.current_valid_from)}</p>
                    <p className="text-muted-foreground">to {formatDate(renewal.current_valid_until)}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {renewal.workers?.job_type || '-'}
                </TableCell>
                <TableCell>{getStatusBadge(renewal.status)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(renewal.requested_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedRenewal(renewal)
                        setActionType('view')
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {renewal.status === 'pending' && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-emerald-600 hover:text-emerald-700"
                          onClick={() => {
                            setSelectedRenewal(renewal)
                            setActionType('approve')
                            // Default to extending by 1 year from current expiry
                            const currentEnd = new Date(renewal.current_valid_until)
                            setNewValidFrom(renewal.current_valid_until)
                            currentEnd.setFullYear(currentEnd.getFullYear() + 1)
                            setNewValidUntil(currentEnd.toISOString().split('T')[0])
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedRenewal(renewal)
                            setActionType('reject')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={actionType === 'view'} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Renewal Request Details</DialogTitle>
            <DialogDescription>Complete renewal application information</DialogDescription>
          </DialogHeader>
          {selectedRenewal && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Worker Name</p>
                  <p>{selectedRenewal.workers?.full_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Aadhaar Number</p>
                  <p>{selectedRenewal.workers?.aadhaar_number || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">State / District</p>
                  <p>{selectedRenewal.workers?.state}, {selectedRenewal.workers?.district}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Job Type</p>
                  <p>{selectedRenewal.workers?.job_type}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Current Validity</p>
                  <p>{formatDate(selectedRenewal.current_valid_from)} - {formatDate(selectedRenewal.current_valid_until)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedRenewal.status)}
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Requested On</p>
                  <p>{formatDate(selectedRenewal.requested_at)}</p>
                </div>
                {selectedRenewal.processed_at && (
                  <div>
                    <p className="font-medium text-muted-foreground">Processed On</p>
                    <p>{formatDate(selectedRenewal.processed_at)}</p>
                  </div>
                )}
              </div>
              {selectedRenewal.status === 'approved' && selectedRenewal.new_valid_from && (
                <div className="rounded-md bg-emerald-500/10 p-3">
                  <p className="font-medium text-emerald-600">New Validity Period</p>
                  <p className="text-emerald-600/80">
                    {formatDate(selectedRenewal.new_valid_from)} - {formatDate(selectedRenewal.new_valid_until)}
                  </p>
                </div>
              )}
              {selectedRenewal.status === 'rejected' && selectedRenewal.rejection_reason && (
                <div className="rounded-md bg-red-500/10 p-3">
                  <p className="font-medium text-red-600">Rejection Reason</p>
                  <p className="text-red-600/80">{selectedRenewal.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={actionType === 'approve'} onOpenChange={closeDialogs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Renewal</DialogTitle>
            <DialogDescription>
              Set the new validity period for {selectedRenewal?.workers?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new_valid_from">New Valid From</Label>
                <Input
                  id="new_valid_from"
                  type="date"
                  value={newValidFrom}
                  onChange={(e) => setNewValidFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new_valid_until">New Valid Until</Label>
                <Input
                  id="new_valid_until"
                  type="date"
                  value={newValidUntil}
                  onChange={(e) => setNewValidUntil(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button 
              onClick={handleApprove} 
              disabled={isLoading || !newValidFrom || !newValidUntil}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? 'Approving...' : 'Approve Renewal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === 'reject'} onOpenChange={closeDialogs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Renewal</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedRenewal?.workers?.full_name}&apos;s renewal request
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection_reason">Rejection Reason</Label>
            <Textarea
              id="rejection_reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button 
              onClick={handleReject} 
              disabled={isLoading || !rejectionReason}
              variant="destructive"
            >
              {isLoading ? 'Rejecting...' : 'Reject Renewal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
