"use client";

import "../../amplify";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Hosted UI will exchange the code automatically in the browser.
        // This call just confirms tokens exist now.
        await fetchAuthSession();
      } finally {
        router.replace("/");
      }
    })();
  }, [router]);

  return <div className="subtle">Signing you in…</div>;
}
