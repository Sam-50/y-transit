
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, Bell, User, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getStudents, type Student } from '@/services/students';
import { getIncidents, type Incident } from '@/services/incidents';

export default function ParentDashboardPage({ welcomeProps }: { welcomeProps?: { user: 'Admin' | 'Driver' | 'Parent', name: string }}) {
  const { toast } = useToast();
  const [children, setChildren] = useState<Student[]>([]);
  const [alerts, setAlerts] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, you'd filter these by the logged-in parent.
        const [fetchedStudents, fetchedIncidents] = await Promise.all([getStudents(), getIncidents()]);
        setChildren(fetchedStudents);
        setAlerts(fetchedIncidents.slice(0, 3)); // Show top 3 recent incidents as alerts
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load dashboard data.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleContactDriver = (childName: string) => {
    toast({
        title: "Contacting Driver",
        description: `A message has been sent to the driver regarding ${childName}. They will respond when it is safe to do so.`,
    })
  }

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Parent Dashboard</h1>
          <p className="text-muted-foreground">Track your children's journey and stay updated.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Real-time Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="flex items-start gap-3">
                                <div className="text-xs font-semibold text-muted-foreground pt-1">{new Date(alert.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                <div className="flex-1 text-sm">{alert.report} on {alert.route}</div>
                            </div>
                        ))}
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> My Children</CardTitle>
                 <CardDescription>Data fetched from the database.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : children.map((child) => (
                     <Card key={child.id} className="flex flex-col sm:flex-row items-start gap-4 p-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={child.avatar} data-ai-hint="child portrait"/>
                            <AvatarFallback>{child.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{child.name}</h3>
                                 <Badge variant={child.status === 'Enrolled' ? 'default' : 'secondary'} className={child.status === 'Enrolled' ? 'bg-green-500 text-white' : ''}>
                                    {child.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> {child.route}
                            </p>
                            <p className="text-sm font-medium">
                                {child.status === 'Enrolled' ? `Journey in progress.` : 'Journey complete or not started.'}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 sm:static" onClick={() => handleContactDriver(child.name)}>
                            <MessageSquare className="h-4 w-4"/>
                            <span className="sr-only">Contact Driver</span>
                        </Button>
                    </Card>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
