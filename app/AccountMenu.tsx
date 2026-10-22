"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { clearSession, useSession } from "@/lib/session";

export default function AccountMenu() {
  const router = useRouter();
  const { session, ready } = useSession();
  const [busy, setBusy] = useState(false);

  if (!ready) return null;

  if (!session) {
    return (
      <>
        <Link className="badge" href="/login">เข้าสู่ระบบ</Link>
        <Link className="badge" href="/register">ลงทะเบียน</Link>
      </>
    );
  }

  async function handleLogout() {
    if (!session) return;
    setBusy(true);
    try {
      await logout(session.session);
    } catch {
      // Even if the server says the session is gone, sign out locally
    }
    clearSession();
    setBusy(false);
    router.push("/login");
  }

  return (
    <>
      <span className="badge">{session.username}</span>
      <button className="badge" onClick={handleLogout} disabled={busy}>
        {busy ? "กำลังออก…" : "ออกจากระบบ"}
      </button>
    </>
  );
}
