"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const isLogin = localStorage.getItem("login");
    console.log("isLogin", isLogin)
    if (isLogin) router.replace("/quest");
    else router.replace("/login");
  }, [])

  return <></>;

}
