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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Eye, Settings, MessageSquare } from 'lucide-react'

interface Complaint {
  id: string
  worker_id: string | null
  complaint_type: string
  description: string
  complainant_name: string
  complainant_type: string
  complainant_contact: string | null
  against_name: string | null
  against_role: string | null
  status: 'open' | 'in_review' | 'resolved' | 'closed'
  resolution_notes: string | null
  created_at: string
  resolved_at: string | null
  workers: {
    full_name: string
    state: string
    district: string
  } | null
}

interface ComplaintsTableProps {
  complaints: Complaint[]
}

const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  wage_dispute: 'Wage Dispute',
  harassment: 'Harassment',
  missing_person: 'Missing Person',
  workplace_accident: 'Workplace Accident',
  death_case: 'Death Case',
  other: 'Other',
}

export function ComplaintsTable({ complaints }: ComplaintsTableProps) {
  const router = useRouter()
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [actionType, setActionType] = useState<'view' | 'update' | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !newStatus) return
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const updateData: Record<string, unknown> = { status: newStatus }
      if (resolutionNotes) {
        updateData.resolution_notes = resolutionNotes
      }
      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.resolved_at = new Date().toISOString()
      }

      await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', selectedComplaint.id)

      setSelectedComplaint(null)
      setActionType(null)
      setNewStatus('')
      setResolutionNotes('')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Open</Badge>
      case 'in_review':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">In Review</Badge>
      case 'resolved':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Resolved</Badge>
      case 'closed':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      wage_dispute: 'bg-violet-500/10 text-violet-600',
      harassment: 'bg-red-500/10 text-red-600',
      missing_person: 'bg-amber-500/10 text-amber-600',
      workplace_accident: 'bg-orange-500/10 text-orange-600',
      death_case: 'bg-red-600/10 text-red-700',
      other: 'bg-muted text-muted-foreground',
    }
    return (
      <Badge variant="secondary" className={colors[type] || colors.other}>
        {COMPLAINT_TYPE_LABELS[type] || type}
      </Badge>
    )
  }

  if (complaints.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <MessageSquare className="h-8 w-8 opacity-50" />
        <p>No complaints found in this category.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complainant</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden lg:table-cell">Worker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Filed On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{complaint.complainant_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {complaint.complainant_type.replace('_', ' ')}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getTypeBadge(complaint.complaint_type)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {complaint.workers?.full_name || '-'}
                </TableCell>
                <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {new Date(complaint.created_at).toLocaleDateString('en-IN')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedComplaint(complaint)
                        setActionType('view')
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedComplaint(complaint)
                        setActionType('update')
                        setNewStatus(complaint.status)
                        setResolutionNotes(complaint.resolution_notes || '')
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={actionType === 'view'} onOpenChange={() => { setActionType(null); setSelectedComplaint(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>Complete complaint information</DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Complainant</p>
                  <p>{selectedComplaint.complainant_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedComplaint.complainant_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Contact</p>
                  <p>{selectedComplaint.complainant_contact || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Complaint Type</p>
                  {getTypeBadge(selectedComplaint.complaint_type)}
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                {selectedComplaint.workers && (
                  <div>
                    <p className="font-medium text-muted-foreground">Related Worker</p>
                    <p>{selectedComplaint.workers.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedComplaint.workers.state}, {selectedComplaint.workers.district}
                    </p>
                  </div>
                )}
                {selectedComplaint.against_name && (
                  <div>
                    <p className="font-medium text-muted-foreground">Complaint Against</p>
                    <p>{selectedComplaint.against_name}</p>
                    {selectedComplaint.against_role && (
                      <p className="text-xs text-muted-foreground">{selectedComplaint.against_role}</p>
                    )}
                  </div>
                )}
                <div>
                  <p className="font-medium text-muted-foreground">Filed On</p>
                  <p>{new Date(selectedComplaint.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</p>
                </div>
                {selectedComplaint.resolved_at && (
                  <div>
                    <p className="font-medium text-muted-foreground">Resolved On</p>
                    <p>{new Date(selectedComplaint.resolved_at).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Description</p>
                <p className="rounded-md bg-muted p-3">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.resolution_notes && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Resolution Notes</p>
                  <p className="rounded-md bg-emerald-500/10 p-3 text-emerald-700">
                    {selectedComplaint.resolution_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={actionType === 'update'} onOpenChange={() => { setActionType(null); setSelectedComplaint(null); setNewStatus(''); setResolutionNotes('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
            <DialogDescription>
              Change the status and add resolution notes for this complaint.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resolution">Resolution Notes</Label>
              <Textarea
                id="resolution"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add notes about the resolution or current status..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={isLoading || !newStatus}>
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
