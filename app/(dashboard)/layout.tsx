'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, Package, CheckCircle, Settings, Menu } from 'lucide-react'
import { useState } from 'react'
import { useRequireAuth } from '@/lib/auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isLoading } = useRequireAuth()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '/audit', label: 'Audit', icon: CheckCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-lg font-semibold text-foreground">Restoring your session...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border transition-all duration-300 flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          {sidebarOpen ? (
            <h2 className="text-sm font-bold text-primary truncate">SJI OS</h2>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted/50'
                }`}
                title={item.label}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition"
          >
            <Menu size={20} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <h1 className="text-lg font-bold text-foreground">SMART JEWELLERY INVENTORY OS</h1>
              <p className="text-sm text-muted-foreground">Tap a section to navigate</p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-muted/10 text-foreground hover:bg-muted/20 transition"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
