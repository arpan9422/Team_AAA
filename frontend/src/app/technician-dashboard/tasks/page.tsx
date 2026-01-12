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

import api from "@/lib/api"

// Task type matching backend response
type Task = {
    id: string
    title: string
    description: string
    requestType: "CORRECTIVE" | "PREVENTIVE"
    equipmentId: string
    equipment?: {
        name: string
        serialNumber: string
        location: string
        type: string
    }
    teamId: string
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    status: "NEW" | "IN_PROGRESS" | "REPAIRED" | "COMPLETED" | "SCRAP" | "REQUESTED"
    createdAt: string
    scheduledDate: string
    completedAt?: string
    assignedTechnicianId?: string | null
    assignedTechnician?: {
        name: string
    }
}

// Redacted mock data as it no longer matches the backend-integrated Task type.

export default function TechnicianTasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState("new")

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const response = await api.get('/requests/my-requests')
            setTasks(response.data)
        } catch (error) {
            console.error("Failed to fetch tasks:", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchTasks()
    }, [])

    // Filter tasks by tab and search
    const filterTasksByStatus = (status: Task["status"][]) => {
        return tasks.filter(task => {
            const matchesStatus = status.includes(task.status)
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.equipment?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
            return matchesStatus && matchesSearch && matchesPriority
        })
    }

    const newTasks = filterTasksByStatus(["NEW"])
    const requestedTasks = filterTasksByStatus(["REQUESTED"])
    const myTasks = filterTasksByStatus(["IN_PROGRESS", "REPAIRED"])
    const completedTasks = filterTasksByStatus(["COMPLETED"])

    // Handle requesting to work on a task (Accept)
    const handleRequestTask = async (taskId: string) => {
        try {
            await api.post(`/requests/${taskId}/accept`)
            await fetchTasks()
            setActiveTab("requested")
        } catch (error) {
            console.error("Failed to accept task:", error)
            alert("Failed to accept task")
        }
    }

    // Handle starting work on a task
    const handleStartWork = async (taskId: string) => {
        try {
            await api.patch(`/requests/${taskId}/start`)
            await fetchTasks()
            setActiveTab("active")
        } catch (error) {
            console.error("Failed to start task:", error)
        }
    }

    // Handle submitting completed work
    const handleSubmitWork = async (taskId: string) => {
        try {
            // For simplicity, we'll use some default values or a simple prompt
            // Real completion would need a dialog for hours and root cause
            const hoursSpent = parseFloat(prompt("Enter hours spent:", "1.0") || "1.0")
            await api.patch(`/requests/${taskId}/complete`, {
                hoursSpent,
                rootCause: 'WEAR_AND_TEAR',
                workNotes: 'Task completed via dashboard'
            })
            await fetchTasks()
            setActiveTab("completed")
        } catch (error) {
            console.error("Failed to complete task:", error)
        }
    }

    // Note: Cancel request is not explicitly in backend, but we could add it if needed.
    // Reusing existing logic for now.
    const handleCancelRequest = (taskId: string) => {
        alert("Cancellation requires manager approval or is not implemented in backend yet.")
    }

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task)
        setIsDetailOpen(true)
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "CRITICAL": return "destructive"
            case "HIGH": return "destructive"
            case "MEDIUM": return "default"
            case "LOW": return "secondary"
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
                            {task.equipment?.name} • {task.equipment?.serialNumber}
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
                    <span>{task.equipment?.location || 'Unknown'}</span>
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
                                className="flex-1 bg-accent-yellow hover:bg-accent-yellow/90 text-white"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartWork(task.id)
                                }}
                            >
                                <IconPlayerPlay className="mr-2 size-4" />
                                Start Work
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-bg-soft">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading tasks...</p>
                </div>
            </div>
        )
    }

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
