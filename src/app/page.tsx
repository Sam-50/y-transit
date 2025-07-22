
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bus, UserCog, User, ShieldCheck, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import Link from 'next/link';
import { signInWithEmailAndPassword, type AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserRole } from '@/services/users';

type Role = 'admin' | 'parent' | 'driver';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<Role>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;

      if (!userEmail) {
          throw new Error("User email not found.");
      }

      const userRole = await getUserRole(userEmail, role);
      
      if (userRole === role) {
          toast({
            title: "Login Successful",
            description: `Welcome! Redirecting to the ${role} dashboard.`,
          });
          router.push(`/dashboard/${role}`);
      } else {
           throw new Error("Role mismatch or access denied.");
      }

    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (authError.message === "Role mismatch or access denied.") {
          errorMessage = "You do not have permission to access this role's dashboard.";
      } else {
        switch (authError.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = "Invalid email or password. Please check your credentials and try again.";
                break;
            case 'auth/invalid-email':
                errorMessage = "The email address is not valid.";
                break;
            case 'auth/network-request-failed':
                errorMessage = "Could not connect to the authentication service. Please check your internet connection.";
                break;
             case 'auth/invalid-api-key':
                errorMessage = "Authentication failed: Invalid API Key. Please check your Firebase configuration.";
                break;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 left-4 z-10 hidden md:flex">
        <div className="flex items-center justify-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold font-headline">Yellow Transit</span>
        </div>
      </div>

      <Card className="w-full max-w-sm z-10">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 text-primary p-3 rounded-full w-fit mb-4">
                <Bus className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold font-headline">Yellow Transit Login</CardTitle>
            <CardDescription>Select your role to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label>I am a:</Label>
                <div className="grid grid-cols-3 gap-2">
                    <Button type="button" variant={role === 'parent' ? 'default' : 'outline'} onClick={() => handleRoleChange('parent')}>
                        <User className="mr-2 h-4 w-4" />Parent
                    </Button>
                    <Button type="button" variant={role === 'admin' ? 'default' : 'outline'} onClick={() => handleRoleChange('admin')}>
                        <UserCog className="mr-2 h-4 w-4" />Admin
                    </Button>
                    <Button type="button" variant={role === 'driver' ? 'default' : 'outline'} onClick={() => handleRoleChange('driver')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />Driver
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                    href="#"
                    className="text-sm font-medium text-primary hover:underline"
                >
                    Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                 <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(prev => !prev)}>
                    {showPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
             <p className="text-xs text-muted-foreground text-center w-full">
                © 2025 Yellow Transit. All rights reserved.
             </p>
        </CardFooter>
      </Card>
    </div>
  );
}
