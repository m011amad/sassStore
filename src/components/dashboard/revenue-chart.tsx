'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--color-chart-1)' },
  orders: { label: 'Orders', color: 'var(--color-chart-2)' },
}

function formatAUD(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No revenue data yet
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
          }
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
          width={52}
        />
        <Tooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) =>
                name === 'revenue' ? formatAUD(value as number) : String(value)
              }
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString('en-AU', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              }
            />
          }
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
