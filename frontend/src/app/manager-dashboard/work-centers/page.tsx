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
import api from "@/lib/api"
import { toast } from "sonner"

// Type definition
type Worker = {
    id: string
    name: string
    avatar?: string
}

type WorkCenter = {
    id: string
    name: string
    code: string
    tag?: string
    type?: string
    location?: string
    alternative_work_centers?: string[] // This might need a relationship in DB, simpler for now
    costPerHour: number
    capacity: number
    timeEfficiency: number
    oeeTarget?: number
    isActive: boolean // Replaces status enum likely
    // workers: Worker[] // Fetched separately maybe?
}

export default function WorkCentersPage() {
    const [workCenters, setWorkCenters] = React.useState<WorkCenter[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isAddOpen, setIsAddOpen] = React.useState(false)

    // Form State
    const [formData, setFormData] = React.useState<Partial<WorkCenter>>({
        isActive: true,
        costPerHour: 0,
        capacity: 1,
        timeEfficiency: 100,
        oeeTarget: 85
    })

    const fetchWorkCenters = async () => {
        try {
            setLoading(true)
            const res = await api.get('/work-center')
            // Backend returns { success: true, data: [...] }
            setWorkCenters(res.data.data)
        } catch (error) {
            console.error("Failed to load work centers:", error)
            // toast.error("Failed to load work centers") // Suppress for now if DB is broken to avoid spam
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchWorkCenters()
    }, [])


    const filteredWorkCenters = workCenters.filter(wc =>
        wc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wc.code?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = async () => {
        try {
            await api.post('/work-center', {
                ...formData,
                // Ensure number conversions
                costPerHour: Number(formData.costPerHour),
                capacity: Number(formData.capacity),
                timeEfficiency: Number(formData.timeEfficiency),
                oeeTarget: Number(formData.oeeTarget),
                code: formData.code || `WC-${Math.floor(Math.random() * 1000)}` // fallback
            })
            toast.success("Work Center created successfully")
            setIsAddOpen(false)
            fetchWorkCenters()
            // Reset
            setFormData({ isActive: true, costPerHour: 0, capacity: 1, timeEfficiency: 100, oeeTarget: 0 })
        } catch (error) {
            console.error("Failed to create work center:", error)
            toast.error("Failed to create work center. Database migration might be pending.")
        }
    }

    const deleteWorkCenter = async (id: string) => {
        try {
            await api.delete(`/work-center/${id}`)
            toast.success("Work Center deleted")
            fetchWorkCenters()
        } catch (error) {
            console.error("Failed to delete:", error)
            toast.error("Failed to delete work center")
        }
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
                                            <Input type="number" id="cost" value={formData.costPerHour || ""} onChange={e => setFormData({ ...formData, costPerHour: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cap" className="text-xs text-muted-foreground">Capacity</Label>
                                            <Input type="number" id="cap" value={formData.capacity || ""} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="efficiency" className="text-xs text-muted-foreground">Time Eff. (%)</Label>
                                            <Input type="number" id="efficiency" value={formData.timeEfficiency || ""} onChange={e => setFormData({ ...formData, timeEfficiency: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="oee" className="text-xs text-muted-foreground">OEE Target</Label>
                                            <Input type="number" id="oee" value={formData.oeeTarget || ""} onChange={e => setFormData({ ...formData, oeeTarget: Number(e.target.value) })} />
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
                                    <TableHead className="text-right">Cost/Hr</TableHead>
                                    <TableHead className="text-right">Cap / Eff</TableHead>
                                    <TableHead className="text-right">OEE Target</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">Loading work centers...</TableCell>
                                    </TableRow>
                                ) : filteredWorkCenters.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">No work centers found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredWorkCenters.map((wc) => (
                                        <Dialog key={wc.id}>
                                            <DialogTrigger asChild>
                                                <TableRow className="cursor-pointer hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{wc.name}</span>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                                <IconMapPin className="size-3" />
                                                                {wc.location || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">{wc.code}</TableCell>
                                                    <TableCell>
                                                        {wc.tag && <Badge variant="secondary" className="text-xs font-normal">{wc.tag}</Badge>}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-sm">
                                                        {Number(wc.costPerHour) > 0 ? `$${Number(wc.costPerHour).toFixed(2)}` : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end gap-0.5">
                                                            <span className="font-medium text-sm">{Number(wc.capacity || 0).toFixed(2)}</span>
                                                            <span className="text-xs text-muted-foreground">{Number(wc.timeEfficiency || 0).toFixed(2)}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-sm">
                                                        {Number(wc.oeeTarget || 0).toFixed(2)}
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
                                            {/* Details Dialog Integration could follow here, suppressing for now if component mismatch */}
                                            {/* <WorkCenterDetailsDialog data={wc} /> */}
                                        </Dialog>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
