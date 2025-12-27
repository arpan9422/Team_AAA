"use client"

import * as React from "react"
import { TechnicianSidebar } from "@/components/technician-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog } from "@/components/ui/dialog"
import { RequestDetailsDialog } from "@/components/request-details-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    IconSearch,
    IconFilter,
    IconClock,
    IconAlertTriangle,
    IconTool,
    IconCheck,
    IconHandStop,
    IconPlayerPlay,
    IconSend
} from "@tabler/icons-react"

// Enhanced task type matching database schema
type Task = {
    id: number
    title: string
    description: string
    requestType: "CORRECTIVE" | "PREVENTIVE"
    equipmentId: string
    equipmentName: string
    serialNumber: string
    location: string
    department: string
    purchaseDate: string
    warrantyEnd: string
    equipmentStatus: string
    priority: "High" | "Medium" | "Low"
    status: "NEW" | "REQUESTED" | "IN_PROGRESS" | "REPAIRED" | "COMPLETED"
    assignedDate?: string
    scheduledDate: string
    createdBy: string
    createdAt: string
    completedAt?: string
    technicianId?: string | null
    technicianName?: string | null
}

// Mock data - NEW tasks (unassigned) and tasks in various states
const mockTasks: Task[] = [
    // NEW TASKS (Available for request)
    {
        id: 1,
        title: "AC unit not cooling properly",
        description: "Air conditioning unit in conference room is running but not cooling effectively. Temperature remains at 28°C despite being set to 22°C.",
        requestType: "CORRECTIVE",
        equipmentId: "eq-101",
        equipmentName: "Daikin AC Unit 3.5 Ton",
        serialNumber: "DAI-45892",
        location: "Building A - Floor 2 - Conference Room 201",
        department: "Administration",
        purchaseDate: "2021-05-15",
        warrantyEnd: "2026-05-15",
        equipmentStatus: "ACTIVE",
        priority: "High",
        status: "NEW",
        scheduledDate: "2024-04-15T10:00:00",
        createdBy: "Sarah Admin",
        createdAt: "2024-04-14T09:30:00",
        technicianId: null,
        technicianName: null
    },
    {
        id: 2,
        title: "Projector lamp replacement",
        description: "Projector lamp is dim and needs replacement. Estimated lamp hours: 4500/5000.",
        requestType: "PREVENTIVE",
        equipmentId: "eq-102",
        equipmentName: "Epson PowerLite Projector",
        serialNumber: "EPS-22341",
        location: "Building B - Floor 3 - Training Room",
        department: "HR",
        purchaseDate: "2022-01-10",
        warrantyEnd: "2025-01-10",
        equipmentStatus: "ACTIVE",
        priority: "Medium",
        status: "NEW",
        scheduledDate: "2024-04-18T14:00:00",
        createdBy: "Mike HR Manager",
        createdAt: "2024-04-13T11:00:00",
        technicianId: null,
        technicianName: null
    },
    {
        id: 3,
        title: "Network router firmware update",
        description: "Critical security firmware update required for main office router. Scheduled during off-hours to minimize disruption.",
        requestType: "PREVENTIVE",
        equipmentId: "eq-103",
        equipmentName: "Cisco Router 4000 Series",
        serialNumber: "CIS-78921",
        location: "Data Center - Rack B5",
        department: "IT Operations",
        purchaseDate: "2020-08-20",
        warrantyEnd: "2025-08-20",
        equipmentStatus: "ACTIVE",
        priority: "High",
        status: "NEW",
        scheduledDate: "2024-04-16T22:00:00",
        createdBy: "John IT Director",
        createdAt: "2024-04-14T08:15:00",
        technicianId: null,
        technicianName: null
    },
    {
        id: 4,
        title: "Coffee machine water leak",
        description: "Office coffee machine is leaking water from the bottom. Needs immediate attention to prevent floor damage.",
        requestType: "CORRECTIVE",
        equipmentId: "eq-104",
        equipmentName: "Jura Commercial Coffee Machine",
        serialNumber: "JUR-33421",
        location: "Building A - Floor 1 - Pantry",
        department: "Facilities",
        purchaseDate: "2023-02-01",
        warrantyEnd: "2026-02-01",
        equipmentStatus: "ACTIVE",
        priority: "Medium",
        status: "NEW",
        scheduledDate: "2024-04-15T08:00:00",
        createdBy: "Lisa Facilities",
        createdAt: "2024-04-14T07:45:00",
        technicianId: null,
        technicianName: null
    },
    // REQUESTED TASKS (Technician has requested to work on these)
    {
        id: 5,
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
        status: "REQUESTED",
        assignedDate: "2024-04-12",
        scheduledDate: "2024-04-13T09:00:00",
        createdBy: "John Manager",
        createdAt: "2024-04-11T14:30:00",
        technicianId: "tech-001",
        technicianName: "Current User"
    },
    // IN PROGRESS TASKS
    {
        id: 6,
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
        status: "IN_PROGRESS",
        assignedDate: "2024-04-10",
        scheduledDate: "2024-04-15T10:00:00",
        createdBy: "Sarah Admin",
        createdAt: "2024-04-09T08:15:00",
        technicianId: "tech-001",
        technicianName: "Current User"
    },
    // COMPLETED TASKS
    {
        id: 7,
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
        status: "COMPLETED",
        assignedDate: "2024-04-08",
        scheduledDate: "2024-04-20T14:00:00",
        createdBy: "Mike Director",
        createdAt: "2024-04-08T11:00:00",
        completedAt: "2024-04-12T16:30:00",
        technicianId: "tech-001",
        technicianName: "Current User"
    }
]

export default function TechnicianTasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>(mockTasks)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState("new")

    // Filter tasks by tab and search
    const filterTasksByStatus = (status: Task["status"][]) => {
        return tasks.filter(task => {
            const matchesStatus = status.includes(task.status)
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
            return matchesStatus && matchesSearch && matchesPriority
        })
    }

    const newTasks = filterTasksByStatus(["NEW"])
    const requestedTasks = filterTasksByStatus(["REQUESTED"])
    const myTasks = filterTasksByStatus(["IN_PROGRESS", "REPAIRED"])
    const completedTasks = filterTasksByStatus(["COMPLETED"])

    // Handle requesting to work on a task
    const handleRequestTask = (taskId: number) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, status: "REQUESTED" as const, technicianId: "tech-001", technicianName: "Current User" }
                : task
        ))
    }

    // Handle canceling a request
    const handleCancelRequest = (taskId: number) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, status: "NEW" as const, technicianId: null, technicianName: null }
                : task
        ))
    }

    // Handle starting work on a task
    const handleStartWork = (taskId: number) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, status: "IN_PROGRESS" as const, assignedDate: new Date().toISOString().split('T')[0] }
                : task
        ))
    }

    // Handle submitting completed work
    const handleSubmitWork = (taskId: number) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, status: "REPAIRED" as const }
                : task
        ))
    }

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task)
        setIsDetailOpen(true)
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High": return "destructive"
            case "Medium": return "default"
            case "Low": return "secondary"
            default: return "outline"
        }
    }

    const getStatusBadge = (status: Task["status"]) => {
        switch (status) {
            case "NEW":
                return <Badge variant="outline" className="border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10">Available</Badge>
            case "REQUESTED":
                return <Badge variant="outline" className="border-accent-yellow/30 text-accent-yellow bg-accent-yellow/10">Requested</Badge>
            case "IN_PROGRESS":
                return <Badge variant="outline" className="border-accent-yellow/30 text-accent-yellow bg-accent-yellow/10">In Progress</Badge>
            case "REPAIRED":
                return <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">Awaiting Approval</Badge>
            case "COMPLETED":
                return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Completed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const TaskCard = ({ task }: { task: Task }) => (
        <Card className="hover:shadow-md transition-all hover:border-accent-cyan/50 cursor-pointer group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                        <CardTitle className="text-base group-hover:text-accent-cyan transition-colors">
                            {task.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {task.equipmentName} • {task.serialNumber}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant={getPriorityColor(task.priority) as any}>
                            {task.priority}
                        </Badge>
                        {getStatusBadge(task.status)}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <IconClock className="size-3" />
                        <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <span>{task.department}</span>
                </div>
                <div className="flex gap-2">
                    {task.status === "NEW" && (
                        <>
                            <Button
                                size="sm"
                                className="flex-1 bg-accent-cyan hover:bg-accent-cyan/90 text-white"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRequestTask(task.id)
                                }}
                            >
                                <IconSend className="mr-2 size-4" />
                                Request Task
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleTaskClick(task)
                                }}
                            >
                                View Details
                            </Button>
                        </>
                    )}
                    {task.status === "REQUESTED" && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleCancelRequest(task.id)
                                }}
                            >
                                <IconHandStop className="mr-2 size-4" />
                                Cancel Request
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleTaskClick(task)
                                }}
                            >
                                View Details
                            </Button>
                        </>
                    )}
                    {task.status === "IN_PROGRESS" && (
                        <>
                            <Button
                                size="sm"
                                className="flex-1 bg-accent-yellow hover:bg-accent-yellow/90 text-white"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleSubmitWork(task.id)
                                }}
                            >
                                <IconCheck className="mr-2 size-4" />
                                Submit Work
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleTaskClick(task)
                                }}
                            >
                                View Details
                            </Button>
                        </>
                    )}
                    {(task.status === "REPAIRED" || task.status === "COMPLETED") && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleTaskClick(task)
                            }}
                        >
                            View Details
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )

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
                        <h2 className="text-2xl font-bold tracking-tight text-text-primary">My Tasks</h2>
                        <p className="text-muted-foreground">
                            Browse available tasks and request to work on them
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                className="pl-8 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[200px]">
                                <IconFilter className="mr-2 size-4" />
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="High">High Priority</SelectItem>
                                <SelectItem value="Medium">Medium Priority</SelectItem>
                                <SelectItem value="Low">Low Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                            <TabsTrigger value="new" className="relative">
                                Available
                                {newTasks.length > 0 && (
                                    <Badge className="ml-2 bg-accent-cyan text-white" variant="secondary">
                                        {newTasks.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="requested" className="relative">
                                Requested
                                {requestedTasks.length > 0 && (
                                    <Badge className="ml-2 bg-accent-yellow text-white" variant="secondary">
                                        {requestedTasks.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="active" className="relative">
                                Active
                                {myTasks.length > 0 && (
                                    <Badge className="ml-2" variant="secondary">
                                        {myTasks.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed
                            </TabsTrigger>
                        </TabsList>

                        {/* Available Tasks Tab */}
                        <TabsContent value="new" className="space-y-4">
                            {newTasks.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <IconTool className="size-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No available tasks at the moment</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {newTasks.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Requested Tasks Tab */}
                        <TabsContent value="requested" className="space-y-4">
                            {requestedTasks.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <IconClock className="size-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No pending requests</p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Request tasks from the Available tab
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {requestedTasks.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Active Tasks Tab */}
                        <TabsContent value="active" className="space-y-4">
                            {myTasks.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <IconPlayerPlay className="size-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No active tasks</p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Request tasks to get started
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myTasks.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Completed Tasks Tab */}
                        <TabsContent value="completed" className="space-y-4">
                            {completedTasks.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <IconCheck className="size-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No completed tasks yet</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {completedTasks.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Task Details Dialog */}
                    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                        {selectedTask && <RequestDetailsDialog data={selectedTask} />}
                    </Dialog>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
