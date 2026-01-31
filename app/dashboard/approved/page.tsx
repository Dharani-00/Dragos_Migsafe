'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, Shield } from 'lucide-react'

interface ApprovedWorker {
  id: string
  full_name: string
  aadhaar_number: string | null
  mobile_number: string | null
  email: string | null
  registration_number: string
  job_type: string
  worksite_location: string
  approved_at: string
  [key: string]: any
}

export default function ApprovedPage() {
  const [workers, setWorkers] = useState<ApprovedWorker[]>([])
  const [selectedWorker, setSelectedWorker] = useState<ApprovedWorker | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const loadApprovedWorkers = () => {
      try {
        const approvedWorkers = JSON.parse(localStorage.getItem('approved_workers') || '[]')
        // Sort by approval date (newest first)
        approvedWorkers.sort((a: ApprovedWorker, b: ApprovedWorker) =>
          new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime()
        )
        setWorkers(approvedWorkers)
      } catch (error) {
        console.error('Error loading approved workers:', error)
        setWorkers([])
      }
    }

    loadApprovedWorkers()
  }, [])

  const handleViewDetails = (worker: ApprovedWorker) => {
    setSelectedWorker(worker)
    setShowDetails(true)
  }

  if (workers.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approved Workers</h1>
          <p className="text-muted-foreground">
            Workers who have been approved and assigned unique registration numbers
          </p>
        </div>

        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Shield className="h-8 w-8 opacity-50" />
            <p>No approved workers yet.</p>
            <p className="text-sm">Process pending registrations to approve workers.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approved Workers</h1>
        <p className="text-muted-foreground">
          Workers who have been approved and assigned unique registration numbers
        </p>
      </div>

      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-600">Approved Workers Database</p>
            <p className="text-sm text-muted-foreground">
              These workers have been processed and approved. Each has been assigned a unique registration number
              that is stored privately and securely. Registration numbers follow the format: MIG[timestamp][random].
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Registrations ({workers.length})</CardTitle>
          <CardDescription>
            All approved workers with their unique registration numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Registration Number</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Job Type</TableHead>
                  <TableHead>Approved Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        {worker.full_name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {worker.registration_number}
                      </code>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {worker.mobile_number || worker.email || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{worker.job_type}</TableCell>
                    <TableCell>
                      {new Date(worker.approved_at).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleViewDetails(worker)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Approved Worker Details
            </DialogTitle>
            <DialogDescription>Complete approved worker information</DialogDescription>
          </DialogHeader>
          {selectedWorker && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Full Name</p>
                  <p>{selectedWorker.full_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Registration Number</p>
                  <p className="font-mono text-lg font-bold bg-emerald-100 text-emerald-800 px-3 py-2 rounded">
                    {selectedWorker.registration_number}
                  </p>
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
                  <p className="font-medium text-muted-foreground">Job Type</p>
                  <p>{selectedWorker.job_type}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Worksite Location</p>
                  <p>{selectedWorker.worksite_location || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Approved Date</p>
                  <p>{new Date(selectedWorker.approved_at).toLocaleDateString('en-IN')}</p>
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

              <div className="rounded-md bg-emerald-500/10 p-4">
                <p className="font-medium text-emerald-600 mb-2">Approval Information</p>
                <div className="grid grid-cols-2 gap-2 text-emerald-600/80 text-sm">
                  <div>
                    <p className="font-medium">Status</p>
                    <p>Approved</p>
                  </div>
                  <div>
                    <p className="font-medium">Registration ID</p>
                    <p className="font-mono">{selectedWorker.registration_number}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}