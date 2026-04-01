
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Mail, ShieldCheck, Zap } from 'lucide-react';

interface AuthDialogProps {
  trigger?: React.ReactNode;
}

export function AuthDialog({ trigger }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  
  const auth = useAuth();
  const { toast } = useToast();

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      // Demo credentials for quick testing
      await signInWithEmailAndPassword(auth, "demo@gmail.com", "password123");
      toast({
        title: "Quick Login Success",
        description: "Welcome back to your elite workspace.",
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Demo Login Failed",
        description: "Please try standard login or sign up.",
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

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          toast({
            title: "Email Not Verified",
            description: "Please check your inbox to verify your account.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          setIsOpen(false);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        toast({
          title: "Verification Email Sent!",
          description: "Please check your inbox to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="font-bold border-slate-500 hover:text-primary">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
        {verificationSent ? (
          <div className="p-12 text-center space-y-6 bg-white">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Check Your Email</h3>
              <p className="text-muted-foreground font-medium">
                We've sent a verification link to <strong>{email}</strong>. Please verify your email to continue.
              </p>
            </div>
            <Button 
              className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90" 
              onClick={() => setIsOpen(false)}
            >
              Got it
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-primary p-8 text-white text-center space-y-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </DialogTitle>
              <DialogDescription className="text-white/70 font-medium">
                {isLogin 
                  ? 'Access your saved resume drafts and continue building.' 
                  : 'Join 12k+ graduates architecting their futures today.'}
              </DialogDescription>
            </div>
            
            <div className="p-8 space-y-6 bg-white">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl font-bold border-primary/20 hover:bg-primary/5 text-primary"
                onClick={handleQuickLogin}
                disabled={isLoading}
              >
                <Zap className="h-4 w-4 mr-2 fill-primary" />
                Quick Demo Login
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">or use email</span>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Gmail Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border-slate-200 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl border-slate-200 focus:ring-primary"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    isLogin ? 'Sign In' : 'Create & Verify Account'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
