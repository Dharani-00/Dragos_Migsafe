import React from "react"
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex min-h-svh bg-background">
      <DashboardSidebar userEmail="admin@gov.in" />
      <div className="flex flex-1 flex-col lg:ml-64">
        <DashboardHeader userEmail="admin@gov.in" />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
