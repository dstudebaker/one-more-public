"use client";

import "../../amplify";
import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

function withTimeout<T>(p: Promise<T>, ms: number) {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export default function AuthCallback() {
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    (async () => {
      try {
        setMsg("Exchanging code for tokens…");

        // This is the code->tokens exchange. If it can't finish, we need the reason.
        await withTimeout(fetchAuthSession(), 10000);

        // Strip query params so refresh doesn't reprocess the code
        window.history.replaceState({}, document.title, "/auth/callback");

        setMsg("Signed in! Redirecting…");
        setTimeout(() => window.location.replace("/"), 300);
      } catch (e: any) {
        console.error("Auth callback error:", e);
        const text =
          e?.name || e?.message
            ? `${e?.name || "Error"}: ${e?.message || ""}`
            : String(e);

        setMsg(`Sign-in failed: ${text}`);
      }
    })();
  }, []);

  return <div className="subtle">{msg}</div>;
}
