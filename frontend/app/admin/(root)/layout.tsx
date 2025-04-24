import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { APP_DESC, APP_NAME } from "@/lib/constants";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESC,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
