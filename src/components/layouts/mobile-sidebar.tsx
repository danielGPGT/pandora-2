'use client'

import { useUIStore } from '@/stores/ui-store'
import { Sidebar } from './sidebar'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}

