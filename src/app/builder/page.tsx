
"use client";

import React from 'react';
import { ResumeProvider, useResume } from '@/app/lib/resume-store';
import { Editor } from '@/components/resume/editor/Editor';
import { Preview } from '@/components/resume/preview/Preview';
import { ResumeContent } from '@/components/resume/preview/ResumeContent';
import { Button } from '@/components/ui/button';
import { FileUser, LogOut, ArrowLeft, UserCircle, Loader2, MailWarning } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useToast } from '@/hooks/use-toast';

function BuilderContent() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);
  const { data, isLoading: isDataLoading } = useResume();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleQuickStart = () => {
    initiateAnonymousSignIn(auth);
  };

  const handleResendVerification = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        toast({
          title: "Verification Sent",
          description: "Check your Gmail inbox for the new link.",
        });
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: "Limit Reached",
          description: "Please wait a moment before requesting another link.",
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background print:h-auto print:overflow-visible geometric-pattern">
      {/* Verification Warning Strip */}
      {user && !user.isAnonymous && !user.emailVerified && (
        <div className="bg-amber-100 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs font-bold text-amber-800 shrink-0">
          <div className="flex items-center">
            <MailWarning className="h-4 w-4 mr-2" />
            <span>Your email is not verified. Some features may be limited.</span>
          </div>
          <button 
            onClick={handleResendVerification}
            className="underline hover:text-amber-900 transition-colors"
          >
            Resend Verification Link
          </button>
        </div>
      )}

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
          <Button variant="ghost" size="sm" asChild className="text-white hover:text-white/80 font-bold h-9">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </Button>
          
          {isUserLoading || isDataLoading ? (
            <div className="flex items-center px-4">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          ) : user ? (
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-100 uppercase tracking-wider">Logged In as</span>
                <span className="text-xs font-black text-white">{user.isAnonymous ? 'Guest' : user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-foreground border-white/40 hover:border-white hover:text-primary font-bold h-9 bg-white/20 text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <AuthDialog />
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleQuickStart}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-9 shadow-lg shadow-primary/20 border border-white/20"
              >
                <UserCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Quick Start</span>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative print:block print:static print:h-auto print:overflow-visible">
        {mounted ? (
          <ResizablePanelGroup 
            direction={isMobile ? "vertical" : "horizontal"} 
            className="h-full w-full print:hidden"
          >
            {/* Editor Panel */}
            <ResizablePanel 
              defaultSize={isMobile ? 100 : 35} 
              minSize={isMobile ? 0 : 25} 
              maxSize={isMobile ? 100 : 70}
            >
              <div className="h-full border-r overflow-hidden flex flex-col bg-slate-50/50">
                <Editor />
              </div>
            </ResizablePanel>

            {/* Slider Handle */}
            <ResizableHandle withHandle className="bg-slate-400 w-1.5" />

            {/* Preview Panel */}
            <ResizablePanel 
              defaultSize={isMobile ? 0 : 65} 
              minSize={isMobile ? 0 : 30}
              maxSize={isMobile ? 100 : 75}
            >
              <div className="overflow-hidden h-full bg-slate-200/30">
                <Preview />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[400px_1fr] h-full overflow-hidden print:hidden">
            <div className="border-r overflow-hidden flex flex-col bg-slate-50/50">
              <Editor />
            </div>
            <div className="overflow-hidden h-full bg-slate-200/30">
              <Preview />
            </div>
          </div>
        )}

        {/* HIGH FIDELITY PRINT ENGINE: isolated container for surgical print accuracy */}
        <div className="hidden print:block print:static print:w-full print:h-auto print-container">
          <ResumeContent data={data} isPrint={true} />
        </div>
      </main>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ResumeProvider>
      <BuilderContent />
    </ResumeProvider>
  );
}
