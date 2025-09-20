"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Boxes, ShoppingBag, Building, LogOut, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";
import type { User } from "@/lib/types";


const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", requiredRole: ["admin", "sales", "Pending"] },
  { href: "/dealers", icon: Building, label: "Dealers", requiredRole: ["admin"] },
  { href: "/customers", icon: Users, label: "Customers", requiredRole: ["admin", "sales"] },
  { href: "/inventory", icon: Boxes, label: "Inventory", requiredRole: ["admin", "sales"] },
  { href: "/admin", icon: ShieldCheck, label: "Admin", requiredRole: ["admin"] },
];

export function Nav({ user }: { user: User }) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(user.role);
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <h2 className="font-headline text-xl font-semibold text-primary-foreground tracking-tight">
                FancyPearls
            </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <form action={signOut} className="w-full">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="mr-2" />
                <span>Sign Out</span>
            </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
