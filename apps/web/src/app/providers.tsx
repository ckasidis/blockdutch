"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { WagmiConfig } from "wagmi";

import { config } from "@/wagmi";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={config}>
      <NextUIProvider>{mounted && children}</NextUIProvider>
    </WagmiConfig>
  );
}
