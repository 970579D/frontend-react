"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, Field } from "@/app/AuthShell";
import { login } from "@/app/api";
import Login from "./login/page";

export default function Page() {
  
  return <Login />

}
