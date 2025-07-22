
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Route, Bot, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { type Route as RouteType, getRoutes } from '@/services/routes';
import { type Student, getStudents } from '@/services/students';
import { type Incident, getIncidents } from '@/services/incidents';

export default function AdminDashboardPage({ welcomeProps }: { welcomeProps?: { user: 'Admin' | 'Driver' | 'Parent', name: string }}) {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [routesData, studentsData, incidentsData] = await Promise.all([
        getRoutes(),
        getStudents(),
        getIncidents(),
      ]);
      setRoutes(routesData);
      setStudents(studentsData);
      setIncidents(incidentsData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const getRouteStatus = (routeName: string) => {
    // This is a simplified status logic. In a real app, this would be more complex.
    const incidentOnRoute = incidents.some(i => i.route === routeName && i.status !== 'Closed');
    return incidentOnRoute ? 'Delayed' : 'On Time';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of all school transit operations.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">Managed by the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.filter(s => s.status === 'Enrolled').length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.filter(i => i.status !== 'Closed').length}</div>
            <p className="text-xs text-muted-foreground">{incidents.length} total incidents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Route Assignments</CardTitle>
            <CardDescription>Live status and student count for all bus routes.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.slice(0, 5).map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.driver}</TableCell>
                        <TableCell>{route.students}</TableCell>
                        <TableCell>
                            <Badge variant={getRouteStatus(route.name) === 'Delayed' ? 'destructive' : 'secondary'}>{getRouteStatus(route.name)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Safety Incidents</CardTitle>
            <CardDescription>Most recent incident reports filed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.slice(0, 3).map((incident) => (
                <div key={incident.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <ShieldAlert className={`h-5 w-5 ${incident.severity === 'Medium' ? 'text-orange-500' : incident.severity === 'High' ? 'text-red-500' : 'text-green-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Route: {incident.route}</p>
                    <p className="text-sm text-muted-foreground truncate">{incident.report}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
