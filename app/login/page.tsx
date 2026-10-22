"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, Field } from "@/app/AuthShell";
import { login } from "@/app/api";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const record = await login(username.trim(), password);
      localStorage.setItem("login", JSON.stringify({
        username: record.username,
        session: record.session,
        loginDate: record.login_date,
      }));
      router.replace("/");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="เข้าสู่ระบบ"
      intro="เข้าสู่ระบบเพื่อกลับไปเล่นเกมสำรวจแผนที่ประเทศไทยต่อ"
      footer={
        <>
          ยังไม่มีบัญชี? <Link href="/register">ลงทะเบียน</Link>
        </>
      }
    >
      <form className="authForm" onSubmit={handleSubmit}>
        <Field id="username" label="ชื่อผู้ใช้" value={username} onChange={setUsername} autoComplete="username" disabled={busy} />
        <Field id="password" label="รหัสผ่าน" type="password" value={password} onChange={setPassword} autoComplete="current-password" disabled={busy} />
        {error && <p className="formError" role="alert">{error}</p>}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
      </form>
    </AuthShell>
  );

}
