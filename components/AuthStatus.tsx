"use client";

import "../app/amplify";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  signInWithRedirect,
  signOut,
  fetchUserAttributes,
} from "aws-amplify/auth";

type Status =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "signedIn"; label: string };

export default function AuthStatus() {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  async function load() {
    try {
      const user = await getCurrentUser(); // fast + definitive
      let label = user.signInDetails?.loginId || user.username;

      try {
        const attrs = await fetchUserAttributes();
        label =
          attrs.name ||
          `${attrs.given_name || ""} ${attrs.family_name || ""}`.trim() ||
          attrs.email ||
          label;
      } catch {
        // ignore attribute fetch failures
      }

      setStatus({ kind: "signedIn", label });
    } catch {
      setStatus({ kind: "signedOut" });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onSignIn = async () => {
    // Prevent UserAlreadyAuthenticatedException
    try {
      await getCurrentUser();
      await load();
      return;
    } catch {
      // not signed in -> proceed
    }
    await signInWithRedirect({ provider: "Google" });
  };

  const onSignOut = async () => {
    await signOut();
    setStatus({ kind: "signedOut" });
  };

  if (status.kind === "loading") {
    return <span className="subtle">Checking sign-in…</span>;
  }

  if (status.kind === "signedOut") {
    return (
      <button className="btn" onClick={onSignIn}>
        Sign in with Google
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span className="subtle">Logged in as {status.label}</span>
      <button className="btn ghost" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}
