'use client'

import React from "react"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Shield, RefreshCw, Eye, EyeOff } from 'lucide-react'

function generateCaptcha(): { text: string; display: string } {
  const chars = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let text = ''
  for (let i = 0; i < 6; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  // Add some visual noise to display
  const display = text.split('').join(' ')
  return { text, display }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captcha, setCaptcha] = useState<{ text: string; display: string }>({ text: '', display: '' })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
  }, [])

  useEffect(() => {
    refreshCaptcha()
  }, [refreshCaptcha])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate CAPTCHA
    if (captchaInput.toUpperCase() !== captcha.text) {
      setError('Invalid CAPTCHA. Please try again.')
      refreshCaptcha()
      return
    }

    setIsLoading(true)

    try {
      if (email === 'admin@gov.in' && password === 'admin123') {
        router.push('/dashboard')
      } else {
        throw new Error('Invalid login credentials')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      refreshCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-secondary/30 p-4 md:p-8">
      <div className="w-full max-w-md">
        {/* Government Header */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Worker Registration Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Government of India - Labour Department
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the control panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gov.in"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA Section */}
              <div className="flex flex-col gap-2">
                <Label>Security Verification</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 flex-1 select-none items-center justify-center rounded-md bg-muted font-mono text-lg font-bold tracking-[0.3em] text-foreground">
                    {captcha.display}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={refreshCaptcha}
                    className="h-12 w-12 shrink-0 bg-transparent"
                    aria-label="Refresh CAPTCHA"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  type="text"
                  placeholder="Enter the code above"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="h-11 uppercase tracking-widest"
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          For authorized government personnel only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}
