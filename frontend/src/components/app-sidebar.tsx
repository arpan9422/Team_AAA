"use client"

import * as React from "react"
import {
  IconCalendar,
  IconFileDescription,
  IconHelp,
  IconSearch,
  IconSettings,
  IconShield,
  IconTools,
  IconUsers,
  IconDashboard,
  IconBuildingFactory,
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "john doe",
    email: "Manager",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
  },
  navMain: [
    {
      title: "Overview",
      url: "/manager-dashboard",
      icon: IconDashboard,
    },
    {
      title: "Request",
      url: "/manager-dashboard/requests",
      icon: IconFileDescription,
    },
    {
      title: "Equipment",
      url: "/manager-dashboard/equipment",
      icon: IconTools,
    },
    {
      title: "Teams",
      url: "/manager-dashboard/teams",
      icon: IconUsers,
    },
    {
      title: "Work Centers",
      url: "/manager-dashboard/work-centers",
      icon: IconBuildingFactory,
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/manager-dashboard">
                <IconShield className="!size-5" />
                <span className="text-base font-semibold">Gear Guard</span>
                <div className="w-2 h-2 bg-accent-yellow rounded-full"></div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
