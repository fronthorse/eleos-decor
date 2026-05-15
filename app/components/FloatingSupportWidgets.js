"use client";

import { usePathname } from "next/navigation";
import AIDecorAssistant from "./AIDecorAssistant";
import WhatsAppFloat from "./WhatsAppFloat";

const PUBLIC_FLOAT_ROUTES = ["/", "/shop", "/about", "/contact"];
const PUBLIC_FLOAT_PREFIXES = ["/product/"];

function shouldShowFloatingSupport(pathname) {
  if (!pathname) {
    return false;
  }

  return (
    PUBLIC_FLOAT_ROUTES.includes(pathname) ||
    PUBLIC_FLOAT_PREFIXES.some((route) => pathname.startsWith(route))
  );
}

export default function FloatingSupportWidgets() {
  const pathname = usePathname();

  if (!shouldShowFloatingSupport(pathname)) {
    return null;
  }

  return (
    <>
      <AIDecorAssistant />
      <WhatsAppFloat />
    </>
  );
}
