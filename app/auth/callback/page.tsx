"use client";

import "../../amplify";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    // Never hang here: try to detect user, then go home.
    (async () => {
      try {
        await getCurrentUser();
        if (!cancelled) setMsg("Signed in! Redirecting…");
      } catch {
        if (!cancelled) setMsg("Finishing sign-in… Redirecting…");
      } finally {
        // Give Amplify a beat to finish writing tokens, then navigate.
        setTimeout(() => router.replace("/"), 250);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <div className="subtle">{msg}</div>;
}
