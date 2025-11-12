"use client";

import { Bell, Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/reusable/theme-toggle";
import { useUser } from "@/lib/hooks/use-user";
import { useOrganization } from "@/lib/hooks/use-organization";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  const { user, loading } = useUser();
  const { currentOrg } = useOrganization();

  const displayName = user?.email ?? (loading ? "Loading…" : "User");
  const email = user?.email ?? "";
  const initials = user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 flex bg-card h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Search..."
              className="pl-9 pr-16 bg-background/80 shadow-sm"
              aria-label="Search"
            />
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2 py-1">
              <kbd className="font-medium">⌘</kbd>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">

          <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Messages">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-medium">{displayName}</span>
              {currentOrg && (
                <span className="text-[11px] text-muted-foreground">{currentOrg.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
