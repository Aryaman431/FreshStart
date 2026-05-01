import { SignIn } from '@clerk/nextjs';

export default function SignInCatchAllPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background geometric-pattern">
      <SignIn
        forceRedirectUrl="/builder"
        appearance={{
          elements: {
            card: 'shadow-none bg-transparent',
            cardBox: 'shadow-none',
          },
        }}
      />
    </div>
  );
}
