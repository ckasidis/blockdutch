"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  useDisclosure,
} from "@nextui-org/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import { ConnectWalletModal } from "./connect-wallet-modal";
import { DarkLogo } from "./logo";

import { mainNavigation } from "@/lib/navigation/config";
import { getBasePath } from "@/lib/utils/base-path";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const path = usePathname();
  const basePath = getBasePath(path);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <>
      <Navbar onMenuOpenChange={setIsMenuOpen} isBordered>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <DarkLogo className="h-[24px] w-[120px]" />
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent className="hidden gap-4 sm:flex" justify="center">
          {mainNavigation.map((item, index) => (
            <NavbarItem key={item.href}>
              <Link
                as={NextLink}
                color={
                  basePath === item.href
                    ? "primary"
                    : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
                }
                className="w-full"
                href={item.href}
                size="sm"
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <ConnectWalletModal
              isOpen={isOpen}
              onOpen={onOpen}
              onOpenChange={onOpenChange}
            />
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          {mainNavigation.map((item, index) => (
            <NavbarMenuItem key={item.href}>
              <Link
                as={NextLink}
                color={
                  basePath === item.href
                    ? "primary"
                    : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
                }
                className="w-full"
                href={item.href}
                size="lg"
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
      <main className="mx-auto max-w-[1024px] px-6 py-10">{children}</main>
    </>
  );
}
