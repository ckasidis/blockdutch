"use client";

import { Card, CardBody } from "@nextui-org/react";
import { useAccount } from "wagmi";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();

  if (!address) {
    return (
      <AppShell>
        <div className="space-y-5">
          <PageHeading>Wallet Disconnected</PageHeading>
          <Card className="bg-danger-300">
            <CardBody>Please connect your wallet before continuing</CardBody>
          </Card>
        </div>
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
