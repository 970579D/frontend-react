import Link from "next/link";
import type { ChangeEvent, ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <>
      <style>{CSS}</style>
      <main className="authWrap">
        <header className="authHeader">
          <Link href="/" className="brand">
            THAILAND <span>MAP QUEST</span>
          </Link>
        </header>
        <section className="panel authPanel">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="muted">{intro}</p>
          {children}
          <p className="authFooter muted">{footer}</p>
        </section>
      </main>
    </>
  );
}

export function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password";
  autoComplete: string;
  disabled?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required
        disabled={disabled}
        autoComplete={autoComplete}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  );
}

const CSS = `
:root{
  --bg:#090f1e;--panel:#141e33;--line:#2d3b56;
  --text:#eef3ff;--muted:#afbed8;--purple:#8270ff;
  --mint:#54e0bd;--red:#ffa2af
}
*{box-sizing:border-box}
body{
  margin:0;color:var(--text);
  background:radial-gradient(ellipse at top left,#252047,transparent 55%),var(--bg);
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
  line-height:1.6;min-height:100vh
}
button,input{font:inherit}
button{
  border:0;border-radius:12px;padding:11px 17px;
  background:#2c3b59;color:var(--text);font-weight:750;cursor:pointer
}
button:hover:not(:disabled){filter:brightness(1.15)}
button:disabled{opacity:.45;cursor:not-allowed}
button:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid var(--mint);outline-offset:3px}
.primary{background:var(--purple);color:white}
h1,p{margin-top:0}
h1{font-size:clamp(28px,5vw,40px);line-height:1.25}
.muted{color:var(--muted)}
a{color:#b9afff}
.authWrap{max-width:480px;margin:auto;padding:22px 16px 40px}
.authHeader{margin-bottom:22px}
.brand{font-size:20px;font-weight:900;letter-spacing:-.7px;color:var(--text);text-decoration:none}
.brand span{color:var(--mint)}
.panel{
  background:linear-gradient(145deg,#19253b,#111a2d);
  border:1px solid var(--line);border-radius:22px;padding:clamp(22px,5vw,36px)
}
.eyebrow{font-size:12px;letter-spacing:2px;color:var(--mint);font-weight:800;margin-bottom:12px}
.authForm{display:grid;gap:16px;margin-top:22px}
.field{display:grid;gap:6px}
.field label{font-size:14px;font-weight:700}
.field input{
  width:100%;padding:11px 14px;border-radius:12px;
  background:#0b1324;color:var(--text);border:1px solid var(--line)
}
.field input:disabled{opacity:.55}
.authForm button[type=submit]{width:100%;margin-top:4px}
.formError,.formOk{margin:0;padding:11px 14px;border-radius:12px;font-size:14px}
.formError{color:var(--red);background:#ffa2af14;border:1px solid #ffa2af55}
.formOk{color:var(--mint);background:#54e0bd14;border:1px solid #54e0bd55}
.authFooter{font-size:14px;margin:22px 0 0;text-align:center}
`;
