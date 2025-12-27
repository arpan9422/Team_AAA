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
import { Equipment } from "@/app/manager-dashboard/equipment/page"
import api from "@/lib/api"

export function EquipmentMaintenanceDialog({
    equipment,
}: {
    equipment: Equipment
}) {
    const [history, setHistory] = React.useState<any[]>([])
    const [health, setHealth] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true)
                // Fetch History
                const historyRes = await api.get(`/equipment/${equipment.id}/history`)
                setHistory(historyRes.data)

                // Fetch Health
                const healthRes = await api.get(`/equipment/${equipment.id}/health`)
                setHealth(healthRes.data)
            } catch (error) {
                console.error("Failed to fetch details:", error)
            } finally {
                setLoading(false)
            }
        }

        if (equipment.id) {
            fetchDetails()
        }
    }, [equipment.id])

    return (
        <DialogContent className="sm:max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <IconTool className="size-5 text-purple-600" />
                    Maintenance History: {equipment.name}
                </DialogTitle>
                <DialogDescription>
                    View past maintenance records and health status.
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-100 flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-green-700">Health Score</span>
                        <span className="text-2xl font-bold text-green-700">
                            {health?.healthScore ? `${health.healthScore}%` : 'N/A'}
                        </span>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Next Service</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-blue-700">
                                {health?.nextMaintenanceDate ? new Date(health.nextMaintenanceDate).toLocaleDateString() : 'None Scheduled'}
                            </span>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Assignments</span>
                        <span className="text-2xl font-bold text-indigo-700">-</span>
                    </div>
                </div>

                {/* History Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">Loading history...</TableCell>
                                </TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No history records found.</TableCell>
                                </TableRow>
                            ) : (
                                history.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <IconClock className="size-3.5 text-muted-foreground" />
                                            {new Date(record.eventDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal text-xs">
                                                {record.eventType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{record.notes || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </DialogContent>
    )
}
