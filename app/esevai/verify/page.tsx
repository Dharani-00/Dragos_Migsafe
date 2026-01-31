'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Fingerprint,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { findWorkerByUniqueId, updateWorker } from '@/lib/workers'

interface Worker {
  id: string
  name: string
  uniqueId: string
  biometricData: {
    fingerprint: string | null
    facialScan: string | null
    verified: boolean
  }
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export default function ESevaiVerifyPage() {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [worker, setWorker] = useState<Worker | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [biometricVerified, setBiometricVerified] = useState(false)
  const [showBiometricDialog, setShowBiometricDialog] = useState(false)
  const [renewalApproved, setRenewalApproved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('esevai_auth')
    if (!auth) {
      router.push('/esevai')
      return
    }

    const authData = JSON.parse(auth)
    if (!authData.authenticated) {
      router.push('/esevai')
    }
  }, [router])

  const handleSearch = async () => {
    if (!registrationNumber.trim()) {
      setError('Please enter a registration number')
      return
    }

    setIsLoading(true)
    setError('')
    setWorker(null)
    setBiometricVerified(false)
    setRenewalApproved(false)

    try {
      // Search using shared worker data model
      const foundWorker = findWorkerByUniqueId(registrationNumber.trim())

      if (foundWorker && foundWorker.status === 'approved') {
        setWorker(foundWorker)
      } else {
        setError('Worker not found or not approved for renewal')
      }
    } catch (err) {
      setError('Error searching for worker')
    }

    setIsLoading(false)
  }

  const handleBiometricVerification = () => {
    setShowBiometricDialog(true)
  }

  const performBiometricVerification = () => {
    // Simulate biometric verification - in real implementation, this would connect to biometric hardware
    setTimeout(() => {
      if (worker) {
        // Update worker's biometric verification status
        updateWorker(worker.id, {
          biometricData: {
            ...worker.biometricData,
            verified: true
          }
        })
      }
      setBiometricVerified(true)
      setShowBiometricDialog(false)
    }, 2000)
  }

  const handleRenewalApproval = () => {
    if (!worker || !biometricVerified) return

    try {
      // Extend stay validity by 1 year (this would be handled by admin in real system)
      // For demo purposes, we'll just mark the renewal as approved
      setRenewalApproved(true)

      // In a real system, this would trigger an admin notification for final approval
      alert('Renewal request submitted successfully! Admin will review and approve.')

    } catch (err) {
      setError('Error processing renewal')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('esevai_auth')
    router.push('/esevai')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg shadow-md hover-lift transition-transform">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">E-Sevai Maiyam Portal</h1>
                <p className="text-sm text-gray-600">Biometric Verification System</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 hover-lift transition-all">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Worker Verification
            </CardTitle>
            <CardDescription>
              Enter the worker's unique registration number to verify their identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input
                  id="regNumber"
                  placeholder="Enter registration number (e.g., MIG1704123456789123)"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Worker Details */}
        {worker && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Worker Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Worker Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Worker Name</p>
                    <p className="font-semibold flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {worker.name}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Unique ID</p>
                    <p className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                      {worker.uniqueId}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Biometric Status</p>
                    <Badge variant={worker.biometricData.verified ? "default" : "secondary"}
                           className={worker.biometricData.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {worker.biometricData.verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Registration Date</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(worker.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Status</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </div>
                </div>

                {/* Aadhaar Image */}
                {worker.aadhaar_image && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-600 mb-2">Aadhaar Image</p>
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <img
                        src={worker.aadhaar_image}
                        alt="Aadhaar Card"
                        className="max-w-full h-auto max-h-32 rounded"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Biometric Verification
                </CardTitle>
                <CardDescription>
                  Perform biometric verification for renewal approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Biometric Verification</span>
                    {biometricVerified ? (
                      <Badge className="bg-green-100 text-green-800 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Stay Validity</span>
                    <span className={`text-sm ${new Date(worker.stay_valid_until) > new Date() ? 'text-green-600' : 'text-red-600'}`}>
                      {new Date(worker.stay_valid_until) > new Date() ? 'Valid' : 'Expired'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {!biometricVerified ? (
                    <Button
                      onClick={handleBiometricVerification}
                      className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      <Fingerprint className="h-4 w-4" />
                      Start Biometric Verification
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRenewalApproval}
                      className="w-full bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Renewal (Extend 1 Year)
                    </Button>
                  )}
                </div>

                {renewalApproved && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Renewal approved successfully! Stay validity extended by 1 year.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Renewals */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Renewal Approvals</CardTitle>
            <CardDescription>
              Latest renewals processed through this portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentRenewalsTable />
          </CardContent>
        </Card>
      </div>

      {/* Biometric Verification Dialog */}
      <Dialog open={showBiometricDialog} onOpenChange={setShowBiometricDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-blue-600" />
              Biometric Verification
            </DialogTitle>
            <DialogDescription>
              Performing fingerprint and facial recognition verification...
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Fingerprint className="h-16 w-16 text-blue-600 mx-auto" />
              </div>
              <p className="text-sm text-gray-600">
                Please place your finger on the scanner and look at the camera...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={performBiometricVerification} className="bg-blue-600 hover:bg-blue-700">
              Complete Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RecentRenewalsTable() {
  const [renewals, setRenewals] = useState<any[]>([])

  useEffect(() => {
    const storedRenewals = JSON.parse(localStorage.getItem('renewals') || '[]')
    const recentRenewals = storedRenewals
      .filter((r: any) => r.status === 'approved')
      .sort((a: any, b: any) => new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime())
      .slice(0, 5)
    setRenewals(recentRenewals)
  }, [])

  if (renewals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Fingerprint className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent renewals</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Registration Number</TableHead>
          <TableHead>Renewal Type</TableHead>
          <TableHead>New Expiry</TableHead>
          <TableHead>Approved At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {renewals.map((renewal) => (
          <TableRow key={renewal.id}>
            <TableCell className="font-mono text-sm">
              {renewal.registration_number}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{renewal.renewal_type}</Badge>
            </TableCell>
            <TableCell>
              {new Date(renewal.new_expiry_date).toLocaleDateString('en-IN')}
            </TableCell>
            <TableCell>
              {new Date(renewal.approved_at).toLocaleDateString('en-IN')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}