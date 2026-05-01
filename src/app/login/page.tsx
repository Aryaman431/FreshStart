"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileUser, ArrowLeft } from 'lucide-react';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background geometric-pattern">
      <nav className="h-16 px-6 flex items-center justify-between border-b bg-white/50 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <FileUser className="h-4 w-4" />
          </div>
          <span className="font-black text-lg">FreshStart</span>
        </Link>
        <Button variant="ghost" size="sm" asChild className="font-bold text-muted-foreground">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
        </Button>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <SignIn
          routing="hash"
          afterSignInUrl="/builder"
          afterSignUpUrl="/builder"
          appearance={{
            elements: {
              card: "shadow-none bg-transparent",
              cardBox: "shadow-none",
            },
          }}
        />
      </div>
    </div>
  );
}
