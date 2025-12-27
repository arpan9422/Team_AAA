"use client"

import * as React from "react"
import {
    IconDashboard,
    IconClipboardCheck,
    IconUser,
    IconHelp,
    IconSettings,
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

// Technician navigation data
const data = {
    user: {
        name: "Technician User",
        email: "technician@example.com",
        avatar: "/avatars/technician.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/technician-dashboard",
            icon: IconDashboard,
        },
        {
            title: "My Tasks",
            url: "/technician-dashboard/tasks",
            icon: IconClipboardCheck,
        },
        {
            title: "Profile",
            url: "/technician-dashboard/profile",
            icon: IconUser,
        },
    ],
    navSecondary: [
        {
            title: "Support",
            url: "#",
            icon: IconHelp,
        },
        {
            title: "Settings",
            url: "#",
            icon: IconSettings,
        },
    ],
}

export function TechnicianSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/technician-dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <IconClipboardCheck className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Technician Portal</span>
                                    <span className="truncate text-xs">Maintenance System</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
