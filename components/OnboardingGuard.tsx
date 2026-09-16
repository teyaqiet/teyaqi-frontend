"use client";

import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { status, loading } = useDailyChallenge();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If finished loading and user hasn't onboarded, 
    // and they aren't already on the onboarding page...
    if (!loading && status && !status.has_onboarded && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [status, loading, pathname, router]);

  if (loading) return <div>Loading your journey...</div>;

  return <>{children}</>;
}