"use client";

import { Suspense, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import NotificationBar from "@/components/landing/NotificationBar";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import ReferralTracker from "@/components/ReferralTracker";

type Props = {
  notificationContent: any;
};

const HIDE_MARKETING_BAR_PREFIXES = [
  "/",
  "/book",
  "/offers",
  "/aftercare",
  "/contact",
  "/admin",
  "/portal",
  "/dashboard",
  "/account",
  "/parent",
  "/messages",
  "/onboarding",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/checkout",
];

export default function GlobalClientFeatures({ notificationContent }: Props) {
  const pathname = usePathname() || "";

  const showNotificationBar = useMemo(
    () => !HIDE_MARKETING_BAR_PREFIXES.some((prefix) => pathname.startsWith(prefix)),
    [pathname]
  );

  return (
    <>
      {showNotificationBar && <NotificationBar content={notificationContent} />}
      <AnalyticsLoader />
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
      <CookieConsentBanner />
      <Toaster position="top-right" />
    </>
  );
}
