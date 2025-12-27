"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api" // Assuming api client is set up
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Define the shape of data expected by DataTable
interface RequestData {
  id: string;
  title?: string | null;
  equipmentName?: string | null;
  serialNumber?: string | null;
  createdAt: string;
  priority: string;
  requestType: string;
  status: string;
}

export default function Page() {
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Summary Stats
        const summaryRes = await api.get('/dashboard/summary');
        setStats(summaryRes.data);

        // Fetch Recent/Active Requests (Using Kanban endpoint to get all details)
        const requestsRes = await api.get('/kanban');

        // Map backend response to DataTable schema
        const mappedRequests = requestsRes.data.map((req: any) => ({
          id: req.id,
          title: req.title,
          equipmentName: req.equipment?.name || 'N/A',
          serialNumber: req.equipment?.serialNumber || 'N/A',
          createdAt: new Date(req.createdAt).toISOString().split('T')[0], // YYYY-MM-DD
          priority: req.priority,
          requestType: req.requestType,
          status: req.status,
        }));

        setRequests(mappedRequests);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              <SectionCards stats={stats} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={requests} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
