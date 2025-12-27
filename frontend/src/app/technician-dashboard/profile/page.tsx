"use client"

import * as React from "react"
import { TechnicianSidebar } from "@/components/technician-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import api from "@/lib/api"
import {
    IconUser,
    IconMail,
    IconPhone,
    IconMapPin,
    IconBriefcase,
    IconCalendar,
    IconEdit,
    IconCheck,
    IconX,
    IconTool
} from "@tabler/icons-react"

interface Certification {
    name: string
    issueDate: string
    expiryDate: string
}

interface Profile {
    name: string
    email: string
    phone: string
    location: string
    department: string
    role: string
    employeeId: string
    joinDate: string
    avatar: string
    skills: string[]
    certifications: Certification[]
    stats: {
        tasksCompleted: number
        avgResponseTime: string
        rating: number
        yearsExperience: number
    }
}

// Mock user profile data
const initialProfile: Profile = {
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    location: "Building A, Floor 2",
    department: "Maintenance",
    role: "Senior Technician",
    employeeId: "EMP-2024-001",
    joinDate: "January 15, 2020",
    avatar: "https://i.pravatar.cc/150?u=johndoe",
    skills: ["Electrical", "Mechanical", "HVAC", "Plumbing", "Welding"],
    certifications: [
        { name: "OSHA Safety Certified", issueDate: "2023-01", expiryDate: "2026-01" },
        { name: "HVAC Technician License", issueDate: "2022-06", expiryDate: "2025-06" },
        { name: "Electrical Systems Certification", issueDate: "2021-03", expiryDate: "2024-03" }
    ],
    stats: {
        tasksCompleted: 245,
        avgResponseTime: "2.3 hrs",
        rating: 4.8,
        yearsExperience: 4
    }
}

export default function TechnicianProfilePage() {
    const [profile, setProfile] = React.useState<Profile>(initialProfile)
    const [isEditing, setIsEditing] = React.useState(false)
    const [editedProfile, setEditedProfile] = React.useState<Profile>(initialProfile)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                const response = await api.get('/auth/me')
                const userData = response.data.user

                // Merge with initialProfile for fields not yet in backend
                const mergedProfile = {
                    ...initialProfile,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    employeeId: userData.employeeId || userData.id.substring(0, 8),
                    department: userData.department || "Maintenance",
                }
                setProfile(mergedProfile)
                setEditedProfile(mergedProfile)
            } catch (error) {
                console.error("Failed to fetch profile:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleSave = async () => {
        // Mock save for now
        setProfile(editedProfile)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-bg-soft">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading profile...</p>
                </div>
            </div>
        )
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
            <TechnicianSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6 bg-bg-soft">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold tracking-tight text-text-primary">My Profile</h2>
                            <p className="text-muted-foreground">
                                Manage your personal information and professional details
                            </p>
                        </div>
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                <IconEdit className="mr-2 size-4" />
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button onClick={handleCancel} variant="outline">
                                    <IconX className="mr-2 size-4" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="bg-accent-cyan hover:bg-accent-cyan/90 text-white">
                                    <IconCheck className="mr-2 size-4" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column - Profile Card */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <Avatar className="size-32">
                                            <AvatarImage src={profile.avatar} />
                                            <AvatarFallback className="text-2xl">
                                                {profile.name.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle className="text-xl">{profile.name}</CardTitle>
                                    <CardDescription className="flex flex-col gap-1 mt-2">
                                        <Badge variant="secondary" className="w-fit mx-auto">
                                            {profile.role}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground mt-2">
                                            ID: {profile.employeeId}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Separator />

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold text-accent-cyan">{profile.stats.tasksCompleted}</p>
                                            <p className="text-xs text-muted-foreground">Tasks Completed</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold text-accent-yellow">{profile.stats.rating}</p>
                                            <p className="text-xs text-muted-foreground">Rating</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold text-primary">{profile.stats.avgResponseTime}</p>
                                            <p className="text-xs text-muted-foreground">Avg Response</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold text-primary">{profile.stats.yearsExperience}</p>
                                            <p className="text-xs text-muted-foreground">Years Exp.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Details */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconUser className="size-5 text-accent-cyan" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        {isEditing ? (
                                            <Input
                                                id="name"
                                                value={editedProfile.name}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                                                <IconUser className="size-4 text-muted-foreground" />
                                                <span>{profile.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        {isEditing ? (
                                            <Input
                                                id="email"
                                                type="email"
                                                value={editedProfile.email}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                                                <IconMail className="size-4 text-muted-foreground" />
                                                <span>{profile.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        {isEditing ? (
                                            <Input
                                                id="phone"
                                                value={editedProfile.phone}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                                                <IconPhone className="size-4 text-muted-foreground" />
                                                <span>{profile.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        {isEditing ? (
                                            <Input
                                                id="location"
                                                value={editedProfile.location}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                                                <IconMapPin className="size-4 text-muted-foreground" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Professional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconBriefcase className="size-5 text-accent-yellow" />
                                        Professional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Department</p>
                                            <p className="font-medium">{profile.department}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Role</p>
                                            <p className="font-medium">{profile.role}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Join Date</p>
                                            <div className="flex items-center gap-2">
                                                <IconCalendar className="size-4 text-muted-foreground" />
                                                <span>{profile.joinDate}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Experience</p>
                                            <p className="font-medium">{profile.stats.yearsExperience} years</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <IconTool className="size-4 text-primary" />
                                            Skills & Expertise
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill: string, index: number) => (
                                                <Badge key={index} variant="secondary">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Certifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Certifications</CardTitle>
                                    <CardDescription>
                                        Your professional certifications and licenses
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {profile.certifications.map((cert: Certification, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{cert.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Issued: {cert.issueDate} • Expires: {cert.expiryDate}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="border-green-200 text-green-700">
                                                    Active
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
