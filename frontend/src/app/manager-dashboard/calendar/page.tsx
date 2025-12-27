
"use client"

import * as React from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Dialog } from "@/components/ui/dialog"
import { RequestDetailsDialog } from "@/components/request-details-dialog"

// Setup the localizer by providing the moment (or globalize) Object
const localizer = momentLocalizer(moment)

// Mock Data from JSON but transformed for Calendar
const events = [
    {
        id: 1,
        title: "Laptop overheating - Dell XPS 15",
        start: new Date(2024, 3, 12, 10, 0), // April 12, 10:00 AM
        end: new Date(2024, 3, 12, 12, 0),
        resource: { priority: "High", status: "NEW", requestType: "CORRECTIVE", equipmentName: "Dell XPS 15", serialNumber: "DX-100293", createdAt: "2024-04-12" }
    },
    {
        id: 2,
        title: "Quarterly Maintenance - Server Rack A",
        start: new Date(2024, 3, 10, 14, 0),
        end: new Date(2024, 3, 10, 16, 0),
        resource: { priority: "Medium", status: "IN_PROGRESS", requestType: "PREVENTIVE", equipmentName: "Server Rack A", serialNumber: "SR-99281", createdAt: "2024-04-10" }
    },
    {
        id: 3,
        title: "Broken Screen - Monitor LG 27",
        start: new Date(2024, 3, 5, 9, 0),
        end: new Date(2024, 3, 5, 11, 30),
        resource: { priority: "Low", status: "REPAIRED", requestType: "CORRECTIVE", equipmentName: "Monitor LG 27", serialNumber: "LG-22311", createdAt: "2024-04-05" }
    },
    {
        id: 5,
        title: "Routine Inspection - Generator G1",
        start: new Date(2024, 3, 1, 8, 0),
        end: new Date(2024, 3, 1, 12, 0),
        resource: { priority: "High", status: "NEW", requestType: "PREVENTIVE", equipmentName: "Generator G1", serialNumber: "GN-11002", createdAt: "2024-04-01" }
    },
    // Add some current date events for demo
    {
        id: 101,
        title: "Emergency Repair - Conveyor Belt",
        start: new Date(new Date().setHours(9, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 0, 0, 0)),
        resource: { priority: "High", status: "IN_PROGRESS", requestType: "CORRECTIVE", equipmentName: "Conveyor Belt", serialNumber: "CB-200", createdAt: new Date().toISOString().split('T')[0] }
    },
    {
        id: 102,
        title: "System Update - Main Server",
        start: new Date(new Date().setHours(14, 0, 0, 0)),
        end: new Date(new Date().setHours(16, 30, 0, 0)),
        resource: { priority: "Medium", status: "NEW", requestType: "PREVENTIVE", equipmentName: "Main Server", serialNumber: "SV-01", createdAt: new Date().toISOString().split('T')[0] }
    }
]

export default function CalendarPage() {
    const [selectedEvent, setSelectedEvent] = React.useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    const handleSelectEvent = (event: any) => {
        // Construct the expected format for RequestDetailsDialog
        const dialogData = {
            id: event.id,
            title: event.title.split(' - ')[0],
            equipmentName: event.resource.equipmentName,
            serialNumber: event.resource.serialNumber,
            createdAt: event.resource.createdAt,
            priority: event.resource.priority,
            requestType: event.resource.requestType,
            status: event.resource.status
        }
        setSelectedEvent(dialogData)
        setIsDialogOpen(true)
    }

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '#3174ad'
        if (event.resource.priority === 'High') backgroundColor = '#ef4444' // red-500
        if (event.resource.priority === 'Medium') backgroundColor = '#eab308' // yellow-500
        if (event.resource.priority === 'Low') backgroundColor = '#22c55e' // green-500

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
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
                <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6 h-full">
                    <div className="flex flex-col gap-1 mb-4">
                        <h2 className="text-2xl font-bold tracking-tight">Maintenance Calendar</h2>
                        <p className="text-muted-foreground">
                            Schedule and track maintenance requests
                        </p>
                    </div>

                    <div className="bg-card rounded-xl border p-6 shadow-sm h-[800px]">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={['month', 'week', 'day', 'agenda']}
                            defaultView={Views.WEEK}
                            step={60}
                            showMultiDayTimes
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={handleSelectEvent}
                        />
                    </div>

                    <div className="hidden">
                        {/* Hidden trigger for reuse of Dialog component, 
                            but wait, RequestDetailsDialog controls its own open/close if passed row? 
                            No, it's a component that renders DialogContent. 
                            We need to wrap it in a root Dialog controlled by us. 
                        */}

                    </div>
                    {/* 
                       RequestDetailsDialog is designed to be inside a Dialog. 
                       We need to render a Dialog here.
                     */}
                    <div className="hidden">
                        {/* Hack to preload styles if needed, but actually we just render the Dialog conditionally */}
                    </div>

                    {selectedEvent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                            {/* We use a separate Dialog instance to handle the popup */}
                            {/* 
                                 ISSUE: RequestDetailsDialog renders DialogContent directly. 
                                 Correct usage: <Dialog open={...}><RequestDetailsDialog ... /></Dialog> 
                              */}
                        </div>
                    )}
                    <div onMouseDown={(e) => e.stopPropagation()}>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            {selectedEvent && <RequestDetailsDialog data={selectedEvent} />}
                        </Dialog>
                    </div>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}


