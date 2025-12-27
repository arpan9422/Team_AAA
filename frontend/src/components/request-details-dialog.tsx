
"use client"

import * as React from "react"
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    IconCpu,
    IconAlertTriangle,
    IconTool,
    IconUserCheck,
    IconX
} from "@tabler/icons-react"

// Mock Available Technicians
const availableTechnicians = [
    { id: "t1", name: "Alice Smith", email: "alice@example.com", skills: ["Electrical", "Hardware"], load: 2, experience: 5, avatar: "https://i.pravatar.cc/150?u=alice" },
    { id: "t2", name: "Bob Jones", email: "bob@example.com", skills: ["Software", "Network"], load: 0, experience: 3, avatar: "https://i.pravatar.cc/150?u=bob" },
    { id: "t3", name: "Charlie Day", email: "charlie@example.com", skills: ["Mechanical"], load: 4, experience: 8, avatar: "https://i.pravatar.cc/150?u=charlie" },
]

export function RequestDetailsDialog({
    data,
}: {
    data: any
}) {
    const [isRejected, setIsRejected] = React.useState(false)
    const [assignedTech, setAssignedTech] = React.useState(
        data.status !== "NEW" ? availableTechnicians[0] : null
    )
    const [isConfirmed, setIsConfirmed] = React.useState(
        data.status !== "NEW"
    )

    const handleAssign = (tech: typeof availableTechnicians[0]) => {
        setAssignedTech(tech)
        setIsRejected(false)
    }

    function Field({ label, value, mono, small }: any) {
        return (
            <div className="grid grid-cols-[100px_1fr] gap-1">
                <span className="text-muted-foreground">{label}:</span>
                <span
                    className={`${mono ? "font-mono" : ""} ${small ? "text-xs" : "font-medium"
                        }`}
                >
                    {value}
                </span>
            </div>
        )
    }

    function Stat({ label, value }: any) {
        return (
            <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    {label}
                </p>
                <p className="font-medium text-lg">{value}</p>
            </div>
        )
    }

    return (
        <DialogContent className="sm:max-w-4xl w-full">
            <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                <DialogDescription>
                    Detailed view of equipment, maintenance request, and technician assignment.
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">

                {/* TIMELINE */}
                <div className="w-full px-2 mb-2">
                    <div className="relative flex items-center justify-between">
                        {/* Background Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full" />

                        {/* Active Line Progress - Simplified Logic */}
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
                            style={{
                                width: `${data.status === "NEW" ? "0%" :
                                    data.status === "IN_PROGRESS" ? "33%" :
                                        data.status === "REPAIRED" ? "66%" : "100%"
                                    }`
                            }}
                        />

                        {["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP"].map((step, i) => {
                            const labels: Record<string, string> = {
                                "NEW": "New",
                                "IN_PROGRESS": "In Progress",
                                "REPAIRED": "Repaired",
                                "SCRAP": "Scrap"
                            }

                            const stepsOrder = ["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP"]
                            const currentIdx = stepsOrder.indexOf(data.status)
                            const stepIdx = i
                            const isCompleted = stepIdx <= currentIdx
                            const isCurrent = data.status === step

                            return (
                                <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-background px-2">
                                    <div
                                        className={`
                                            flex items-center justify-center size-8 rounded-full border-2 transition-all duration-300
                                            ${isCompleted
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : "bg-background border-muted-foreground/30 text-muted-foreground"
                                            }
                                            ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}
                                        `}
                                    >
                                        {isCompleted ? (
                                            step === "SCRAP" && isCurrent ? <IconX className="size-4" /> :
                                                <IconUserCheck className="size-4" /> // Using generic check for now, can swap
                                        ) : (
                                            <div className="size-2 rounded-full bg-current opacity-50" />
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                                        {labels[step]}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* TOP ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* EQUIPMENT */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <IconCpu className="size-5" />
                            <h3 className="font-semibold">Equipment</h3>
                        </div>

                        <div className="rounded-lg border p-4 space-y-3 text-sm">
                            <Field label="Name" value={data.equipmentName} />
                            <Field label="Serial No" mono value={data.serialNumber} />
                            <Field label="ID" mono small value={data.equipmentId} />
                            <Field label="Location" value={data.location} />
                            <Field label="Dept" value={data.department} />
                            <Field label="Purchase" value={data.purchaseDate} />
                            <Field label="Warranty" value={data.warrantyEnd} />
                            <div className="grid grid-cols-[100px_1fr] gap-1">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant="outline" className="w-fit border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10">
                                    {data.equipmentStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* REQUEST */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <IconAlertTriangle className="size-5" />
                            <h3 className="font-semibold">Maintenance Request</h3>
                        </div>

                        <div className="rounded-lg border p-4 space-y-3 text-sm">
                            <Field label="Title" value={data.title} />
                            <div className="grid grid-cols-[100px_1fr] gap-1">
                                <span className="text-muted-foreground">Description:</span>
                                <p className="text-sm">{data.description}</p>
                            </div>
                            <Field label="Type" value={data.requestType} />
                            <div className="grid grid-cols-[100px_1fr] gap-1">
                                <span className="text-muted-foreground">Priority:</span>
                                <Badge
                                    variant={
                                        data.priority === "High"
                                            ? "destructive"
                                            : "outline"
                                    }
                                    className="w-fit"
                                >
                                    {data.priority}
                                </Badge>
                            </div>
                            <Field label="Status" value={data.status.replace('_', ' ')} />
                            <Field label="Created By" value={data.createdBy} />
                            <Field label="Created At" value={new Date(data.createdAt).toLocaleString()} />
                            <Field label="Scheduled" value={new Date(data.scheduledDate).toLocaleString()} />
                            {data.completedAt && <Field label="Completed" value={new Date(data.completedAt).toLocaleString()} />}
                        </div>
                    </div>
                </div>

                {/* TECHNICIAN */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-accent-cyan">
                        <IconTool className="size-5" />
                        <h3 className="font-semibold">Technician Assignment</h3>
                    </div>

                    {!isRejected && assignedTech ? (
                        <div className="rounded-lg border p-6 flex flex-col md:flex-row gap-6">

                            {/* TECH PROFILE */}
                            <div className="flex flex-col items-center gap-4 min-w-[200px]">
                                <Avatar className="size-24">
                                    <AvatarImage src={assignedTech.avatar} />
                                    <AvatarFallback>
                                        {assignedTech.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="text-center">
                                    <h4 className="text-xl font-bold">{assignedTech.name}</h4>
                                    <p className="text-muted-foreground text-sm">
                                        {assignedTech.email}
                                    </p>
                                    <Badge variant="secondary" className="mt-2">
                                        Senior Technician
                                    </Badge>
                                </div>
                            </div>

                            {/* TECH INFO */}
                            <div className="space-y-6 flex-1">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <Stat
                                        label="Experience"
                                        value={`${assignedTech.experience} Years`}
                                    />
                                    <Stat
                                        label="Current Load"
                                        value={`${assignedTech.load} Active`}
                                    />
                                    <div className="col-span-2 space-y-1 p-3 bg-muted/30 rounded-lg">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                            Skills
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {assignedTech.skills.map((s: string) => (
                                                <Badge key={s} variant="outline" className="text-xs">
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {!isConfirmed && (
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            className="text-destructive border-destructive/30"
                                            onClick={() => setIsRejected(true)}
                                        >
                                            <IconX className="mr-2 size-4" />
                                            Reject
                                        </Button>

                                        <Button
                                            className="bg-accent-cyan hover:bg-accent-cyan/90 text-white min-w-[180px]"
                                            onClick={() => {
                                                setIsConfirmed(true)
                                                console.log("Confirmed assignment")
                                            }}
                                        >
                                            <IconUserCheck className="mr-2 size-4" />
                                            Confirm & Assign
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 min-w-[420px]">
                            <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground bg-muted/30">
                                {isRejected
                                    ? "Technician rejected. Please select a new technician."
                                    : "No technician assigned."}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableTechnicians.map((tech: any) => (
                                    <div
                                        key={tech.id}
                                        onClick={() => handleAssign(tech)}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10">
                                                <AvatarImage src={tech.avatar} />
                                                <AvatarFallback>
                                                    {tech.name.slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{tech.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {tech.experience}y • {tech.load} active
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary">
                                            Select
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
    )
}
