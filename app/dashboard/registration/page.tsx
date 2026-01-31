'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
]

const JOB_TYPES = [
  'Construction Worker', 'Factory Worker', 'Agricultural Labour', 'Domestic Worker',
  'Driver', 'Security Guard', 'Cleaner', 'Cook', 'Helper', 'Technician',
  'Electrician', 'Plumber', 'Painter', 'Carpenter', 'Mason', 'Other'
]

export default function RegistrationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    aadhaar_number: '',
    mobile_number: '',
    email: '',
    date_of_birth: '',
    gender: '',
    state: '',
    district: '',
    address: '',
    pincode: '',
    job_type: '',
    contractor_id: '',
    employer_name: '',
    worksite_location: '',
    stay_valid_from: '',
    stay_valid_until: '',
    aadhaar_image: null as File | null,
  })

  const handleChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleChange('aadhaar_image', file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Convert image to base64 if present
      let aadhaarImageBase64 = null
      if (formData.aadhaar_image) {
        aadhaarImageBase64 = await convertFileToBase64(formData.aadhaar_image)
      }

      // Prepare registration data
      const registrationData = {
        ...formData,
        aadhaar_image: aadhaarImageBase64,
        date_of_birth: formData.date_of_birth || null,
        stay_valid_from: formData.stay_valid_from || null,
        stay_valid_until: formData.stay_valid_until || null,
        status: 'pending',
        registration_type: 'new',
        site: formData.worksite_location || 'Default Site',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Remove the File object before storing
      const { aadhaar_image, ...dataToStore } = registrationData

      // Store in localStorage for pending approvals database
      const existingRegistrations = JSON.parse(localStorage.getItem('pending_approvals') || '[]')
      existingRegistrations.push({
        id: Date.now(),
        ...dataToStore,
        aadhaar_image: aadhaarImageBase64
      })
      localStorage.setItem('pending_approvals', JSON.stringify(existingRegistrations))

      console.log('Registration stored in pending approvals:', dataToStore)
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/pending')
      }, 2000)
    } catch (err: unknown) {
      console.error('Registration failed:', err)
      setError('Failed to submit registration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <UserPlus className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Registration Submitted</h2>
            <p className="text-muted-foreground">
              Worker registration has been submitted successfully and is pending approval.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Worker Registration</h1>
          <p className="text-muted-foreground">
            Register a new migrant worker in the system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details of the worker</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Enter full name as per ID"
              />
            </div>
            <div>
              <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
              <Input
                id="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={(e) => handleChange('aadhaar_number', e.target.value)}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
              />
            </div>
            <div>
              <Label htmlFor="aadhaar_image">Aadhaar Image</Label>
              <Input
                id="aadhaar_image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {formData.aadhaar_image && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {formData.aadhaar_image.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                value={formData.mobile_number}
                onChange={(e) => handleChange('mobile_number', e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="worker@email.com"
              />
            </div>
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Address Details */}
        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
            <CardDescription>Permanent address of the worker</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                required
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="Enter district name"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="House/Street/Village details"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="pincode">PIN Code</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="6-digit PIN code"
                maxLength={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Details */}
        <Card>
          <CardHeader>
            <CardTitle>Work Details</CardTitle>
            <CardDescription>Employment and contractor information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="job_type">Job Type *</Label>
              <Select value={formData.job_type} onValueChange={(v) => handleChange('job_type', v)}>
                <SelectTrigger id="job_type">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((job) => (
                    <SelectItem key={job} value={job}>{job}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contractor_id">Contractor ID</Label>
              <Input
                id="contractor_id"
                value={formData.contractor_id}
                onChange={(e) => handleChange('contractor_id', e.target.value)}
                placeholder="Registered contractor ID"
              />
            </div>
            <div>
              <Label htmlFor="employer_name">Employer Name</Label>
              <Input
                id="employer_name"
                value={formData.employer_name}
                onChange={(e) => handleChange('employer_name', e.target.value)}
                placeholder="Name of employer/company"
              />
            </div>
            <div>
              <Label htmlFor="worksite_location">Worksite Location</Label>
              <Input
                id="worksite_location"
                value={formData.worksite_location}
                onChange={(e) => handleChange('worksite_location', e.target.value)}
                placeholder="Current work location"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stay Validity */}
        <Card>
          <CardHeader>
            <CardTitle>Stay Validity</CardTitle>
            <CardDescription>Duration of authorized stay</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="stay_valid_from">Valid From</Label>
              <Input
                id="stay_valid_from"
                type="date"
                value={formData.stay_valid_from}
                onChange={(e) => handleChange('stay_valid_from', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stay_valid_until">Valid Until</Label>
              <Input
                id="stay_valid_until"
                type="date"
                value={formData.stay_valid_until}
                onChange={(e) => handleChange('stay_valid_until', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? 'Submitting...' : 'Submit Registration'}
          </Button>
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
