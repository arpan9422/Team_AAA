"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { KanbanBoard } from "@/components/kanban-board"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import api from "@/lib/api"
import { toast } from "sonner"

export default function RequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/kanban');
            const formattedData = response.data.map((req: any) => ({
                id: req.id,
                title: req.title,
                equipmentName: req.equipment?.name || 'N/A',
                serialNumber: req.equipment?.serialNumber || 'N/A',
                createdAt: new Date(req.createdAt).toISOString().split('T')[0], // YYYY-MM-DD
                priority: req.priority,
                requestType: req.requestType,
                status: req.status,
                // Pass full object for details dialog
                description: req.description,
                technicianName: req.technician?.name || 'Unassigned',
                teamName: req.team?.name || 'Unassigned',
                ...req
            }));
            setRequests(formattedData);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/kanban/${id}/status`, { status: newStatus });
            toast.success("Status updated successfully");
            // Optional: refresh data to ensure consistency, or rely on optimistic UI from KanbanBoard
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update status");
            // Revert changes if needed by refetching
            fetchRequests();
        }
    };

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
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4 lg:px-6">
                                {loading ? (
                                    <div className="flex items-center justify-center p-8">Loading requests...</div>
                                ) : (
                                    <KanbanBoard data={requests} onStatusChange={handleStatusChange} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
