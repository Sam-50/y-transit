
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Route as RouteIcon, Loader2 } from "lucide-react";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getRoutes, type Route } from '@/services/routes';
import { useToast } from '@/hooks/use-toast';

interface Stop {
  id: string;
  name: string;
  completed: boolean;
}

export default function MyRoutePage() {
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRouteData = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch the specific route for the logged-in driver.
        // For this demo, we fetch all routes and take the first one.
        const routes = await getRoutes();
        if (routes.length > 0) {
          const currentRoute = routes[0];
          setRoute(currentRoute);
          // We are creating mock stops based on the route name and number of stops.
          // In a real app, stops would be a sub-collection in the database.
          const generatedStops = Array.from({ length: currentRoute.stops }, (_, i) => ({
            id: `stop${i + 1}`,
            name: `${currentRoute.name} - Stop ${i + 1}`,
            completed: false,
          }));
          setStops(generatedStops);
        }
      } catch (error) {
        console.error("Failed to fetch route data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load route information.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteData();
  }, [toast]);

  const handleStopCompletion = (stopId: string, isCompleted: boolean | 'indeterminate') => {
    setStops(currentStops =>
      currentStops.map(stop =>
        stop.id === stopId ? { ...stop, completed: !!isCompleted } : stop
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!route) {
    return (
       <div className="flex items-center justify-center h-full">
         <p className="text-muted-foreground">No route assigned or found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Route Details</h1>
        <p className="text-muted-foreground">Manually track your progress through the {route.name} for today.</p>
      </div>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><RouteIcon className="h-5 w-5 text-primary" /> {route.name} Checklist</CardTitle>
               <CardDescription>Check off each stop as you complete it. Data is from the database.</CardDescription>
          </CardHeader>
          <CardContent>
               <div className="space-y-4">
                  {stops.map((stop, index) => (
                      <div key={stop.id}>
                        <div className="flex items-center gap-4">
                            <Checkbox 
                              id={stop.id}
                              checked={stop.completed}
                              onCheckedChange={(checked) => handleStopCompletion(stop.id, checked)}
                              className="h-6 w-6"
                            />
                            <Label htmlFor={stop.id} className="flex-1 cursor-pointer">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className={`font-medium ${stop.completed ? 'line-through text-muted-foreground' : ''}`}>{stop.name}</p>
                                    </div>
                                    <Badge variant={stop.completed ? 'secondary' : 'outline'} className={!stop.completed ? 'text-primary border-primary' : ''}>
                                      {stop.completed ? 'Completed' : 'Upcoming'}
                                    </Badge>
                                </div>
                            </Label>
                        </div>
                        {index < stops.length - 1 && <Separator className="mt-4" />}
                      </div>
                  ))}
               </div>
          </CardContent>
      </Card>
      
    </div>
  );
}
