
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
    IconBuildingFactory2,
    IconMapPin,
    IconTool,
    IconUserCheck,
    IconX,
    IconPlus,
    IconTrash
} from "@tabler/icons-react"

// Mock Available Workers (Same as before for consistency)
const availableWorkers = [
    { id: "w1", name: "John Doe", email: "john@example.com", skills: ["CNC", "Drilling"], load: 2, experience: 5, avatar: "https://i.pravatar.cc/150?u=john" },
    { id: "w2", name: "Jane Smith", email: "jane@example.com", skills: ["3D Printing", "CAD"], load: 0, experience: 3, avatar: "https://i.pravatar.cc/150?u=jane" },
    { id: "w3", name: "Bob Wilson", email: "bob@example.com", skills: ["Assembly", "Wiring"], load: 4, experience: 8, avatar: "https://i.pravatar.cc/150?u=bob" },
    { id: "w4", name: "Alice Brown", email: "alice@example.com", skills: ["Mechanics"], load: 1, experience: 4, avatar: "https://i.pravatar.cc/150?u=alice" },
]

export function WorkCenterDetailsDialog({
    data,
}: {
    data: any
}) {
    // Local state to manage workers in this dialog view
    const [assignedWorkers, setAssignedWorkers] = React.useState<any[]>(data.workers || [])
    const [isAssigning, setIsAssigning] = React.useState(false)

    const handleAssign = (worker: any) => {
        if (!assignedWorkers.find(w => w.id === worker.id)) {
            setAssignedWorkers([...assignedWorkers, worker])
        }
        setIsAssigning(false)
    }

    const handleRemove = (workerId: string) => {
        setAssignedWorkers(assignedWorkers.filter(w => w.id !== workerId))
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

    return (
        <DialogContent className="sm:max-w-3xl w-full">
            <DialogHeader>
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        <IconBuildingFactory2 className="size-5" />
                    </div>
                    <div>
                        <DialogTitle>{data.name}</DialogTitle>
                        <DialogDescription>
                            Detailed view and worker management.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">

                {/* INFO ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* DETAILS */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-purple-600">
                            <IconBuildingFactory2 className="size-5" />
                            <h3 className="font-semibold">Center Details</h3>
                        </div>

                        <div className="rounded-lg border p-4 space-y-3 text-sm">
                            <Field label="Name" value={data.name} />
                            <Field label="Type" value={data.type} />
                            <Field label="ID" mono small value={`WC-${data.id.substring(0, 6).toUpperCase()}`} />
                            <div className="grid grid-cols-[100px_1fr] gap-1">
                                <span className="text-muted-foreground">Location:</span>
                                <div className="flex items-center gap-1 font-medium">
                                    <IconMapPin className="size-3.5 text-muted-foreground" />
                                    {data.location}
                                </div>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-1">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge
                                    variant="outline"
                                    className={
                                        data.status === "Active" ? "border-green-200 text-green-700 bg-green-50" :
                                            data.status === "Maintenance" ? "border-amber-200 text-amber-700 bg-amber-50" :
                                                "border-slate-200 text-slate-700 bg-slate-50"
                                    }
                                >
                                    {data.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* ASSIGNED WORKERS LIST */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-green-600">
                            <div className="flex items-center gap-2">
                                <IconTool className="size-5" />
                                <h3 className="font-semibold">Assigned Workers</h3>
                            </div>
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                                {assignedWorkers.length} Active
                            </Badge>
                        </div>

                        <div className="rounded-lg border p-4 min-h-[160px] flex flex-col gap-2">
                            {assignedWorkers.length > 0 ? (
                                assignedWorkers.map(worker => (
                                    <div key={worker.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40 border">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8">
                                                <AvatarImage src={worker.avatar} />
                                                <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{worker.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(worker.id)}>
                                            <IconX className="size-3" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm italic">
                                    No workers assigned.
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full mt-auto border-dashed hover:bg-muted"
                                onClick={() => setIsAssigning(true)}
                            >
                                <IconPlus className="size-3.5 mr-2" />
                                Assign Worker
                            </Button>
                        </div>
                    </div>
                </div>

                {/* WORKER SELECTION AREA (Conditional) */}
                {isAssigning && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Select Worker to Assign</h4>
                            <Button variant="ghost" size="sm" onClick={() => setIsAssigning(false)}>Cancel</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableWorkers
                                .filter(w => !assignedWorkers.find(aw => aw.id === w.id)) // Filter out already assigned
                                .map((worker) => (
                                    <div
                                        key={worker.id}
                                        onClick={() => handleAssign(worker)}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10">
                                                <AvatarImage src={worker.avatar} />
                                                <AvatarFallback>
                                                    {worker.name.slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{worker.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {worker.experience}y • {worker.load} active
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary">
                                            Assign
                                        </Button>
                                    </div>
                                ))}
                            {availableWorkers.filter(w => !assignedWorkers.find(aw => aw.id === w.id)).length === 0 && (
                                <div className="col-span-2 text-center text-sm text-muted-foreground py-4">
                                    All available workers are already assigned.
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </DialogContent>
    )
}
