"use client";

import Image from "next/image";
import * as React from "react";
import { useTheme } from "next-themes";
import {
  LayoutGrid,
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
  HelpCircle,
  Search,
} from "lucide-react";

import { NavDocuments } from "@/components/sidebar/nav-documents";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { UserCard } from "@/components/sidebar/user-card";
import { useUser } from "@/lib/hooks/use-user";
import { useOrganization } from "@/lib/hooks/use-organization";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Setup",
      url: "/setup",
      icon: Settings,
      items: [
        {
          title: "Sports",
          url: "/setup/sports",
        },
        {
          title: "Venues",
          url: "/setup/venues",
        },
        {
          title: "Teams",
          url: "/setup/teams",
        },
        {
          title: "Tournaments",
          url: "/setup/tournaments",
        },
        {
          title: "Events",
          url: "/setup/events",
        },
      ],
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
    },
    {
      title: "Quotes",
      url: "/quotes",
      icon: FileText,
    },
    {
      title: "Packages",
      url: "/packages",
      icon: Package,
    },
  ],
  navDocuments: [
    {
      name: "Inventory",
      url: "/inventory",
      icon: Luggage,
    },
    {
      name: "Operations",
      url: "/operations",
      icon: Users,
    },
    {
      name: "Reports",
      url: "/reports",
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: HelpCircle,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useUser()
  const { theme } = useTheme()
  const { currentOrg } = useOrganization()
  
  const userData = {
    name: user?.email ?? (loading ? 'Loading…' : 'User'),
    email: user?.email || '',
    avatar: undefined, // Supabase User doesn't have avatar_url by default
    organization: currentOrg?.name || 'Organization',
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="border-none"
    >
      <SidebarHeader className="p-4">
        <a href="/dashboard" className="flex items-center">
          <h1 className="text-xl font-bold">TourOps</h1>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.navDocuments} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserCard
          name={userData.name}
          email={userData.email}
          avatar={userData.avatar}
          organization={userData.organization}
        />
      </SidebarFooter>
    </Sidebar>
  )
}


