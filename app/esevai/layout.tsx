import React from "react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E-Sevai Maiyam - Migrant Worker Verification Portal',
  description: 'Public portal for e-sevai maiyam staff to verify migrant workers and process renewal approvals',
  generator: 'v0.app',
}

export default function ESevaiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}