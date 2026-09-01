"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ChatWidget";

export function PublicChatWidget() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return <ChatWidget />;
}
