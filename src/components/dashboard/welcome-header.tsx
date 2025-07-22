
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Sun, Bot, User, ShieldCheck } from "lucide-react";

type WelcomeHeaderProps = {
    user: 'Admin' | 'Driver' | 'Parent';
    name: string;
};

const userConfig = {
    Admin: {
        icon: Bot,
        greeting: "Here's an overview of all school transit operations."
    },
    Driver: {
        icon: User,
        greeting: "Have a safe and great day on your route!"
    },
    Parent: {
        icon: ShieldCheck,
        greeting: "Track your children's journey and stay updated."
    }
}

export function WelcomeHeader({ user, name }: WelcomeHeaderProps) {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentTime(format(now, 'h:mm:ss a'));
            setCurrentDate(format(now, 'EEEE, MMMM do'));
        };

        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    const config = userConfig[user];
    const GreetingIcon = config.icon;

    return (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="flex items-center gap-4">
                    <Calendar className="h-10 w-10 text-primary flex-shrink-0"/>
                    <div>
                        <p className="text-2xl font-bold">{currentDate}</p>
                        <p className="text-slate-300">Welcome back, {name}!</p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0 self-center sm:self-auto">
                    <p className="text-5xl font-bold font-mono tracking-tight text-primary">{currentTime}</p>
                    <div className="flex items-center justify-end gap-2 text-slate-300">
                        <GreetingIcon className="h-5 w-5 text-yellow-400"/>
                        <span>{config.greeting}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
