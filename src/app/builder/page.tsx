
"use client";

import React from 'react';
import { ResumeProvider, useResume } from '@/app/lib/resume-store';
import { VersionProvider } from '@/app/lib/version-store';
import { Editor } from '@/components/resume/editor/Editor';
import { Preview } from '@/components/resume/preview/Preview';
import { Button } from '@/components/ui/button';
import { FileUser, ArrowLeft, UserCircle, Loader2 } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { signInAsGuest } from '@/lib/use-supabase-auth';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';

function BuilderContent() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);
  const { isLoading: isDataLoading } = useResume();
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();

  React.useEffect(() => { setMounted(true); }, []);

  const handleQuickStart = () => signInAsGuest();

  return (
    <div className="flex flex-col h-screen bg-background print:h-auto print:overflow-visible geometric-pattern">
      {/* Navigation Bar */}
      <nav className="h-16 border-b bg-slate-400/95 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0 print:hidden geometric-pattern shadow-lg">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <FileUser className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">FreshStart</h1>
              <p className="text-[10px] uppercase font-bold text-white/70 tracking-widest -mt-1">Studio</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all rounded-full px-6 h-9">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="inline">Back to Home</span>
            </Link>
          </Button>
          
          {!isLoaded || isDataLoading ? (
            <div className="flex items-center px-4">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          ) : isSignedIn ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center text-purple-700 font-bold px-3 py-1 rounded">
                <span className="text-[10px] uppercase tracking-wider">Logged In as</span>
                <span className="text-xs">{clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.username ?? 'User'}</span>
              </div>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="font-bold border-white/40 text-white hover:bg-white/10 hover:text-white rounded-full px-5 h-9">
                  Sign In
                </Button>
              </SignInButton>
              <Button
                variant="default"
                size="sm"
                onClick={handleQuickStart}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-9 shadow-lg shadow-primary/20 border border-white/20 rounded-full px-5"
              >
                <UserCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Quick Start</span>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex relative overflow-hidden print:block print:static print:h-auto print:overflow-visible">
        {mounted ? (
          <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="h-full w-full print:hidden">
            {/* Editor Panel */}
            <ResizablePanel defaultSize={isMobile ? 100 : 38} minSize={isMobile ? 0 : 25} maxSize={isMobile ? 100 : 60}>
              <div className="h-full border-r flex flex-col bg-slate-50/50">
                <Editor />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-slate-400 w-1.5" />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={isMobile ? 0 : 62} minSize={isMobile ? 0 : 30} maxSize={isMobile ? 100 : 75}>
              <Preview />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[400px_1fr] h-full print:hidden">
            <div className="border-r flex flex-col bg-slate-50/50">
              <Editor />
            </div>
            <Preview />
          </div>
        )}
      </main>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ResumeProvider>
      <VersionProvider>
        <BuilderContent />
      </VersionProvider>
    </ResumeProvider>
  );
}
