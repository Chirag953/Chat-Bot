import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useNhostClient } from "@nhost/react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const nhost = useNhostClient();
  const nav = useNavigate();
  const [status, setStatus] = useState("Verifying email...");

  useEffect(() => {
    const ticket = searchParams.get("ticket");

    if (!ticket) {
      setStatus("❌ Invalid verification link.");
      return;
    }

    async function verify() {
      try {
        const { error } = await nhost.auth.verifyEmail({ ticket });
        if (error) {
          setStatus("❌ Verification failed. Try again.");
        } else {
          setStatus("✅ Email verified! Redirecting to login...");
          setTimeout(() => nav("/auth"), 2000);
        }
      } catch (err) {
        console.error(err);
        setStatus("❌ Unexpected error verifying email.");
      }
    }

    verify();
  }, [nhost, searchParams, nav]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>{status}</h2>
    </div>
  );
}
