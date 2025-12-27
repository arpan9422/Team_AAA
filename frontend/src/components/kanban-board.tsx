
"use client"

import * as React from "react"
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragStartEvent,
    DragEndEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    IconSearch,
    IconFilter,
    IconLayoutGrid,
    IconList,
    IconPlus,
    IconClock,
    IconUser,
    IconAlertTriangle,
    IconTool,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"
import { RequestDetailsDialog } from "@/components/request-details-dialog"

// Types matching the data
type Request = {
    id: number
    title: string
    equipmentName: string
    serialNumber: string
    createdAt: string
    priority: string
    requestType: string
    status: string // NEW, IN_PROGRESS, REPAIRED, SCRAP
}

const COLUMNS = [
    { id: "NEW", title: "New", color: "bg-blue-500" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-yellow-500" },
    { id: "REPAIRED", title: "Repaired", color: "bg-green-500" },
    { id: "SCRAP", title: "Scrap", color: "bg-red-500" },
]

export function KanbanBoard({ data }: { data: any[] }) {
    const [items, setItems] = React.useState<Request[]>(data)
    const [activeId, setActiveId] = React.useState<number | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [typeFilter, setTypeFilter] = React.useState("All Types")

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(Number(event.active.id))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const activeItem = items.find((item) => item.id === Number(active.id))
            const overColumnId = over.id as string

            if (activeItem && COLUMNS.some((col) => col.id === overColumnId)) {
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === activeItem.id ? { ...item, status: overColumnId } : item
                    )
                )
            }
        }
        setActiveId(null)
    }

    const filteredItems = React.useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesType =
                typeFilter === "All Types" || item.requestType === typeFilter.toUpperCase()
            return matchesSearch && matchesType
        })
    }, [items, searchQuery, typeFilter])

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            {/* Header Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight">Maintenance Requests</h2>
                    <p className="text-muted-foreground">
                        Manage and track all maintenance activities
                    </p>
                </div>
                {/* Note: User asked NOT to add the "New Request" button, so omitting it */}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div className="flex flex-1 items-center gap-2 max-w-lg">
                    <div className="relative flex-1">
                        <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search requests..."
                            className="pl-8 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px]">
                            <div className="flex items-center gap-2">
                                <IconFilter className="h-4 w-4" />
                                <SelectValue placeholder="Filter" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Types">All Types</SelectItem>
                            <SelectItem value="Corrective">Corrective</SelectItem>
                            <SelectItem value="Preventive">Preventive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>


            </div>

            {/* Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            items={filteredItems.filter((item) => item.status === column.id)}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeId ? (
                        <KanbanCard
                            item={items.find((item) => item.id === activeId)!}
                            isOverlay
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}

function KanbanColumn({ column, items }: { column: any; items: Request[] }) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    })

    return (
        <div className="flex h-full w-[350px] min-w-[350px] flex-col rounded-lg border bg-muted/30">
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                    <span className="font-semibold">{column.title}</span>
                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                        {items.length}
                    </Badge>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                        <IconPlus className="size-3" />
                    </Button>
                </div>
            </div>
            <Separator />

            {/* Column Content (Droppable Area) */}
            <div ref={setNodeRef} className="flex-1 flex flex-col gap-3 p-3">
                {items.length > 0 ? (
                    items.map((item) => <KanbanCard key={item.id} item={item} />)
                ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md m-2">
                        No requests
                    </div>
                )}
            </div>
        </div>
    )
}

function KanbanCard({ item, isOverlay }: { item: Request; isOverlay?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
    })

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
        relative rounded-lg border bg-card shadow-sm transition-all hover:bg-accent/50 cursor-grab active:cursor-grabbing
        ${isOverlay ? "rotate-2 scale-105 shadow-xl ring-2 ring-primary ring-offset-2 z-50 cursor-grabbing" : ""}
        ${isDragging ? "opacity-30" : ""}
        ${item.priority === "High" ? "border-l-4 border-l-red-500" :
                    item.priority === "Medium" ? "border-l-4 border-l-yellow-500" :
                        item.priority === "Low" ? "border-l-4 border-l-green-500" : ""}
      `}
        >
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex flex-col gap-3 p-4 w-full h-full text-left">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1.5">
                                <h4 className="font-semibold leading-none">{item.title}</h4>
                            </div>
                            <Badge
                                variant={
                                    item.priority === "High"
                                        ? "destructive"
                                        : item.priority === "Medium"
                                            ? "secondary" // secondary often yellow/orange in customizations or default gray
                                            : "outline"
                                }
                                className={`
            ${item.priority === "Medium" ? "bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200" : ""}
            ${item.priority === "Low" ? "bg-slate-100 text-slate-700 hover:bg-slate-100/80" : ""}
            capitalize
          `}
                            >
                                {item.priority}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="font-normal text-xs flex items-center gap-1">
                                <IconTool className="size-3" />
                                {item.equipmentName}
                            </Badge>
                            <Badge variant="outline" className="font-normal text-xs bg-purple-50 text-purple-700 border-purple-200">
                                {item.equipmentName.includes("Server") || item.equipmentName.includes("UPS") ? "Server Room"
                                    : item.equipmentName.includes("Generator") || item.equipmentName.includes("Machine") ? "Plant Floor"
                                        : "IT Ops"}
                            </Badge>
                            <Badge variant="secondary" className="font-normal text-xs bg-muted/60 text-muted-foreground">
                                {item.requestType}
                            </Badge>
                            {item.status === 'NEW' && item.priority === 'High' && (
                                <Badge variant="outline" className="font-normal text-xs border-amber-500/30 text-amber-600 bg-amber-500/5 gap-1">
                                    <IconAlertTriangle className="size-3" /> Overdue
                                </Badge>
                            )}
                        </div>

                        <Separator className="my-1" />

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <IconClock className="size-3.5" />
                                <span>{item.createdAt}</span>
                            </div>

                        </div>
                    </div>
                </DialogTrigger>
                <RequestDetailsDialog data={item} />
            </Dialog>
        </div>
    )
}
