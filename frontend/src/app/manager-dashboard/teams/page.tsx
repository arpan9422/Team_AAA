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
import api from "@/lib/api"
import { toast } from "sonner"

// Types matching backend
type Member = {
    id: string
    name: string
    email: string
    role: "MANAGER" | "TECHNICIAN" | "EMPLOYEE"
    avatar?: string
}

type Team = {
    id: string
    name: string
    description?: string
    isActive: boolean
    // Frontend helpers
    icon_color?: string
    icon_bg?: string
    members?: Member[] // May require separate fetch or include
    _count?: {
        users: number
    }
}

export default function TeamsPage() {
    const [teams, setTeams] = React.useState<Team[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)
    const [selectedTeamMembers, setSelectedTeamMembers] = React.useState<Member[]>([])

    // Dialog States
    const [isAddTeamOpen, setIsAddTeamOpen] = React.useState(false)
    const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false)
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)

    // Form States
    const [newTeamData, setNewTeamData] = React.useState({ name: "", description: "" })

    // For adding member, we ideally list all users. For now, we'll just require User ID (simplified) 
    // or we could fetch available users. Let's start with User ID input for MVP.
    const [newMemberUserId, setNewMemberUserId] = React.useState("")

    const fetchTeams = async () => {
        try {
            setLoading(true)
            const res = await api.get('/teams')
            // Backend returns { teams: [...] }
            const teamsData = res.data.teams.map((t: any) => ({
                ...t,
                icon_color: "text-slate-600", // Default style
                icon_bg: "bg-slate-100"
            }))
            setTeams(teamsData)
        } catch (error) {
            console.error("Failed to fetch teams:", error)
            toast.error("Failed to load teams")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeamMembers = async (teamId: string) => {
        try {
            const res = await api.get(`/teams/${teamId}/members`)
            // Backend returns { members: [...] } where member has .user nested or direct?
            // Controller: getTeamMembers -> service.getTeamMembers -> returns TeamMember[], include user
            // Let's assume response structure: { members: [{ user: { id, name, email, role } }, ...] }
            const members = res.data.members.map((m: any) => ({
                id: m.userId,
                name: m.user?.name || "Unknown",
                email: m.user?.email || "",
                role: m.user?.role || "EMPLOYEE",
                avatar: `https://i.pravatar.cc/150?u=${m.userId}`
            }))
            setSelectedTeamMembers(members)
        } catch (error) {
            console.error("Failed to fetch members:", error)
            toast.error("Failed to load team members")
        }
    }

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateTeam = async () => {
        try {
            await api.post('/teams', newTeamData)
            toast.success("Team created successfully")
            setIsAddTeamOpen(false)
            setNewTeamData({ name: "", description: "" })
            fetchTeams()
        } catch (error) {
            console.error("Failed to create team:", error)
            toast.error("Failed to create team")
        }
    }

    const handleAddMember = async () => {
        if (!selectedTeam) return
        try {
            // Looking up user ID might be hard for user. 
            // Ideally we have a user select dropdown. 
            // For now, assuming user enters a valid UUID for simplicity or we need a user search.
            // Let's warn if not UUID.
            await api.post(`/teams/${selectedTeam.id}/members`, { userId: newMemberUserId })
            toast.success("Member added successfully")
            setIsAddMemberOpen(false)
            setNewMemberUserId("")
            // Refresh members
            fetchTeamMembers(selectedTeam.id)
        } catch (error) {
            console.error("Failed to add member:", error)
            toast.error("Failed to add member. Ensure User ID is valid.")
        }
    }

    const openTeamDetails = (team: Team) => {
        setSelectedTeam(team)
        setSelectedTeamMembers([]) // Clear valid
        setIsDetailOpen(true)
        fetchTeamMembers(team.id)
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
                    {loading ? (
                        <div className="flex justify-center p-12">Loading teams...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredTeams.map((team) => (
                                <div
                                    key={team.id}
                                    className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-[180px]"
                                    onClick={() => openTeamDetails(team)}
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
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-normal">
                                                Click to view members
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

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
                                            <Badge variant="secondary" className="bg-white shadow-sm border">{selectedTeamMembers.length} members</Badge>
                                        </div>

                                        <div className="space-y-2">
                                            {selectedTeamMembers.length === 0 ? (
                                                <div className="text-sm text-muted-foreground text-center py-4">No members assigned</div>
                                            ) : (
                                                selectedTeamMembers.map((member) => (
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
                                                                    {member.role === 'MANAGER' && <IconCrown className="size-3 text-amber-500 fill-amber-500" />}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                    <IconMail className="size-3" />
                                                                    <span>{member.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Badge
                                                            variant={member.role === 'MANAGER' ? 'default' : 'secondary'}
                                                            className={member.role === 'MANAGER' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200'}
                                                        >
                                                            {member.role}
                                                        </Badge>
                                                    </div>
                                                ))
                                            )}
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
                                                    <DialogDescription>Enter User ID to add to {selectedTeam.name}.</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="mem-id" className="text-right">User ID</Label>
                                                        <Input
                                                            id="mem-id"
                                                            className="col-span-3"
                                                            placeholder="UUID"
                                                            value={newMemberUserId}
                                                            onChange={(e) => setNewMemberUserId(e.target.value)}
                                                        />
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
