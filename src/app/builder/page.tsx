
"use client";

import React from 'react';
import { ResumeProvider, useResume } from '@/app/lib/resume-store';
import { VersionProvider } from '@/app/lib/version-store';
import { Editor, EditorHandle } from '@/components/resume/editor/Editor';
import { Preview } from '@/components/resume/preview/Preview';
import { Button } from '@/components/ui/button';
import { FileUser, ArrowLeft, UserCircle, Loader2, Upload, RefreshCcw, ListChecks } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { signInAsGuest } from '@/lib/use-supabase-auth';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';

function BuilderContent() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const { isLoading: isDataLoading, resetData } = useResume();
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const editorRef = React.useRef<EditorHandle>(null);

  React.useEffect(() => { setMounted(true); }, []);

  const handleQuickStart = () => signInAsGuest();

  return (
    <div className="flex flex-col h-screen bg-background print:h-auto print:overflow-visible geometric-pattern">
      {/* Navigation Bar */}
      <nav className="border-b bg-violet-700 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0 print:hidden shadow-lg h-16">
        {/* LEFT: logo + title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <FileUser className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tight text-white">FreshStart</h1>
              <p className="text-[10px] uppercase font-bold text-white/70 tracking-widest -mt-1">Studio</p>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-white/20" />

          {/* Title + subtitle */}
          <div className="hidden md:flex flex-col leading-tight select-none">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              Build Your Resume
            </span>
            <span className="text-[10px] text-white/60 font-medium">Guide for Freshers &amp; Students</span>
          </div>

          {/* Import PDF + Reset — inline with title */}
          <div className="flex items-center gap-1 ml-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => editorRef.current?.triggerImport()}
              disabled={uploading}
              title="Import existing resume PDF"
              className="gap-1.5 text-xs font-semibold bg-white text-slate-800 border-white hover:bg-purple-100 hover:text-purple-800 hover:border-purple-200 h-8"
            >
              {uploading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Importing…</>
                : <><Upload className="h-3.5 w-3.5" />Import Resume</>
              }
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => resetData()}
              title="Clear all data"
              className="text-white hover:text-red-400 hover:bg-white/10 h-8 w-8"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* RIGHT: back + auth */}
        <div className="flex items-center space-x-3">
          <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all rounded-full px-4 h-8 text-xs">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </Button>

          {!isLoaded || isDataLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : isSignedIn ? (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex flex-col items-end text-white/80 font-medium">
                <span className="text-[9px] uppercase tracking-wider">Logged in as</span>
                <span className="text-[10px] font-bold text-white">{clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.username ?? 'User'}</span>
              </div>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="font-bold bg-white text-purple-700 border border-purple-400 hover:bg-purple-50 hover:text-purple-800 rounded-full px-4 h-8 text-xs">
                  Sign In
                </Button>
              </SignInButton>
              <Button variant="default" size="sm" onClick={handleQuickStart}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-8 shadow-lg shadow-primary/20 border border-white/20 rounded-full px-4 text-xs">
                <UserCircle className="h-3.5 w-3.5 mr-1.5" />
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
                <Editor ref={editorRef} onUploadingChange={setUploading} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-slate-200 hover:bg-purple-400/40 transition-colors w-1.5 group relative">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 rounded-full bg-purple-300/70 group-hover:bg-purple-500 transition-colors" />
            </ResizableHandle>

            {/* Preview Panel */}
            <ResizablePanel defaultSize={isMobile ? 0 : 62} minSize={isMobile ? 0 : 30} maxSize={isMobile ? 100 : 75}>
              <Preview />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[400px_1fr] h-full print:hidden">
            <div className="border-r flex flex-col bg-slate-50/50">
              <Editor ref={editorRef} onUploadingChange={setUploading} />
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
