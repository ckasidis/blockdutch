"use client";

import { SignInWithMetamaskButton, useUser } from "@clerk/nextjs";

import { AppShell } from "@/components/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  if (!user) {
    return <SignInWithMetamaskButton />;
  }

  return <AppShell>{children}</AppShell>;
}
