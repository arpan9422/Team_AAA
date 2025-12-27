
"use client"

import * as React from "react"
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { IconCheck, IconAlertTriangle, IconClock, IconTool, IconUser } from "@tabler/icons-react"

// Mock Maintenance History Data
const maintenanceHistory = [
    {
        id: "m1",
        date: "2024-04-10",
        type: "Preventive",
        description: "Quarterly inspection and cleaning",
        technician: "Alice Smith",
        status: "Completed",
        cost: "$150"
    },
    {
        id: "m2",
        date: "2024-02-15",
        type: "Corrective",
        description: "Replaced faulty sensor",
        technician: "Bob Jones",
        status: "Completed",
        cost: "$420"
    },
    {
        id: "m3",
        date: "2023-11-05",
        type: "Preventive",
        description: "Annual maintenance service",
        technician: "Charlie Day",
        status: "Completed",
        cost: "$300"
    }
]

export function EquipmentMaintenanceDialog({
    equipment,
}: {
    equipment: any
}) {
    return (
        <DialogContent className="sm:max-w-4xl w-full">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <IconTool className="size-5 text-purple-600" />
                    Maintenance History: {equipment.name}
                </DialogTitle>
                <DialogDescription>
                    View past maintenance records and upcoming schedules.
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-100 flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-green-700">Health Score</span>
                        <span className="text-2xl font-bold text-green-700">98%</span>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Next Service</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-blue-700">14 Days</span>
                            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 text-[10px]">Upcoming</Badge>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Total Cost (YTD)</span>
                        <span className="text-2xl font-bold text-indigo-700">$870</span>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Technician</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {maintenanceHistory.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <IconClock className="size-3.5 text-muted-foreground" />
                                        {record.date}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal text-xs">
                                            {record.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{record.description}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <div className="size-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {record.technician.charAt(0)}
                                            </div>
                                            {record.technician}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-green-600">
                                            <IconCheck className="size-4" />
                                            <span className="text-sm font-medium">{record.status}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">
                                        {record.cost}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </DialogContent>
    )
}
