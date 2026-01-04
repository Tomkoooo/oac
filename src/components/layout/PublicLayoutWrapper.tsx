"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "./foter";

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRequest = pathname?.startsWith("/admin");

  if (isAdminRequest) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <main className="pt-16">
        {children}
      </main>
      <Footer/>
    </>
  );
}
