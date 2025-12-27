"use client"

import * as React from "react"
import { TechnicianSidebar } from "@/components/technician-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog } from "@/components/ui/dialog"
import { RequestDetailsDialog } from "@/components/request-details-dialog"
import api from "@/lib/api"
import {
    IconClipboardCheck,
    IconClock,
    IconAlertTriangle,
    IconCircleCheck,
    IconTool,
    IconChartBar
} from "@tabler/icons-react"

// Mock data for technician stats
const stats = [
    {
        title: "Assigned Tasks",
        value: "12",
        description: "Active assignments",
        icon: IconClipboardCheck,
        color: "text-accent-cyan",
        bgColor: "bg-accent-cyan/10"
    },
    {
        title: "Pending Approval",
        value: "3",
        description: "Awaiting manager approval",
        icon: IconClock,
        color: "text-accent-yellow",
        bgColor: "bg-accent-yellow/10"
    },
    {
        title: "Urgent",
        value: "2",
        description: "High priority tasks",
        icon: IconAlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50"
    },
    {
        title: "Completed",
        value: "45",
        description: "This month",
        icon: IconCircleCheck,
        color: "text-primary",
        bgColor: "bg-primary/10"
    }
]

// Mock recent tasks with complete details
const recentTasks = [
    {
        id: 1,
        title: "Laptop overheating issue",
        description: "Laptop is overheating during normal operations. Check cooling system and thermal paste. Fan making unusual noise.",
        requestType: "CORRECTIVE",
        equipmentId: "eq-001",
        equipmentName: "Dell XPS 15",
        serialNumber: "DX-100293",
        location: "Building A - Floor 3 - Desk 42",
        department: "Engineering",
        purchaseDate: "2022-03-15",
        warrantyEnd: "2025-03-15",
        equipmentStatus: "ACTIVE",
        priority: "High",
        status: "IN_PROGRESS",
        assignedDate: "2024-04-12",
        scheduledDate: "2024-04-13T09:00:00",
        createdBy: "John Manager",
        createdAt: "2024-04-11T14:30:00",
        technicianId: "tech-001",
        technicianName: "Alice Smith"
    },
    {
        id: 2,
        title: "Server maintenance",
        description: "Routine quarterly maintenance check for server rack. Includes cleaning, cable management, and performance testing.",
        requestType: "PREVENTIVE",
        equipmentId: "eq-002",
        equipmentName: "Server Rack A",
        serialNumber: "SR-99281",
        location: "Data Center - Row 5 - Rack A",
        department: "IT Operations",
        purchaseDate: "2020-01-10",
        warrantyEnd: "2025-01-10",
        equipmentStatus: "ACTIVE",
        priority: "Medium",
        status: "REPAIRED",
        assignedDate: "2024-04-10",
        scheduledDate: "2024-04-15T10:00:00",
        createdBy: "Sarah Admin",
        createdAt: "2024-04-09T08:15:00",
        completedAt: "2024-04-14T16:30:00",
        technicianId: "tech-002",
        technicianName: "Bob Jones"
    },
    {
        id: 3,
        title: "Monitor replacement",
        description: "Replace broken monitor screen. Screen has dead pixels and flickering issues.",
        requestType: "CORRECTIVE",
        equipmentId: "eq-003",
        equipmentName: "LG Monitor 27",
        serialNumber: "LG-22311",
        location: "Building B - Floor 2 - Conference Room 201",
        department: "Marketing",
        purchaseDate: "2021-06-20",
        warrantyEnd: "2024-06-20",
        equipmentStatus: "ACTIVE",
        priority: "Low",
        status: "NEW",
        assignedDate: "2024-04-08",
        scheduledDate: "2024-04-20T14:00:00",
        createdBy: "Mike Director",
        createdAt: "2024-04-08T11:00:00",
        technicianId: null,
        technicianName: null
    }
]

export default function TechnicianDashboard() {
    const [selectedTask, setSelectedTask] = React.useState<any | null>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [dashboardData, setDashboardData] = React.useState<any>(null)
    const [activeTasks, setActiveTasks] = React.useState<any[]>([])

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [dashRes, tasksRes] = await Promise.all([
                    api.get('/technician/dashboard'),
                    api.get('/requests/my-requests', { params: { status: 'IN_PROGRESS' } })
                ])
                setDashboardData(dashRes.data)
                setActiveTasks(tasksRes.data)
            } catch (error) {
                console.error("Failed to fetch technician dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleTaskClick = (task: any) => {
        setSelectedTask(task)
        setIsDialogOpen(true)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-bg-soft">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const stats = [
        {
            title: "Active Jobs",
            value: dashboardData?.stats?.activeJobs || 0,
            description: "Work in progress",
            icon: IconClipboardCheck,
            color: "text-accent-cyan",
            bgColor: "bg-accent-cyan/10"
        },
        {
            title: "Pending in Queue",
            value: dashboardData?.stats?.pendingJobs || 0,
            description: "Available from team",
            icon: IconClock,
            color: "text-accent-yellow",
            bgColor: "bg-accent-yellow/10"
        },
        {
            title: "Overdue",
            value: dashboardData?.stats?.overdueJobs || 0,
            description: "> 24h in progress",
            icon: IconAlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        {
            title: "Completed",
            value: dashboardData?.stats?.completedThisMonth || 0,
            description: "This month",
            icon: IconCircleCheck,
            color: "text-primary",
            bgColor: "bg-primary/10"
        }
    ]

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <TechnicianSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6 bg-bg-soft">

                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Technician Dashboard</h2>
                        <p className="text-muted-foreground">
                            Welcome back! Here's an overview of your tasks and assignments.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`size-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                        <stat.icon className={`size-5 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Recent Tasks */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconTool className="size-5 text-accent-yellow" />
                                Recent Tasks
                            </CardTitle>
                            <CardDescription>
                                Your latest maintenance assignments - Click to view details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activeTasks.length > 0 ? (
                                    activeTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => handleTaskClick(task)}
                                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 hover:border-accent-cyan/50 transition-all cursor-pointer group"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <h4 className="font-medium group-hover:text-accent-cyan transition-colors">{task.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {task.equipment?.name} • Assigned {new Date(task.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={
                                                        task.priority === "HIGH" || task.priority === "CRITICAL" ? "destructive" :
                                                            task.priority === "MEDIUM" ? "default" : "secondary"
                                                    }
                                                >
                                                    {task.priority}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        task.status === "NEW" ? "border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10" :
                                                            task.status === "IN_PROGRESS" ? "border-accent-yellow/30 text-accent-yellow bg-accent-yellow/10" :
                                                                task.status === "REPAIRED" ? "border-primary/30 text-primary bg-primary/10" :
                                                                    "border-green-200 text-green-700 bg-green-50"
                                                    }
                                                >
                                                    {task.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No active tasks found. Go to the tasks page to pick up new work.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Task Details Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    {selectedTask && <RequestDetailsDialog data={selectedTask} />}
                </Dialog>

            </SidebarInset>
        </SidebarProvider>
    )
}
