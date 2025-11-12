import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar/AppSidebar'
import { Header } from '@/components/reusable/Header'
import { Separator } from '@/components/ui/separator'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is not logged in, redirect to login
  if (!user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
          <div className="min-h-screen w-full ">
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 min-w-0 flex flex-col w-full bg-sidebar">
                <Header />
                <main className="relative px-2 md:px-2 pb-2 md:pb-2 md:pl-2 bg-sidebar min-h-screen w-full overflow-hidden">
                  <div className="relative rounded-xl overflow-hidden shadow-md min-h-screen bg-background w-full border "style={{ transform: "translateZ(0)" }}>
                    <div className="relative z-2 p-4 md:p-8 w-full">
                      {children}
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </SidebarProvider>
  )
}

