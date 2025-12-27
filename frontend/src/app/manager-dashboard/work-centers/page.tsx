
"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    IconSearch,
    IconPlus,
    IconBuildingFactory2,
    IconMapPin,
    IconUser,
    IconSettings,
    IconTrash,
    IconTag,
    IconHash,
    IconClock,
    IconActivity
} from "@tabler/icons-react"
import { WorkCenterDetailsDialog } from "@/components/work-center-details-dialog"

// Mock Data
type Worker = {
    id: string
    name: string
    avatar?: string
}

type WorkCenter = {
    id: string
    name: string
    code: string
    tag: string
    type: string // Keeping type as it maps to 'Tag' concept or Category
    location: string
    alternative_work_centers: string[]
    cost_per_hour: number
    capacity: number
    time_efficiency: number
    oee_target: number
    status: "Active" | "Maintenance" | "Inactive"
    workers: Worker[]
}

const initialWorkers: Worker[] = [
    { id: "w1", name: "John Doe", avatar: "https://i.pravatar.cc/150?u=john" },
    { id: "w2", name: "Jane Smith", avatar: "https://i.pravatar.cc/150?u=jane" },
    { id: "w3", name: "Bob Wilson", avatar: "https://i.pravatar.cc/150?u=bob" },
    { id: "w4", name: "Alice Brown", avatar: "https://i.pravatar.cc/150?u=alice" },
]

const initialWorkCenters: WorkCenter[] = [
    {
        id: "wc1",
        name: "CNC Machining Area",
        code: "CNC-01",
        tag: "Critical",
        type: "Manufacturing",
        location: "Building A, Floor 1",
        alternative_work_centers: ["Drill 1"],
        cost_per_hour: 45.00,
        capacity: 1.00,
        time_efficiency: 100.00,
        oee_target: 85.00,
        status: "Active",
        workers: [initialWorkers[0], initialWorkers[2]]
    },
    {
        id: "wc2",
        name: "3D Printing Hub",
        code: "3DP-X2",
        tag: "Proto",
        type: "Prototyping",
        location: "Building B, Lab 3",
        alternative_work_centers: [],
        cost_per_hour: 20.00,
        capacity: 2.00,
        time_efficiency: 95.00,
        oee_target: 90.00,
        status: "Active",
        workers: [initialWorkers[1]]
    },
    {
        id: "wc3",
        name: "Assembly Line 4",
        code: "ASM-04",
        tag: "High Volume",
        type: "Assembly",
        location: "Building A, Floor 2",
        alternative_work_centers: ["Assembly 2", "Assembly 3"],
        cost_per_hour: 120.00,
        capacity: 10.00,
        time_efficiency: 88.50,
        oee_target: 80.00,
        status: "Maintenance",
        workers: []
    }
]

export default function WorkCentersPage() {
    const [workCenters, setWorkCenters] = React.useState<WorkCenter[]>(initialWorkCenters)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isAddOpen, setIsAddOpen] = React.useState(false)

    // Form State (Simplified for now, just main fields)
    const [formData, setFormData] = React.useState<Partial<WorkCenter>>({
        status: "Active",
        workers: [],
        cost_per_hour: 0,
        capacity: 1,
        time_efficiency: 100,
        oee_target: 0
    })
    const [selectedWorkerId, setSelectedWorkerId] = React.useState<string>("")

    const filteredWorkCenters = workCenters.filter(wc =>
        wc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wc.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = () => {
        const newWorkCenter: WorkCenter = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name || "New Work Center",
            code: formData.code || `WC-${Math.floor(Math.random() * 1000)}`,
            tag: formData.tag || "General",
            type: formData.type || "General",
            location: formData.location || "Unknown",
            alternative_work_centers: [], // Default empty
            cost_per_hour: Number(formData.cost_per_hour) || 0,
            capacity: Number(formData.capacity) || 1,
            time_efficiency: Number(formData.time_efficiency) || 100,
            oee_target: Number(formData.oee_target) || 0,
            status: (formData.status as any) || "Active",
            workers: formData.workers || []
        }
        setWorkCenters([...workCenters, newWorkCenter])
        setIsAddOpen(false)
        setFormData({ status: "Active", workers: [], cost_per_hour: 0, capacity: 1, time_efficiency: 100, oee_target: 0 })
        setSelectedWorkerId("")
    }

    const deleteWorkCenter = (id: string) => {
        setWorkCenters(workCenters.filter(wc => wc.id !== id))
    }

    const addWorkerToForm = (workerId: string) => {
        const worker = initialWorkers.find(w => w.id === workerId)
        if (worker && !formData.workers?.find(w => w.id === workerId)) {
            setFormData({
                ...formData,
                workers: [...(formData.workers || []), worker]
            })
        }
        setSelectedWorkerId("")
    }

    const removeWorkerFromForm = (workerId: string) => {
        setFormData({
            ...formData,
            workers: formData.workers?.filter(w => w.id !== workerId)
        })
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
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6">

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold tracking-tight">Work Centers</h2>
                            <p className="text-muted-foreground">
                                Manage operational work centers, their KPIs and resources.
                            </p>
                        </div>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
                                    <IconPlus className="mr-2 size-4" />
                                    Add Work Center
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Work Center</DialogTitle>
                                    <DialogDescription>
                                        Create a new work center with full configuration.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4 pr-2 max-h-[60vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Code</Label>
                                            <Input id="code" placeholder="e.g. WC-01" value={formData.code || ""} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Input id="type" placeholder="e.g. Manufacturing" value={formData.type || ""} onChange={e => setFormData({ ...formData, type: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tag">Tag</Label>
                                            <Input id="tag" placeholder="e.g. Critical" value={formData.tag || ""} onChange={e => setFormData({ ...formData, tag: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border">
                                        <div className="space-y-2">
                                            <Label htmlFor="cost" className="text-xs text-muted-foreground">Cost/Hr</Label>
                                            <Input type="number" id="cost" value={formData.cost_per_hour || ""} onChange={e => setFormData({ ...formData, cost_per_hour: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cap" className="text-xs text-muted-foreground">Capacity</Label>
                                            <Input type="number" id="cap" value={formData.capacity || ""} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="efficiency" className="text-xs text-muted-foreground">Time Eff. (%)</Label>
                                            <Input type="number" id="efficiency" value={formData.time_efficiency || ""} onChange={e => setFormData({ ...formData, time_efficiency: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="oee" className="text-xs text-muted-foreground">OEE Target</Label>
                                            <Input type="number" id="oee" value={formData.oee_target || ""} onChange={e => setFormData({ ...formData, oee_target: Number(e.target.value) })} />
                                        </div>
                                    </div>

                                    {/* Worker Assignment */}
                                    <div className="border-t pt-4 mt-2">
                                        <div className="mb-3 flex items-center justify-between">
                                            <Label>Assigned Workers</Label>
                                            <Select value={selectedWorkerId} onValueChange={addWorkerToForm}>
                                                <SelectTrigger className="w-[200px] h-8 text-xs">
                                                    <SelectValue placeholder="+ Assign Worker" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialWorkers.map(worker => (
                                                        <SelectItem key={worker.id} value={worker.id}>
                                                            {worker.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Selected Workers List */}
                                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-background border rounded-md">
                                            {formData.workers && formData.workers.length > 0 ? (
                                                formData.workers.map(worker => (
                                                    <Badge key={worker.id} variant="secondary" className="pl-1 pr-2 py-1 flex items-center gap-2">
                                                        <Avatar className="size-5">
                                                            <AvatarImage src={worker.avatar} />
                                                            <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{worker.name}</span>
                                                        <button onClick={() => removeWorkerFromForm(worker.id)} className="ml-1 hover:text-red-500">
                                                            <IconTrash className="size-3" />
                                                        </button>
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic p-1">No workers assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleCreate}>Create Work Center</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Search */}
                    <div className="flex max-w-sm items-center gap-2">
                        <div className="relative flex-1">
                            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search work centers..."
                                className="pl-8 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[250px]">Work Center</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Tag</TableHead>
                                    <TableHead className="hidden md:table-cell">Alternative(s)</TableHead>
                                    <TableHead className="text-right">Cost/Hr</TableHead>
                                    <TableHead className="text-right">Cap / Eff</TableHead>
                                    <TableHead className="text-right">OEE Target</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredWorkCenters.map((wc) => (
                                    <Dialog key={wc.id}>
                                        <DialogTrigger asChild>
                                            <TableRow className="cursor-pointer hover:bg-muted/50">
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{wc.name}</span>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                            <IconMapPin className="size-3" />
                                                            {wc.location}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{wc.code}</TableCell>
                                                <TableCell>
                                                    {wc.tag && <Badge variant="secondary" className="text-xs font-normal">{wc.tag}</Badge>}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                                    {wc.alternative_work_centers.length > 0 ? (
                                                        wc.alternative_work_centers.join(", ")
                                                    ) : (
                                                        <span className="opacity-30">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {wc.cost_per_hour > 0 ? `$${wc.cost_per_hour.toFixed(2)}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="font-medium text-sm">{wc.capacity.toFixed(2)}</span>
                                                        <span className="text-xs text-muted-foreground">{wc.time_efficiency.toFixed(2)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {wc.oee_target > 0 ? wc.oee_target.toFixed(2) : "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive size-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                deleteWorkCenter(wc.id)
                                                            }}
                                                        >
                                                            <IconTrash className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </DialogTrigger>
                                        <WorkCenterDetailsDialog data={wc} />
                                    </Dialog>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
