
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, Cell } from 'recharts';


const onTimePerformanceData = [
    { month: 'Jan', onTime: 95, delayed: 5 },
    { month: 'Feb', onTime: 92, delayed: 8 },
    { month: 'Mar', onTime: 97, delayed: 3 },
    { month: 'Apr', onTime: 98, delayed: 2 },
    { month: 'May', onTime: 96, delayed: 4 },
];

const incidentTypesData = [
  { name: 'Traffic', value: 40, fill: 'hsl(var(--chart-1))' },
  { name: 'Mechanical', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'Driver Behavior', value: 15, fill: 'hsl(var(--chart-3))' },
  { name: 'Other', value: 20, fill: 'hsl(var(--chart-4))' },
];

const studentRidershipData = [
    { date: '2024-05-01', students: 230 },
    { date: '2024-05-02', students: 235 },
    { date: '2024-05-03', students: 240 },
    { date: '2024-05-04', students: 238 },
    { date: '2024-05-05', students: 245 },
];

const chartConfig = {
  onTime: {
    label: "On-Time",
    color: "hsl(var(--chart-2))",
  },
  delayed: {
    label: "Delayed",
    color: "hsl(var(--chart-1))",
  },
  students: {
    label: "Students",
    color: "hsl(var(--primary))",
  }
};


export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Transit Analytics</h1>
        <p className="text-muted-foreground">Key performance indicators and trends for the school transport system.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><BarChart className="h-5 w-5 text-primary" /> On-Time Performance</CardTitle>
            <CardDescription>Percentage of routes completed on time vs. delayed.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <RechartsBarChart data={onTimePerformanceData} stackOffset="expand">
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis type="number" tickFormatter={(value) => `${value * 100}%`} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <RechartsLegend content={<ChartLegendContent />} />
                <Bar dataKey="onTime" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="delayed" stackId="a" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><PieChart className="h-5 w-5 text-primary" /> Incident Type Distribution</CardTitle>
            <CardDescription>Breakdown of reported safety incidents by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
                <RechartsPieChart>
                    <RechartsTooltip content={<ChartTooltipContent />} />
                    <Pie data={incidentTypesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {incidentTypesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <RechartsLegend content={<ChartLegendContent />} />
                </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><LineChart className="h-5 w-5 text-primary" /> Daily Student Ridership</CardTitle>
          <CardDescription>Total number of students using the bus service daily.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <RechartsLineChart data={studentRidershipData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip content={<ChartTooltipContent />} />
              <RechartsLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="students" strokeWidth={2} />
            </RechartsLineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
