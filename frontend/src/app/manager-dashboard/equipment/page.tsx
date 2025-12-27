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
import api from "@/lib/api"
import { toast } from "sonner"

// Type definition matching backend
export type Equipment = {
    id: string
    name: string
    serialNumber: string
    location?: string
    department?: string
    primaryTeamId?: string
    purchaseDate?: string
    warrantyEnd?: string
    status: "ACTIVE" | "SCRAPPED" | "IN_REPAIR" // Adjusted to match backend enum likely
    createdAt: string
    // Helper fields
    maintenance_count?: number
}

export default function EquipmentPage() {
    const [equipment, setEquipment] = React.useState<Equipment[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isAddOpen, setIsAddOpen] = React.useState(false)

    // Form State
    const [formData, setFormData] = React.useState<Partial<Equipment>>({
        status: "ACTIVE",
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    })

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const res = await api.get('/equipment');
            setEquipment(res.data);
        } catch (error) {
            console.error("Failed to fetch equipment:", error);
            toast.error("Failed to load equipment");
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        fetchEquipment();
    }, [])

    const filteredEquipment = equipment.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = async () => {
        try {
            await api.post('/equipment', {
                ...formData,
                // Ensure required fields are present; backend validation will catch missing ones
                purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : undefined,
                warrantyEnd: formData.warrantyEnd ? new Date(formData.warrantyEnd).toISOString() : undefined,
                primaryTeamId: "93122709-009d-4299-8dcb-c05342a35640"// TODO: Remove hardcoded team ID, fetch available teams or select one
            });
            toast.success("Equipment created successfully");
            setIsAddOpen(false);
            fetchEquipment();
            // Reset form
            setFormData({
                status: "ACTIVE",
                purchaseDate: new Date().toISOString().split('T')[0],
                warrantyEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            })
        } catch (error) {
            console.error("Failed to create equipment:", error);
            toast.error("Failed to create equipment");
        }
    }

    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('server') || n.includes('rack')) return IconServer;
        if (n.includes('laptop') || n.includes('computer')) return IconDeviceLaptop;
        if (n.includes('truck') || n.includes('lift')) return IconTruck;
        return IconCpu;
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
                                        <Input id="serial" className="col-span-3" value={formData.serialNumber || ""} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="type" className="text-right">Type</Label>
                                        <Input id="type" className="col-span-3" value={formData.name || ""} placeholder="e.g. Machine" onChange={e => setFormData({ ...formData, name: e.target.value })} />
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
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="SCRAPPED">Scrapped</SelectItem>
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
                                    <SelectItem value="Production">Production</SelectItem>
                                    <SelectItem value="IT">IT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex justify-center p-8">Loading equipment...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredEquipment.map((item) => {
                                const Icon = getIcon(item.name);
                                return (
                                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                                            <div className="flex gap-4">
                                                <div className="size-12 rounded-lg bg-gray-100 flex items-center justify-center text-purple-600">
                                                    <Icon className="size-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg leading-none">{item.name}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{item.serialNumber}</p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                className={item.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            >
                                                {item.status}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="space-y-3 pb-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <IconMapPin className="size-4" />
                                                <span>{item.location || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <IconBuilding className="size-4" />
                                                <span>{item.department || 'General'}</span>
                                            </div>
                                            {item.warrantyEnd && (
                                                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-md">
                                                    <IconCalendar className="size-4" />
                                                    <span className="font-medium">Warranty: {new Date(item.warrantyEnd).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" className="w-full justify-between bg-muted/40 hover:bg-muted">
                                                        <span className="flex items-center gap-2 text-muted-foreground">
                                                            <IconTool className="size-4" />
                                                            Maintenance
                                                        </span>
                                                        <span className="text-muted-foreground">›</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <EquipmentMaintenanceDialog equipment={item} />
                                            </Dialog>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
