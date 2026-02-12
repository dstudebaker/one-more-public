"use client";

import "../../amplify";
import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

export default function AuthCallback() {
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 🔥 This is what actually exchanges ?code= for tokens
        await fetchAuthSession();

        if (cancelled) return;

        // Clean up query params
        window.history.replaceState({}, document.title, "/auth/callback");

        setMsg("Signed in! Redirecting…");

        // Redirect home
        setTimeout(() => {
          window.location.replace("/");
        }, 300);
      } catch (err) {
        console.error("Auth error:", err);
        setMsg("Sign-in failed. Try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <div className="subtle">{msg}</div>;
}
