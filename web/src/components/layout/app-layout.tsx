"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./sidebar";
import { UserNav } from "./user-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspace = /^\/tasks\/[^/]+$/.test(pathname);

  if (isWorkspace) {
    return (
      <TooltipProvider>
        <div className="h-screen w-screen overflow-hidden">
          {children}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="h-8 w-8" />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex-1" />
            <UserNav />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
