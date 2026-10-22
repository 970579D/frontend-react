"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/app/api";
import { AuthShell, Field } from "@/app/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  // const signedIn = useRedirectIfSignedIn("/");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    setBusy(true);
    try {
      await register(username.trim(), password);
      setDone(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  // if (signedIn) return null;

  return (
    <AuthShell
      eyebrow="CREATE ACCOUNT"
      title="ลงทะเบียน"
      intro="สร้างบัญชีใหม่ แล้วเริ่มท้าทายความรู้เรื่องจังหวัดของประเทศไทย"
      footer={
        <>
          มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
        </>
      }
    >
      <form className="authForm" onSubmit={handleSubmit}>
        <Field id="username" label="ชื่อผู้ใช้" value={username} onChange={setUsername} autoComplete="username" disabled={busy} />
        <Field id="password" label="รหัสผ่าน" type="password" value={password} onChange={setPassword} autoComplete="new-password" disabled={busy} />
        <Field id="confirm" label="ยืนยันรหัสผ่าน" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={busy} />
        {error && <p className="formError" role="alert">{error}</p>}
        {done && <p className="formOk" role="status">สร้างบัญชีสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ…</p>}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "กำลังสร้างบัญชี…" : "ลงทะเบียน"}
        </button>
      </form>
    </AuthShell>
  );
}
