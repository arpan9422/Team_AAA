import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFileDescription,
  IconTools,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardStats {
  equipment: {
    total: number;
    active: number;
    scrapped: number;
  };
  requests: {
    active: number;
    completedThisMonth: number;
    overdue: number;
    new: number;
  };
  technicians: {
    active: number;
  };
}

export function SectionCards({ stats }: { stats?: DashboardStats }) {
  // Default values if stats are not loaded yet
  const equipmentTotal = stats?.equipment?.total || 0;
  const activeRequests = stats?.requests?.active || 0;
  const completedMonth = stats?.requests?.completedThisMonth || 0;
  const overdueRequests = stats?.requests?.overdue || 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconTools className="size-4 text-muted-foreground" />
            <CardDescription>Total Equipments</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {equipmentTotal}
          </CardTitle>
          <CardAction>

          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Inventory Healthy <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            All systems operational
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconFileDescription className="size-4 text-muted-foreground" />
            <CardDescription>Active Request</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeRequests}
          </CardTitle>
          <CardAction>

          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Requires Attention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Pending requests
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconCircleCheck className="size-4 text-muted-foreground" />
            <CardDescription>Completed (Month)</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {completedMonth}
          </CardTitle>
          <CardAction>

          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            On Track <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Monthly completion</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="size-4 text-muted-foreground" />
            <CardDescription>Overdue</CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {overdueRequests}
          </CardTitle>
          <CardAction>

          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Urgent Action Needed <IconAlertTriangle className="size-4" />
          </div>
          <div className="text-muted-foreground">Past due date</div>
        </CardFooter>
      </Card>
    </div>
  )
}
