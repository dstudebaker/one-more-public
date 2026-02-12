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
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        // Ensure session exists
        const session = await fetchAuthSession();
        await getCurrentUser();

        // Pull name/email from ID token
        const idToken = session.tokens?.idToken;
        const payload = idToken?.payload as any;

        const name =
          payload?.name ||
          payload?.email ||
          payload?.given_name ||
          "";

        setDisplayName(name);
      } catch {
        setDisplayName("");
      }
    })();
  }, []);

  if (!displayName) {
    return (
      <button
        className="btn"
        onClick={() => signInWithRedirect({ provider: "Google" })}
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span className="subtle">Logged in as {displayName}</span>
      <button className="btn ghost" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}
