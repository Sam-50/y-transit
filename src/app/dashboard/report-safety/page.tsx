
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getRoutes, type Route } from "@/services/routes";
import { addIncident } from "@/services/incidents";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  routeId: z.string({ required_error: "Please select a route." }).min(1, { message: "Please select a route." }),
  incidentDate: z.date({
    required_error: "An incident date is required.",
  }),
  details: z.string().min(20, {
    message: "Details must be at least 20 characters.",
  }),
});

export default function ReportSafetyPage() {
  const { toast } = useToast();
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      setIsLoading(true);
      try {
        const routes = await getRoutes();
        setAvailableRoutes(routes);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load the list of routes.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      routeId: "",
      details: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, driver name would come from the authenticated user session
    const currentUser = auth.currentUser;
    const driverName = currentUser?.displayName || 'N/A';
    
    try {
        await addIncident({
            route: values.routeId,
            date: format(values.incidentDate, "yyyy-MM-dd"),
            report: values.details,
            driver: driverName,
            severity: 'Low', // Default severity for user-reported incidents
            status: 'Under Review'
        });

        toast({
        title: "Report Submitted",
        description: "Thank you for helping us improve safety. Your report has been logged.",
        });
        form.reset();
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'Could not submit your report. Please try again.'
        });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Report a Safety Incident</h1>
        <p className="text-muted-foreground">Your feedback is vital for ensuring the safety of every student.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Incident Report Form</CardTitle>
          <CardDescription>Please provide as much detail as possible.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <FormField
                control={form.control}
                name="routeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoading ? "Loading routes..." : "Select the route"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : (
                            availableRoutes.map(route => (
                            <SelectItem key={route.id} value={route.name}>{route.name}</SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The route on which the incident occurred.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="incidentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Incident</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2020-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the incident, including location, time, and any parties involved..."
                        className="resize-y min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This information will be kept confidential.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
