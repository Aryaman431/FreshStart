
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUser, ArrowLeft, Loader2, Mail, ShieldCheck, Zap } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  // Redirect if already logged in and verified
  React.useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/builder');
    }
  }, [user, router]);

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, "demo@gmail.com", "password123");
      toast({
        title: "Demo Login Success",
        description: "Welcome to your high-fidelity workspace.",
      });
      router.push('/builder');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Demo Login Unavailable",
        description: "Please create a personal account to continue.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith('@gmail.com')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please use a @gmail.com address.",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          toast({
            title: "Check Your Email",
            description: "Please verify your email to unlock your account features.",
          });
        } else {
          router.push('/builder');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        toast({
          title: "Verification Sent!",
          description: "A link has been sent to your Gmail inbox.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: error.message || "Authentication failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background geometric-pattern">
      {/* Mini Nav */}
      <nav className="h-16 px-6 flex items-center justify-between border-b bg-white/50 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <FileUser className="h-4 w-4" />
          </div>
          <span className="font-black text-lg">FreshStart</span>
        </Link>
        <Button variant="ghost" size="sm" asChild className="font-bold text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Link>
        </Button>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[450px] perspective-2000">
          <div className="spatial-card p-10 bg-white shadow-2xl overflow-hidden relative border-none">
            
            {verificationSent ? (
              <div className="text-center space-y-8 py-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <ShieldCheck className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black uppercase tracking-tight">Verify Email</h2>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                    We've sent a link to <span className="text-primary font-bold">{email}</span>. Please verify to access the builder.
                  </p>
                </div>
                <Button 
                  className="w-full h-14 rounded-2xl font-bold bg-primary text-lg"
                  onClick={() => router.push('/')}
                >
                  Return to Home
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2 text-center">
                  <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">
                    {isLogin ? 'Sign In' : 'Join Us'}
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    {isLogin ? 'Continue architecting your future' : 'Start building your elite career narrative'}
                  </p>
                </div>

                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl font-bold border-primary/20 hover:bg-primary/5 text-primary text-lg"
                    onClick={handleQuickLogin}
                    disabled={isLoading}
                  >
                    <Zap className="h-5 w-5 mr-2 fill-primary" />
                    Quick Demo Login
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-100"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">OR</span>
                    </div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Gmail Address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="yourname@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12 rounded-xl border-slate-200 focus:ring-primary text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12 rounded-xl border-slate-200 focus:ring-primary text-lg"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-lg shadow-xl shadow-primary/20" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        isLogin ? 'Sign In Now' : 'Create & Verify'
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-base font-bold text-slate-500 hover:text-primary transition-all underline underline-offset-4"
                      >
                        {isLogin ? "New here? Create an elite account" : "Already have an account? Sign in"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <p className="text-center mt-8 text-sm font-bold text-muted-foreground">
            Trusted by 12,000+ top-tier graduates globally.
          </p>
        </div>
      </div>
    </div>
  );
}
