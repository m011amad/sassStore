'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

const chartConfig = {
  revenue: { label: 'Revenue', color: '#3b82f6' },
}

function formatAUD(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

function formatLabel(date: string, granularity: 'daily' | 'monthly') {
  if (granularity === 'monthly') {
    return new Date(date + '-01').toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
  }
  return new Date(date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTick(date: string, granularity: 'daily' | 'monthly') {
  if (granularity === 'monthly') {
    return new Date(date + '-01').toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
  }
  return new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export function RevenueChart({
  data,
  granularity,
}: {
  data: RevenuePoint[]
  granularity: 'daily' | 'monthly'
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No revenue data yet
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatTick(v, granularity)}
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
              labelFormatter={(label) => formatLabel(label, granularity)}
            />
          }
        />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ChartContainer>
  )
}
