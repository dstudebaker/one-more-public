"use client";

import "../../amplify";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const [info, setInfo] = useState<string>("Signing you in…");

  useEffect(() => {
    // Show a tiny bit of debug info on-screen (safe)
    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has("code");
    const hasError = url.searchParams.has("error");

    setInfo(
      hasError
        ? `Sign-in error: ${url.searchParams.get("error") || "unknown"}`
        : hasCode
        ? "Received code. Finishing sign-in…"
        : "Finishing sign-in…"
    );

    // IMPORTANT: strip query params so we don't re-process code on refresh
    window.history.replaceState({}, document.title, "/auth/callback");

    // Hard redirect (not Next router) so we never get “stuck” here
    const t = setTimeout(() => {
      window.location.replace("/");
    }, 600);

    return () => clearTimeout(t);
  }, []);

  return <div className="subtle">{info}</div>;
}
