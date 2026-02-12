"use client";

import "../app/amplify";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  signInWithRedirect,
  signOut,
  fetchAuthSession,
} from "aws-amplify/auth";

export default function AuthStatus() {
  const [label, setLabel] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      for (let i = 0; i < 20; i++) {
        if (cancelled) return;

        try {
          const session = await fetchAuthSession();
          const user = await getCurrentUser();

          const payload = session.tokens?.idToken?.payload as any;

          const best =
            payload?.name ||
            payload?.email ||
            user?.signInDetails?.loginId ||
            user?.username;

          if (best) {
            setLabel(best);
            setLoading(false);
            return;
          }
        } catch {
          // keep retrying briefly
        }

        await new Promise((r) => setTimeout(r, 250));
      }

      // If we got here, we're not signed in (or storage blocked)
      setLabel("");
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <span className="subtle">Checking sign-in…</span>;
  }

  if (!label) {
    return (
      <button className="btn" onClick={() => signInWithRedirect({ provider: "Google" })}>
        Sign in with Google
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span className="subtle">Logged in as {label}</span>
      <button className="btn ghost" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}
