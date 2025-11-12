'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Package,
  BarChart3,
  Settings,
  Luggage,
  Users,
  Trophy,
  MapPin,
  Award,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Setup',
    icon: Settings,
    children: [
      { name: 'Sports', href: '/setup/sports', icon: Trophy },
      { name: 'Venues', href: '/setup/venues', icon: MapPin },
      { name: 'Teams', href: '/setup/teams', icon: Users },
      { name: 'Tournaments', href: '/setup/tournaments', icon: Award },
      { name: 'Events', href: '/setup/events', icon: Calendar },
    ]
  },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Packages', href: '/packages', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Luggage },
  { name: 'Operations', href: '/operations', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">TourOps</h1>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            if ('children' in item && item.children) {
              // Handle nested navigation
              const isParentActive = item.children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'))
              return (
                <div key={item.name} className="space-y-1">
                  <div className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isParentActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700'
                  )}>
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </div>
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href || pathname.startsWith(child.href + '/')
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <child.icon className="h-4 w-4" />
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

