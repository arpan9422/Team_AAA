
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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    IconSearch,
    IconFilter,
    IconPlus,
    IconCpu,
    IconMapPin,
    IconBuilding,
    IconCalendar,
    IconTool,
    IconBolt,
    IconServer,
    IconDeviceLaptop,
    IconTruck
} from "@tabler/icons-react"
import { EquipmentMaintenanceDialog } from "@/components/equipment-maintenance-dialog"

// Mock Data
type Equipment = {
    id: string
    name: string
    serial_number: string
    location: string
    department: string
    primary_team_id: string
    purchase_date: string
    warranty_end: string
    status: "active" | "inactive" | "maintenance"
    created_at: string
    icon?: any
    maintenance_count?: number
}

const initialEquipment: Equipment[] = [
    {
        id: "1",
        name: "CNC Machine Alpha",
        serial_number: "CNC-2024-001",
        location: "Building A, Floor 1",
        department: "Production",
        primary_team_id: "team-alpha",
        purchase_date: "2023-01-15",
        warranty_end: "2025-03-15",
        status: "active",
        created_at: "2023-01-15T00:00:00Z",
        icon: IconBolt,
        maintenance_count: 2
    },
    {
        id: "2",
        name: "Forklift FL-200",
        serial_number: "FL-2023-042",
        location: "Warehouse B",
        department: "Warehouse",
        primary_team_id: "team-logistics",
        purchase_date: "2023-06-10",
        warranty_end: "2026-01-10",
        status: "active",
        created_at: "2023-06-10T00:00:00Z",
        icon: IconTruck,
        maintenance_count: 1
    },
    {
        id: "3",
        name: "Server Rack SR-01",
        serial_number: "SR-2021-015",
        location: "Server Room",
        department: "IT",
        primary_team_id: "team-it",
        purchase_date: "2021-11-20",
        warranty_end: "2024-11-20",
        status: "maintenance",
        created_at: "2021-11-20T00:00:00Z",
        icon: IconServer,
        maintenance_count: 0
    },
    {
        id: "4",
        name: "Laptop Dell XPS-15",
        serial_number: "DELL-2024-089",
        location: "Office 302",
        department: "Marketing",
        primary_team_id: "team-marketing",
        purchase_date: "2024-02-01",
        warranty_end: "2027-02-01",
        status: "active",
        created_at: "2024-02-01T00:00:00Z",
        icon: IconDeviceLaptop,
        maintenance_count: 1
    },
]

export default function EquipmentPage() {
    const [equipment, setEquipment] = React.useState<Equipment[]>(initialEquipment)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isAddOpen, setIsAddOpen] = React.useState(false)

    // Form State
    const [formData, setFormData] = React.useState<Partial<Equipment>>({
        status: "active",
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    })

    const filteredEquipment = equipment.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = () => {
        const newEquipment: Equipment = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name || "New Equipment",
            serial_number: formData.serial_number || "UNKNOWN",
            location: formData.location || "Unknown",
            department: formData.department || "General",
            primary_team_id: "team-general",
            purchase_date: formData.purchase_date || "",
            warranty_end: formData.warranty_end || "",
            status: (formData.status as any) || "active",
            created_at: new Date().toISOString(),
            icon: IconCpu, // Default icon
            maintenance_count: 0
        }
        setEquipment([newEquipment, ...equipment])
        setIsAddOpen(false)
        setFormData({
            status: "active",
            purchase_date: new Date().toISOString().split('T')[0],
            warranty_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
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
                            <h2 className="text-2xl font-bold tracking-tight">Equipment</h2>
                            <p className="text-muted-foreground">
                                Manage all your company assets
                            </p>
                        </div>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
                                    <IconPlus className="mr-2 size-4" />
                                    Add Equipment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Equipment</DialogTitle>
                                    <DialogDescription>
                                        Enter the details of the new asset below.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input id="name" className="col-span-3" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="serial" className="text-right">Serial #</Label>
                                        <Input id="serial" className="col-span-3" value={formData.serial_number || ""} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="location" className="text-right">Location</Label>
                                        <Input id="location" className="col-span-3" value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="dept" className="text-right">Dept</Label>
                                        <Input id="dept" className="col-span-3" value={formData.department || ""} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">Status</Label>
                                        <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleCreate}>Create Equipment</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                        <div className="flex flex-1 items-center gap-2 max-w-lg">
                            <div className="relative flex-1">
                                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or serial..."
                                    className="pl-8 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select defaultValue="all-depts">
                                <SelectTrigger className="w-[160px]">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <IconBuilding className="h-4 w-4" />
                                        <SelectValue placeholder="All Departments" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-depts">All Departments</SelectItem>
                                    <SelectItem value="production">Production</SelectItem>
                                    <SelectItem value="it">IT</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="all-cats">
                                <SelectTrigger className="w-[160px]">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <IconFilter className="h-4 w-4" />
                                        <SelectValue placeholder="All Categories" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-cats">All Categories</SelectItem>
                                    <SelectItem value="machines">Machines</SelectItem>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEquipment.map((item) => (
                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="flex gap-4">
                                        <div className="size-12 rounded-lg bg-gray-100 flex items-center justify-center text-purple-600">
                                            {item.icon ? <item.icon className="size-6" /> : <IconCpu className="size-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg leading-none">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{item.serial_number}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={item.status === 'active' ? 'default' : 'secondary'}
                                        className={item.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                                    >
                                        {item.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-3 pb-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <IconMapPin className="size-4" />
                                        <span>{item.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <IconBuilding className="size-4" />
                                        <span>{item.department} • {item.primary_team_id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-md">
                                        <IconCalendar className="size-4" />
                                        <span className="font-medium">Warranty: {new Date(item.warranty_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between bg-muted/40 hover:bg-muted">
                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                    <IconTool className="size-4" />
                                                    Maintenance
                                                    {item.maintenance_count && item.maintenance_count > 0 && (
                                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 h-5 px-1.5 ml-1">
                                                            {item.maintenance_count}
                                                        </Badge>
                                                    )}
                                                </span>
                                                <span className="text-muted-foreground">›</span>
                                            </Button>
                                        </DialogTrigger>
                                        <EquipmentMaintenanceDialog equipment={item} />
                                    </Dialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
