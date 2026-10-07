"use client";

import { useEffect, useState } from "react";
import {
  getCurrentParent,
  getMembershipStatus,
  getParentByEmail,
  saveParentToCloud,
  setCurrentParentSession,
} from "@/lib/store";
import { MembershipStatus, Parent } from "@/types/story";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Sparkles,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function ParentsPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [currentParent, setCurrentParentState] = useState<Parent | null>(null);
  const [showWaitingScreen, setShowWaitingScreen] = useState(false);
  const [showMemberScreen, setShowMemberScreen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const current = await getCurrentParent();
      if (current) {
        setCurrentParentState(current);
        if (current.membershipStatus === "member") {
          setShowMemberScreen(true);
        } else {
          setShowWaitingScreen(true);
        }
      }
    }
    loadUser();
  }, []);

  const submit = async () => {
    setMessage("");
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    if (mode === "signup") {
      if (!cleanName || !cleanEmail || !password) {
        setMessage("Please fill in all fields.");
        return;
      }

      setIsLoading(true);
      try {
        const existing = await getParentByEmail(cleanEmail);
        if (existing) {
          setMessage("An account with this email already exists. Try logging in instead.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, name: cleanName }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to send verification email.");
        }

        setIsAwaitingVerification(true);
        setMessage(`Verification code has been sent to ${cleanEmail}! 📬`);
      } catch (err: any) {
        setMessage(err.message || "Failed to send email. Check your SMTP settings.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // LOGIN
    setIsLoading(true);
    try {
      const parent = await getParentByEmail(cleanEmail);
      if (!parent || parent.password !== password) {
        setMessage("Email or password is incorrect.");
        return;
      }

      setCurrentParentSession(parent);
      setCurrentParentState(parent);

      if (parent.membershipStatus === "member") {
        setShowMemberScreen(true);
        setShowWaitingScreen(false);
      } else {
        setShowWaitingScreen(true);
        setShowMemberScreen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async () => {
    setMessage("");
    if (!code || code.length < 6) {
      setMessage("Please enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");

      const status = getMembershipStatus(email);
      const newParent: Parent = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        verified: true,
        membershipStatus: status,
      };

      const saved = await saveParentToCloud(newParent);
      if (saved) {
        setCurrentParentSession(saved);
        setCurrentParentState(saved);
      }

      setIsAwaitingVerification(false);
      setCode("");

      if (status === "member") {
        setShowMemberScreen(true);
        setShowWaitingScreen(false);
      } else {
        setShowWaitingScreen(true);
        setShowMemberScreen(false);
      }
    } catch (err: any) {
      setMessage(err.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentParentSession(null);
    setCurrentParentState(null);
    setShowWaitingScreen(false);
    setShowMemberScreen(false);
    setName("");
    setEmail("");
    setPassword("");
    setCode("");
    setMessage("");
    setIsAwaitingVerification(false);
  };

  if (showWaitingScreen && currentParent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#8ed8f8] via-[#e9f9ff] to-[#ffeaf3] px-5 py-12">
        <div className="w-full max-w-lg rounded-[40px] border-4 border-white bg-white/95 p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-[#ffe27a] to-[#ffb86c] text-[#765300] shadow-lg">
            <Clock size={45} />
          </div>
          <h1 className="mt-5 text-4xl font-black text-[#3d4661]">You're on the list! 🪄</h1>
          <p className="mt-4 text-base font-semibold text-[#7a8398]">
            Hi <span className="text-[#6750ad]">{currentParent.name}</span>! Your account is saved in the database. Story creation is available for <b>@vuega.se</b> members.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/" className="flex-1 rounded-2xl bg-[#ff8a65] py-4 font-black text-white">BACK HOME</Link>
            <button onClick={logout} className="flex-1 rounded-2xl border-2 border-slate-200 py-4 font-black text-slate-600">LOG OUT</button>
          </div>
        </div>
      </main>
    );
  }

  if (showMemberScreen && currentParent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#8ed8f8] via-[#e9f9ff] to-[#ffeaf3] px-5 py-12">
        <div className="w-full max-w-lg rounded-[40px] border-4 border-white bg-white/95 p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-[#9b7bea] to-[#ff7184] text-white shadow-lg">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="mt-5 text-4xl font-black text-[#3d4661]">You're in! 🎉</h1>
          <p className="mt-4 text-base font-semibold text-[#7a8398]">
            Welcome <span className="text-[#6750ad]">{currentParent.name}</span>! You are authenticated with Supabase.
          </p>
          <button onClick={() => router.push("/create")} className="mt-8 w-full rounded-2xl bg-gradient-to-r from-[#9b7bea] to-[#ff7184] py-5 font-black text-white shadow-lg">
            CREATE MY FIRST STORY ✨
          </button>
          <button onClick={logout} className="mt-5 text-xs font-bold text-[#9aa2b1] underline">Log out</button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#8ed8f8] via-[#c8efff] to-[#ffeaf3] px-5 py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-2 font-black text-[#405474]">
          <ArrowLeft size={20} /> Back to Storyland
        </Link>

        <div className="rounded-[35px] border-4 border-white bg-white/95 p-7 shadow-xl sm:p-10">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff8a8a] text-white shadow-md">
              <Sparkles size={30} />
            </div>
            <h1 className="mt-4 text-3xl font-black text-[#3d4661]">
              {mode === "login" ? "Welcome Back! 👋" : "Parent Account 👨‍👩‍👧"}
            </h1>
          </div>

          {!isAwaitingVerification ? (
            <div className="space-y-4">
              {mode === "signup" && (
                <div className="flex items-center rounded-2xl border-2 border-[#e6eaf0] px-4 py-3">
                  <User size={20} className="mr-3 text-[#ff8a65]" />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full outline-none" />
                </div>
              )}

              <div className="flex items-center rounded-2xl border-2 border-[#e6eaf0] px-4 py-3">
                <Mail size={20} className="mr-3 text-[#ff8a65]" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" className="w-full outline-none" />
              </div>

              <div className="flex items-center rounded-2xl border-2 border-[#e6eaf0] px-4 py-3">
                <Lock size={20} className="mr-3 text-[#ff8a65]" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full outline-none" />
              </div>

              <button
                onClick={submit}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff8a65] py-4 font-black text-white shadow-lg disabled:opacity-60"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : mode === "login" ? "LOGIN 🚀" : "CREATE ACCOUNT ✨"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#e5f8ff] p-4 text-center text-sm font-bold text-[#155a70]">
                📬 Code sent to <b>{email}</b>.
              </div>

              <input
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="w-full rounded-2xl border-2 border-[#e6eaf0] px-4 py-4 text-center text-2xl font-black tracking-[0.4em] outline-none"
              />

              <button
                onClick={verify}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9b7bea] py-4 font-black text-white shadow-lg disabled:opacity-60"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : "VERIFY EMAIL ⭐"}
              </button>
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-2xl bg-[#fff4a8] p-3 text-center text-sm font-bold text-[#665300]">
              {message}
            </div>
          )}

          <div className="mt-7 text-center text-sm font-bold text-[#7a8398]">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setIsAwaitingVerification(false);
                setCode("");
                setMessage("");
              }}
              className="ml-2 text-[#ff7184] underline"
            >
              {mode === "login" ? "Create one" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}