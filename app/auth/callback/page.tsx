"use client";

import "../../amplify";
import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

export default function AuthCallback() {
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // If Cognito returned an error, show it
      const url = new URL(window.location.href);
      const err = url.searchParams.get("error");
      const errDesc = url.searchParams.get("error_description");
      if (err) {
        setMsg(`Sign-in error: ${err}${errDesc ? ` — ${errDesc}` : ""}`);
        return;
      }

      // Give Amplify time to exchange code->tokens and persist them
      for (let i = 0; i < 40; i++) {
        if (cancelled) return;
        try {
          await getCurrentUser();

          // Now that tokens exist, strip the querystring so refresh doesn't reprocess code
          window.history.replaceState({}, document.title, "/auth/callback");

          // Hard redirect home
          window.location.replace("/");
          return;
        } catch {
          setMsg(`Signing you in… (${i + 1}/40)`);
          await new Promise((r) => setTimeout(r, 250));
        }
      }

      setMsg("Sign-in didn’t complete. Go back and try again.");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <div className="subtle">{msg}</div>;
}
