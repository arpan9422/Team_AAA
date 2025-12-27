"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    IconAlertTriangle,
    IconCpu,
    IconSend,
    IconCheck,
    IconClock,
    IconX,
    IconUser,
    IconMail,
    IconPhone,
    IconBriefcase,
    IconMapPin
} from "@tabler/icons-react"

import api from "@/lib/api"
import { useRouter } from "next/navigation"

// Types
type Request = {
    id: string | number
    equipmentId: string | null
    title: string
    description: string
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string
    status: "NEW" | "IN_PROGRESS" | "REPAIRED" | "COMPLETED" | "SCRAP" | string
    createdAt: string
    requestType: string
    equipment?: {
        id: string
        name: string
    }
    team?: {
        id: string
        name: string
    }
}

type Equipment = {
    id: string
    name: string
    serialNumber: string
    type: string
    location: string | null
    department: string | null
    primaryTeam?: {
        id: string
        name: string
    }
}

export default function EmployeeRequestPage() {
    const router = useRouter()
    const [profile, setProfile] = React.useState<any>(null)
    const [equipment, setEquipment] = React.useState<Equipment[]>([])
    const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment | null>(null)
    const [title, setTitle] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [priority, setPriority] = React.useState<string>("MEDIUM")
    const [requestType, setRequestType] = React.useState<string>("CORRECTIVE")
    const [submittedRequests, setSubmittedRequests] = React.useState<Request[]>([])
    const [showSuccess, setShowSuccess] = React.useState(false)
    const [loading, setLoading] = React.useState(true)

    // Fetch initial data
    React.useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch Profile
                const profileRes = await api.get('/auth/me')
                setProfile(profileRes.data.user)

                // Fetch My Equipment
                const assignmentsRes = await api.get('/employee/equipment')
                const assignments = assignmentsRes.data
                const mappedEquipment = assignments.map((a: any) => ({
                    id: a.equipment.id,
                    name: a.equipment.name,
                    serialNumber: a.equipment.serialNumber,
                    type: a.equipment.type,
                    location: a.equipment.location,
                    department: a.equipment.department,
                    primaryTeam: a.equipment.primaryTeam
                }))
                setEquipment(mappedEquipment)

                // Fetch My Requests
                const requestsRes = await api.get('/employee')
                setSubmittedRequests(requestsRes.data)
            } catch (error) {
                console.error('Failed to fetch data:', error)
                // Error handled by interceptor (401 redirect)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    // Auto-fill when equipment is selected
    const handleEquipmentSelect = (equipmentId: string) => {
        const found = equipment.find(eq => eq.id === equipmentId)
        setSelectedEquipment(found || null)
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title || !requestType) {
            alert("Please fill in all required fields")
            return
        }

        try {
            const response = await api.post('/employee', {
                title,
                description,
                requestType,
                priority,
                equipmentId: selectedEquipment?.id,
                teamId: selectedEquipment?.primaryTeam?.id
            })

            const newRequest = response.data
            setSubmittedRequests([newRequest, ...submittedRequests])

            // Reset form
            setSelectedEquipment(null)
            setTitle("")
            setDescription("")
            setPriority("MEDIUM")
            setRequestType("CORRECTIVE")

            // Show success message
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (error) {
            console.error('Failed to submit request:', error)
            alert(error instanceof Error ? error.message : "Failed to submit request")
        }
    }

    const getStatusBadge = (status: Request["status"]) => {
        switch (status) {
            case "NEW":
                return <Badge variant="outline" className="border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10">New</Badge>
            case "IN_PROGRESS":
                return <Badge variant="outline" className="border-accent-yellow/30 text-accent-yellow bg-accent-yellow/10">In Progress</Badge>
            case "REPAIRED":
                return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Repaired</Badge>
            case "COMPLETED":
                return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Completed</Badge>
            case "SCRAP":
                return <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">Scrapped</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "CRITICAL": return "bg-red-600 text-white"
            case "HIGH": return "bg-red-500 text-white"
            case "MEDIUM": return "bg-yellow-500 text-white"
            case "LOW": return "bg-gray-500 text-white"
            default: return "bg-muted text-muted-foreground"
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-bg-soft">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading portal...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg-soft pb-12">
            {/* Header / Navbar */}
            <div className="bg-bg-main border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconCpu className="size-6 text-primary" />
                        <span className="font-bold text-lg tracking-tight">Gear Guard <span className="text-accent-cyan text-sm font-medium">Employee Portal</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-medium">{profile?.name}</span>
                            <span className="text-xs text-muted-foreground">{profile?.email}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                            <IconUser className="size-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - New Request Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <IconAlertTriangle className="size-6 text-accent-yellow" />
                                    Submit Maintenance Request
                                </CardTitle>
                                <CardDescription>
                                    Report an issue with your equipment or request preventive maintenance
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Equipment Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="equipment">
                                            Select Equipment <span className="text-red-500">*</span>
                                        </Label>
                                        <Select onValueChange={handleEquipmentSelect}>
                                            <SelectTrigger id="equipment" className="bg-bg-soft border-muted/20">
                                                <SelectValue placeholder="Select equipment to report an issue" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {equipment.map((eq) => (
                                                    <SelectItem key={eq.id} value={eq.id}>
                                                        {eq.name} ({eq.serialNumber})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Select from the equipment currently assigned to you
                                        </p>
                                    </div>

                                    {/* Equipment Details Card - Auto-filled */}
                                    {selectedEquipment && (
                                        <Card className="bg-muted/30 border-none">
                                            <CardContent className="p-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Type</p>
                                                        <p className="font-medium">{selectedEquipment.type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Maintenance Team</p>
                                                        <p className="font-medium text-xs truncate" title={selectedEquipment.primaryTeam?.name || 'N/A'}>
                                                            {selectedEquipment.primaryTeam?.name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Location</p>
                                                        <p className="font-medium">{selectedEquipment.location || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Serial Number</p>
                                                        <p className="font-mono text-xs">{selectedEquipment.serialNumber}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Issue Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">
                                            Issue Title <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            placeholder="Brief description of the issue (e.g., 'Laptop not turning on')"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            className="bg-bg-soft border-muted/20"
                                        />
                                    </div>

                                    {/* Issue Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Detailed Description <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Provide detailed information about the issue, when it started, and any troubleshooting you've already tried..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={5}
                                            required
                                            className="bg-bg-soft border-muted/20"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Be as specific as possible to help technicians diagnose the issue faster
                                        </p>
                                    </div>

                                    {/* Request Type Selection */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="requestType">
                                                Request Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={requestType} onValueChange={(value: any) => setRequestType(value)}>
                                                <SelectTrigger id="requestType" className="bg-bg-soft border-muted/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CORRECTIVE">Corrective (Broken/Repair)</SelectItem>
                                                    <SelectItem value="PREVENTIVE">Preventive (Maintenance/Checkup)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority">
                                                Priority Level <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                                                <SelectTrigger id="priority" className="bg-bg-soft border-muted/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CRITICAL">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-2 rounded-full bg-red-600" />
                                                            <span>Critical - Immediate action</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="HIGH">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-2 rounded-full bg-red-500" />
                                                            <span>High - Urgent</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="MEDIUM">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-2 rounded-full bg-yellow-500" />
                                                            <span>Medium - Normal</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="LOW">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-2 rounded-full bg-gray-500" />
                                                            <span>Low - Minor</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-accent-cyan hover:bg-accent-cyan/90 text-white font-bold h-11"
                                        >
                                            <IconSend className="mr-2 size-5" />
                                            Submit Request
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 px-6 border-muted/20"
                                            onClick={() => {
                                                setSelectedEquipment(null)
                                                setTitle("")
                                                setDescription("")
                                                setPriority("MEDIUM")
                                                setRequestType("CORRECTIVE")
                                            }}
                                        >
                                            <IconX className="mr-2 size-5" />
                                            Clear
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Status & History */}
                    <div className="space-y-6">
                        {/* Profile Info Card */}
                        <Card className="border-none shadow-sm overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-primary/80 to-accent-cyan/80" />
                            <CardContent className="pt-0 relative">
                                <div className="flex flex-col items-center -mt-12 mb-4">
                                    <div className="size-24 rounded-full border-4 border-bg-main bg-muted flex items-center justify-center text-primary shadow-sm overflow-hidden">
                                        <IconUser className="size-12" />
                                    </div>
                                    <h3 className="text-xl font-bold mt-2">{profile?.name}</h3>
                                    <Badge variant="secondary" className="mt-1 font-normal bg-muted text-muted-foreground">{profile?.role || profile?.employeeId}</Badge>
                                </div>
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="size-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                                            <IconMail className="size-4" />
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Email</span>
                                            <span className="font-medium truncate">{profile?.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="size-8 rounded-lg bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                                            <IconMapPin className="size-4" />
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Department</span>
                                            <span className="font-medium">{profile?.department || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Requests Summary */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <IconClock className="size-5 text-primary" />
                                    My Recent Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {submittedRequests.slice(0, 5).map((request) => (
                                    <div key={request.id} className="p-3 rounded-lg border border-muted/20 bg-muted/5 space-y-2 hover:bg-muted/10 transition-colors cursor-pointer group">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-mono text-muted-foreground">REQ-{request.id.toString().substring(0, 6)}</p>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{request.title}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{request.equipment?.name || 'N/A'}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{new Date(request.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {submittedRequests.length === 0 && (
                                    <p className="text-center py-6 text-sm text-muted-foreground">No recent requests</p>
                                )}
                                {submittedRequests.length > 0 && (
                                    <Button variant="ghost" className="w-full text-xs text-primary font-bold hover:bg-primary/5">
                                        View All History
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Assigned Equipment Summary */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <IconCpu className="size-5 text-accent-cyan" />
                                    My Equipment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {equipment.map((eq) => (
                                    <div key={eq.id} className="flex items-center gap-3 p-3 rounded-lg border border-muted/20 hover:bg-muted/5 transition-colors">
                                        <div className="size-10 rounded-lg bg-bg-soft flex items-center justify-center border border-muted/10 text-accent-cyan">
                                            <IconCpu className="size-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{eq.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono truncate">{eq.serialNumber}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-normal border-accent-cyan/30 text-accent-cyan capitalize">
                                            {eq.type?.toLowerCase() || 'Unknown'}
                                        </Badge>
                                    </div>
                                ))}
                                {equipment.length === 0 && (
                                    <p className="text-center py-6 text-sm text-muted-foreground">No equipment assigned</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Success Toast / Notification */}
            {showSuccess && (
                <div className="fixed bottom-8 right-8 animate-in slide-in-from-right duration-300">
                    <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
                        <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                            <IconCheck className="size-5" />
                        </div>
                        <div>
                            <p className="font-bold">Request Submitted!</p>
                            <p className="text-xs text-white/80">Your maintenance request has been recorded.</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-white/10 hover:bg-white/20 ml-4 rounded-full"
                            onClick={() => setShowSuccess(false)}
                        >
                            <IconX className="size-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
