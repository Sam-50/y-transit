
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, Users, Save } from "lucide-react";

const settingsSchema = z.object({
  schoolName: z.string().min(1, "School name is required."),
  adminEmail: z.string().email("Please enter a valid email."),
  autoAlerts: z.boolean().default(false),
  parentNotifications: z.boolean().default(true),
});

export default function SettingsPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      schoolName: "Springfield Elementary",
      adminEmail: "admin@yellowtransit.com",
      autoAlerts: true,
      parentNotifications: true,
    },
  });

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    console.log(values);
    toast({
      title: "Settings Saved",
      description: "Your system settings have been updated successfully.",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">System Settings</h1>
        <p className="text-muted-foreground">Configure global settings for the Yellow Transit platform.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic information about your institution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your School's Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Admin Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@school.com" {...field} />
                    </FormControl>
                    <FormDescription>This email receives critical system alerts.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification & Alert Settings</CardTitle>
              <CardDescription>Manage automated communications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="autoAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2"><Shield /> Automated Safety Alerts</FormLabel>
                      <FormDescription>Automatically flag high-severity incidents for review.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2"><Users /> Parent Delay Notifications</FormLabel>
                      <FormDescription>Notify parents automatically if a bus is delayed by more than 10 minutes.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save All Settings
          </Button>
        </form>
      </Form>
    </div>
  );
}
