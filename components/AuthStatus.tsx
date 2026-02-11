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

  async function refresh() {
    try {
      await fetchAuthSession();
      const user = await getCurrentUser();
      setLabel(user?.signInDetails?.loginId || user.username || "Signed in");
    } catch {
      setLabel("");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

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
