
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bus, User, ShieldCheck, AreaChart, LogOut, LayoutDashboard, Route, Users, ShieldAlert, Settings, ListChecks, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { getUserDetails } from '@/services/users';

const AdminNav = () => {
  const pathname = usePathname();
  return (
  <>
    <SidebarMenuItem>
      <Link href="/dashboard/admin">
        <SidebarMenuButton tooltip="Dashboard" isActive={pathname === '/dashboard/admin'}>
          <LayoutDashboard />
          <span>Dashboard</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/admin/routes">
        <SidebarMenuButton tooltip="Route Management" isActive={pathname === '/dashboard/admin/routes'}>
          <Route />
          <span>Routes</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/admin/drivers">
        <SidebarMenuButton tooltip="Driver Management" isActive={pathname === '/dashboard/admin/drivers'}>
          <User />
          <span>Drivers</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <Link href="/dashboard/admin/students">
        <SidebarMenuButton tooltip="Student Management" isActive={pathname === '/dashboard/admin/students'}>
          <Users />
          <span>Students</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/admin/parents">
        <SidebarMenuButton tooltip="Parent Management" isActive={pathname === '/dashboard/admin/parents'}>
          <Users />
          <span>Parents</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/admin/safety-reports">
        <SidebarMenuButton tooltip="Safety Reports" isActive={pathname === '/dashboard/admin/safety-reports'}>
          <ShieldAlert />
          <span>Safety Reports</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/admin/analytics">
        <SidebarMenuButton tooltip="Analytics" isActive={pathname === '/dashboard/admin/analytics'}>
          <AreaChart />
          <span>Analytics</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <Link href="/dashboard/admin/settings">
        <SidebarMenuButton tooltip="Settings" isActive={pathname === '/dashboard/admin/settings'}>
          <Settings />
          <span>Settings</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  </>
)};

const DriverNav = () => {
  const pathname = usePathname();
  return (
  <>
    <SidebarMenuItem>
      <Link href="/dashboard/driver">
        <SidebarMenuButton tooltip="Dashboard" isActive={pathname === '/dashboard/driver'}>
          <LayoutDashboard />
          <span>Dashboard</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <Link href="/dashboard/driver/profile">
        <SidebarMenuButton tooltip="Profile" isActive={pathname === '/dashboard/driver/profile'}>
          <User />
          <span>Profile</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/driver/attendance">
        <SidebarMenuButton tooltip="Attendance" isActive={pathname === '/dashboard/driver/attendance'}>
          <ListChecks />
          <span>Attendance</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/driver/my-route">
        <SidebarMenuButton tooltip="My Route" isActive={pathname === '/dashboard/driver/my-route'}>
          <Route />
          <span>My Route</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <Link href="/dashboard/driver/my-students">
        <SidebarMenuButton tooltip="My Students" isActive={pathname === '/dashboard/driver/my-students'}>
          <Users />
          <span>My Students</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <Link href="/dashboard/driver/trip-reports">
        <SidebarMenuButton tooltip="Trip Reports" isActive={pathname === '/dashboard/driver/trip-reports'}>
          <FileText />
          <span>Trip Reports</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <Link href="/dashboard/report-safety">
        <SidebarMenuButton tooltip="Report Incident" isActive={pathname === '/dashboard/report-safety'}>
          <ShieldAlert />
          <span>Report Incident</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  </>
)};

const ParentNav = () => {
  const pathname = usePathname();
  return (
  <>
    <SidebarMenuItem>
      <Link href="/dashboard/parent">
        <SidebarMenuButton tooltip="Dashboard" isActive={pathname === '/dashboard/parent'}>
          <LayoutDashboard />
          <span>Dashboard</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/parent/children">
        <SidebarMenuButton tooltip="Child Management" isActive={pathname === '/dashboard/parent/children'}>
          <Users />
          <span>Child Management</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/parent/attendance">
        <SidebarMenuButton tooltip="Attendance" isActive={pathname === '/dashboard/parent/attendance'}>
          <ListChecks />
          <span>Attendance</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <Link href="/dashboard/parent/profile">
        <SidebarMenuButton tooltip="Profile" isActive={pathname === '/dashboard/parent/profile'}>
          <User />
          <span>Profile</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <Link href="/dashboard/report-safety">
        <SidebarMenuButton tooltip="Report a Concern" isActive={pathname === '/dashboard/report-safety'}>
          <ShieldCheck />
          <span>Report a Concern</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  </>
)};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState<'admin' | 'driver' | 'parent' | 'unknown'>('unknown');
  const [avatarFallback, setAvatarFallback] = useState('U');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        const details = await getUserDetails(currentUser.email);
        setUserName(details.name);

        const fallback = details.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        setAvatarFallback(fallback);
        
        if (pathname.startsWith('/dashboard/admin')) setUserRole('admin');
        else if (pathname.startsWith('/dashboard/driver')) setUserRole('driver');
        else if (pathname.startsWith('/dashboard/parent')) setUserRole('parent');

      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
          title: "Logged Out",
          description: "You have been successfully logged out."
      })
      router.push('/');
    } catch (error) {
       toast({
          variant: 'destructive',
          title: "Logout Failed",
          description: "An error occurred during logout. Please try again."
      })
    }
  }
  
  const getRoleNav = () => {
    if (userRole === 'admin') return <AdminNav />;
    if (userRole === 'driver') return <DriverNav />;
    if (userRole === 'parent') return <ParentNav />;
    // Special case for shared reporting page, defaulting to a relevant role's nav
    if (pathname.startsWith('/dashboard/report-safety') && (userRole === 'driver' || userRole === 'parent')) {
      return userRole === 'driver' ? <DriverNav /> : <ParentNav />;
    }
    return null;
  }

  const welcomeProps = {
      user: userRole !== 'unknown' ? (userRole.charAt(0).toUpperCase() + userRole.slice(1)) as 'Admin' | 'Driver' | 'Parent' : 'Admin',
      name: userName
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Bus className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold font-headline text-sidebar-foreground">Yellow Transit</h2>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {getRoleNav()}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <Separator className="my-2" />
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Log Out" onClick={handleLogout}>
                    <LogOut />
                    <span>Log Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b">
             <SidebarTrigger />
             <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden sm:inline">{userName}</span>
                 <Avatar>
                    <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} data-ai-hint="person avatar" />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
             </div>
          </header>
          <main className="p-4 sm:p-6 lg:p-8 bg-muted/40 flex-1">
            {React.Children.map(children, child =>
              React.isValidElement(child) ? React.cloneElement(child, { welcomeProps } as any) : child
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
