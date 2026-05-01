import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SupabaseAuthProvider } from '@/lib/use-supabase-auth';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'FreshStart | AI Resume Builder for Students',
  description: 'Craft a professional resume in minutes with AI-assisted guidance for freshers and final-year students.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInForceRedirectUrl="/builder" signUpForceRedirectUrl="/builder">
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Latin Modern Roman — closest web-available match to LaTeX's default font */}
        <style>{`
          @font-face {
            font-family: 'Latin Modern Roman';
            src: url('https://cdn.jsdelivr.net/gh/dreampulse/computer-modern-web-font@master/font/Latin-Modern-Roman/lmroman10-regular.woff') format('woff');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Latin Modern Roman';
            src: url('https://cdn.jsdelivr.net/gh/dreampulse/computer-modern-web-font@master/font/Latin-Modern-Roman/lmroman10-bold.woff') format('woff');
            font-weight: 700;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Latin Modern Roman';
            src: url('https://cdn.jsdelivr.net/gh/dreampulse/computer-modern-web-font@master/font/Latin-Modern-Roman/lmroman10-italic.woff') format('woff');
            font-weight: 400;
            font-style: italic;
            font-display: swap;
          }
        `}</style>
      </head>
      <body className="font-body antialiased selection:bg-accent/30">
        <SupabaseAuthProvider>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
