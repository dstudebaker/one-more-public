"use client";

import "../app/amplify";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  signInWithRedirect,
  signOut,
  fetchAuthSession,
  fetchUserAttributes,
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
          await fetchAuthSession();
          const user = await getCurrentUser();

          // Pull attributes from Cognito (reliable even when token lacks name/email)
          const attrs = await fetchUserAttributes();

          const best =
            attrs.name ||
            `${attrs.given_name || ""} ${attrs.family_name || ""}`.trim() ||
            attrs.email ||
            user?.signInDetails?.loginId ||
            user?.username;

          if (best) {
            setLabel(best);
            setLoading(false);
            return;
          }
        } catch {
          // retry briefly
        }

        await new Promise((r) => setTimeout(r, 250));
      }

      setLabel("");
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <span className="subtle">Checking sign-in…</span>;

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
