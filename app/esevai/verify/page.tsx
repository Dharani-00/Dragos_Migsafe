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

interface Worker {
  id: string
  full_name: string
  aadhaar_number: string | null
  mobile_number: string | null
  email: string | null
  registration_number: string
  job_type: string
  worksite_location: string
  approved_at: string
  stay_valid_until: string
  aadhaar_image?: string
  [key: string]: any
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
      // Search in approved workers
      const approvedWorkers = JSON.parse(localStorage.getItem('approved_workers') || '[]')
      const foundWorker = approvedWorkers.find((w: Worker) =>
        w.registration_number === registrationNumber.trim()
      )

      if (foundWorker) {
        setWorker(foundWorker)
      } else {
        setError('Worker not found with this registration number')
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
      setBiometricVerified(true)
      setShowBiometricDialog(false)
    }, 2000)
  }

  const handleRenewalApproval = () => {
    if (!worker || !biometricVerified) return

    try {
      // Update worker's stay validity (extend by 1 year)
      const currentExpiry = new Date(worker.stay_valid_until)
      const newExpiry = new Date(currentExpiry)
      newExpiry.setFullYear(newExpiry.getFullYear() + 1)

      // Update in approved workers
      const approvedWorkers = JSON.parse(localStorage.getItem('approved_workers') || '[]')
      const updatedWorkers = approvedWorkers.map((w: Worker) => {
        if (w.id === worker.id) {
          return {
            ...w,
            stay_valid_until: newExpiry.toISOString().split('T')[0],
            last_renewal: new Date().toISOString(),
            renewal_count: (w.renewal_count || 0) + 1
          }
        }
        return w
      })

      localStorage.setItem('approved_workers', JSON.stringify(updatedWorkers))

      // Add to renewals for tracking
      const renewals = JSON.parse(localStorage.getItem('renewals') || '[]')
      renewals.push({
        id: Date.now().toString(),
        worker_id: worker.id,
        registration_number: worker.registration_number,
        renewal_type: 'stay_extension',
        status: 'approved',
        requested_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        approved_by: 'esevai_staff',
        biometric_verified: true,
        new_expiry_date: newExpiry.toISOString().split('T')[0]
      })
      localStorage.setItem('renewals', JSON.stringify(renewals))

      setRenewalApproved(true)
      setWorker(null)
      setRegistrationNumber('')
      setBiometricVerified(false)
    } catch (err) {
      setError('Error processing renewal')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('esevai_auth')
    router.push('/esevai')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">E-Sevai Maiyam Portal</h1>
                <p className="text-sm text-gray-600">Biometric Verification System</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
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
                    <p className="font-medium text-gray-600">Full Name</p>
                    <p className="font-semibold">{worker.full_name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Registration Number</p>
                    <p className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                      {worker.registration_number}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Aadhaar Number</p>
                    <p>{worker.aadhaar_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Mobile Number</p>
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {worker.mobile_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Job Type</p>
                    <p>{worker.job_type}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Worksite Location</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {worker.worksite_location}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Stay Valid Until</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(worker.stay_valid_until).toLocaleDateString('en-IN')}
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