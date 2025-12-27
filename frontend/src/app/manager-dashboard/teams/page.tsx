
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    IconSearch,
    IconPlus,
    IconUsers,
    IconCrown,
    IconMail
} from "@tabler/icons-react"

// Mock Data
type Member = {
    id: string
    name: string
    email: string
    role: "manager" | "technician" | "admin"
    avatar?: string
}

type Team = {
    id: string
    name: string
    description: string
    icon_color: string
    icon_bg: string
    members: Member[]
}

const initialTeams: Team[] = [
    {
        id: "1",
        name: "Mechanics",
        description: "Industrial machinery and mechanical systems",
        icon_color: "text-slate-600",
        icon_bg: "bg-slate-100",
        members: [
            { id: "m1", name: "John Martinez", email: "john.m@company.com", role: "manager", avatar: "https://i.pravatar.cc/150?u=john" },
            { id: "m2", name: "Sarah Chen", email: "sarah.c@company.com", role: "technician", avatar: "https://i.pravatar.cc/150?u=sarah" },
            { id: "m3", name: "Mike Johnson", email: "mike.j@company.com", role: "technician", avatar: "https://i.pravatar.cc/150?u=mike" },
        ]
    },
    {
        id: "2",
        name: "Electricians",
        description: "Electrical systems and power equipment",
        icon_color: "text-amber-600",
        icon_bg: "bg-amber-100",
        members: [
            { id: "e1", name: "Emily Davis", email: "emily.d@company.com", role: "manager" },
            { id: "e2", name: "Alex Turner", email: "alex.t@company.com", role: "technician" },
        ]
    },
    {
        id: "3",
        name: "IT Support",
        description: "Computers, networks, and software systems",
        icon_color: "text-cyan-600",
        icon_bg: "bg-cyan-100",
        members: [
            { id: "i1", name: "Lisa Wong", email: "lisa.w@company.com", role: "manager" },
        ]
    }
]

export default function TeamsPage() {
    const [teams, setTeams] = React.useState<Team[]>(initialTeams)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)

    // Dialog States
    const [isAddTeamOpen, setIsAddTeamOpen] = React.useState(false)
    const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false)
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)

    // Form States
    const [newTeamData, setNewTeamData] = React.useState({ name: "", description: "" })
    const [newMemberData, setNewMemberData] = React.useState({ name: "", email: "", role: "technician" })

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateTeam = () => {
        const newTeam: Team = {
            id: Math.random().toString(36).substr(2, 9),
            name: newTeamData.name || "New Team",
            description: newTeamData.description || "No description",
            icon_color: "text-purple-600",
            icon_bg: "bg-purple-100",
            members: []
        }
        setTeams([...teams, newTeam])
        setNewTeamData({ name: "", description: "" })
        setIsAddTeamOpen(false)
    }

    const handleAddMember = () => {
        if (!selectedTeam) return

        const newMember: Member = {
            id: Math.random().toString(36).substr(2, 9),
            name: newMemberData.name || "New Member",
            email: newMemberData.email || "user@company.com",
            role: newMemberData.role as "manager" | "technician",
        }

        const updatedTeams = teams.map(t => {
            if (t.id === selectedTeam.id) {
                return { ...t, members: [...t.members, newMember] }
            }
            return t
        })

        setTeams(updatedTeams)
        setSelectedTeam({ ...selectedTeam, members: [...selectedTeam.members, newMember] })
        setNewMemberData({ name: "", email: "", role: "technician" })
        setIsAddMemberOpen(false)
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
                            <h2 className="text-2xl font-bold tracking-tight">Maintenance Teams</h2>
                            <p className="text-muted-foreground">
                                Manage your maintenance teams and technicians
                            </p>
                        </div>

                        <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
                                    <IconPlus className="mr-2 size-4" />
                                    Add Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Team</DialogTitle>
                                    <DialogDescription>Add a new maintenance team to the system.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="team-name" className="text-right">Name</Label>
                                        <Input
                                            id="team-name"
                                            className="col-span-3"
                                            value={newTeamData.name}
                                            onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="team-desc" className="text-right">Desc</Label>
                                        <Input
                                            id="team-desc"
                                            className="col-span-3"
                                            value={newTeamData.description}
                                            onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateTeam}>Create Team</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 max-w-sm">
                        <div className="relative flex-1">
                            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search teams..."
                                className="pl-8 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                            <div
                                key={team.id}
                                className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-[180px]"
                                onClick={() => {
                                    setSelectedTeam(team)
                                    setIsDetailOpen(true)
                                }}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`size-12 rounded-lg flex items-center justify-center ${team.icon_bg} ${team.icon_color}`}>
                                                <IconUsers className="size-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg leading-none">{team.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 pr-4">{team.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 pt-0 mt-auto">
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {team.members.slice(0, 3).map((member) => (
                                                <Avatar key={member.id} className="size-8 border-2 border-background">
                                                    <AvatarImage src={member.avatar} />
                                                    <AvatarFallback className="text-[10px font-medium bg-muted text-muted-foreground">
                                                        {member.name.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {team.members.length > 3 && (
                                                <div className="size-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                                    +{team.members.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-normal">
                                            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Team Details Dialog */}
                    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                            {selectedTeam && (
                                <>
                                    <div className="p-6 border-b">
                                        <DialogHeader>
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className={`size-10 rounded-lg flex items-center justify-center ${selectedTeam.icon_bg} ${selectedTeam.icon_color}`}>
                                                    <IconUsers className="size-5" />
                                                </div>
                                                <DialogTitle className="text-xl">{selectedTeam.name}</DialogTitle>
                                            </div>

                                            <DialogDescription className="text-sm">
                                                {selectedTeam.description}
                                            </DialogDescription>
                                        </DialogHeader>
                                    </div>

                                    <div className="p-6 bg-slate-50/50 min-h-[300px]">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-sm">Team Members</h4>
                                            <Badge variant="secondary" className="bg-white shadow-sm border">{selectedTeam.members.length} members</Badge>
                                        </div>

                                        <div className="space-y-2">
                                            {selectedTeam.members.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm group hover:border-purple-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-10">
                                                            <AvatarImage src={member.avatar} />
                                                            <AvatarFallback className="bg-slate-100 text-slate-600">
                                                                {member.name.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="grid gap-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm leading-none">{member.name}</span>
                                                                {member.role === 'manager' && <IconCrown className="size-3 text-amber-500 fill-amber-500" />}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <IconMail className="size-3" />
                                                                <span>{member.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Badge
                                                        variant={member.role === 'manager' ? 'default' : 'secondary'}
                                                        className={member.role === 'manager' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200'}
                                                    >
                                                        {member.role}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 border-t bg-white flex justify-between items-center">
                                        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:text-purple-800 w-full sm:w-auto">
                                                    <IconPlus className="size-4 mr-2" />
                                                    Add Member
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add Team Member</DialogTitle>
                                                    <DialogDescription>Add a new member to {selectedTeam.name}.</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="mem-name" className="text-right">Name</Label>
                                                        <Input
                                                            id="mem-name"
                                                            className="col-span-3"
                                                            value={newMemberData.name}
                                                            onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="mem-email" className="text-right">Email</Label>
                                                        <Input
                                                            id="mem-email"
                                                            className="col-span-3"
                                                            value={newMemberData.email}
                                                            onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="mem-role" className="text-right">Role</Label>
                                                        <Select
                                                            value={newMemberData.role}
                                                            onValueChange={(v) => setNewMemberData({ ...newMemberData, role: v })}
                                                        >
                                                            <SelectTrigger className="col-span-3">
                                                                <SelectValue placeholder="Select role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="technician">Technician</SelectItem>
                                                                <SelectItem value="manager">Manager</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleAddMember}>Add Member</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>


                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
