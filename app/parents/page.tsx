"use client";

import { useEffect, useState } from "react";
import {
  getCurrentParent,
  setCurrentParentSession,
} from "@/lib/store";
import { Parent } from "@/types/story";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Sparkles,
  RefreshCw,
  Coins,
  Zap,
} from "lucide-react";

export default function ParentsPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [currentParent, setCurrentParentState] = useState<Parent | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function initUser() {
      const current = await getCurrentParent();
      if (current) {
        setCurrentParentState(current);
      }

      // Check if user just returned from Stripe checkout
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get("payment");
        const sessionId = urlParams.get("session_id");

        if (paymentStatus === "success" && sessionId) {
          // Immediately clean URL query parameters so page refreshes don't re-submit
          window.history.replaceState({}, "", "/parents");
          setMessage("Verifying payment with Stripe... ⏳");
          try {
            const res = await fetch("/api/stripe/verify-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              setMessage(
                data.alreadyFulfilled
                  ? `✅ Payment already applied! Balance: ${data.newCredits} Magic Sparks.`
                  : `🎉 Payment received! Added ${data.creditsAdded} Magic Sparks!`
              );
              if (current) {
                setCurrentParentState({ ...current, credits: data.newCredits });
              } else {
                const refreshed = await getCurrentParent();
                if (refreshed) setCurrentParentState(refreshed);
              }
            } else {
              setMessage(data.error || "Could not verify payment session.");
            }
          } catch {
            setMessage("Payment succeeded! Please refresh to view your updated sparks.");
          }
        } else if (paymentStatus === "cancelled") {
          window.history.replaceState({}, "", "/parents");
          setMessage("Payment was cancelled.");
        }
      }
    }
    initUser();
  }, []);

  const handleStripeCheckout = async (packageId: "starter" | "popular" | "master") => {
    if (!currentParent) return;
    setCheckoutLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          email: currentParent.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setMessage(`Payment error: ${err.message}`);
      setCheckoutLoading(false);
    }
  };

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
      if (password.length < 6) {
        setMessage("Password must be at least 6 characters long.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, name: cleanName }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send code.");

        setIsAwaitingVerification(true);
        setMessage(`Verification code sent to ${cleanEmail}! 📬`);
      } catch (err: any) {
        setMessage(err.message || "Failed to send email.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // LOGIN
    if (!password) {
      setMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.parent) {
        setMessage(data.error || "Email or password is incorrect.");
        return;
      }

      setCurrentParentSession(data.parent);
      setCurrentParentState(data.parent);
    } catch {
      setMessage("Could not sign in. Please try again.");
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
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
          name: name.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");

      if (data.parent) {
        setCurrentParentSession(data.parent);
        setCurrentParentState(data.parent);
      }

      setIsAwaitingVerification(false);
      setCode("");
    } catch (err: any) {
      setMessage(err.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentParentSession(null);
    setCurrentParentState(null);
  };

  if (currentParent) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#8ed8f8] via-[#e9f9ff] to-[#ffeaf3] px-5 py-12">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 font-black text-[#405474]">
            <ArrowLeft size={20} /> Back to Storyland
          </Link>

          <div className="rounded-[40px] border-4 border-white bg-white/95 p-7 shadow-xl sm:p-10">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9b7bea] to-[#ff7184] text-2xl text-white shadow-md">
                👤
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black text-[#3d4661] sm:text-3xl">
                  {currentParent.name}&apos;s Dashboard
                </h1>
                <p className="text-sm font-semibold text-[#7a8398]">{currentParent.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-500 hover:bg-slate-50"
              >
                Log out
              </button>
            </div>

            <div className="mt-8 overflow-hidden rounded-[30px] border-4 border-amber-200 bg-gradient-to-br from-[#fff7d6] via-[#ffedd5] to-[#ffe4e6] p-6 text-amber-950 shadow-md">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-inner">
                    <Coins size={36} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                      Current Balance
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black sm:text-5xl">{currentParent.credits ?? 0}</span>
                      <span className="text-lg font-black text-amber-800">Magic Sparks</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/create"
                  className="w-full rounded-2xl bg-gradient-to-r from-[#9b7bea] to-[#ff7184] px-6 py-4 text-center font-black text-white shadow-md transition hover:scale-105 sm:w-auto"
                >
                  <Sparkles className="mr-2 inline" size={18} />
                  CREATE STORY ✨
                </Link>
              </div>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-black text-emerald-800">
                {message}
              </div>
            )}

            {/* REAL STRIPE PACKAGES */}
            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-lg font-black text-[#3d4661]">
                <Zap className="text-orange-500" size={20} />
                Refill Magic Sparks (Secure Stripe Checkout)
              </h3>
              <p className="text-xs font-semibold text-[#7a8398]">
                Select a pack to purchase credits securely via Card or Apple/Google Pay:
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Starter */}
                <div className="flex flex-col justify-between rounded-3xl border-2 border-slate-200 bg-white p-5 text-center shadow-sm">
                  <div>
                    <div className="text-2xl">🌱</div>
                    <h4 className="mt-2 font-black text-[#3d4661]">Starter Pack</h4>
                    <p className="text-2xl font-black text-[#ff8a65] mt-1">$2.99</p>
                    <p className="text-xs font-bold text-[#8d98ab]">5 Sparks</p>
                  </div>
                  <button
                    onClick={() => handleStripeCheckout("starter")}
                    disabled={checkoutLoading}
                    className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Buy 5 Sparks 💳
                  </button>
                </div>

                {/* Popular */}
                <div className="relative flex flex-col justify-between rounded-3xl border-3 border-[#9b7bea] bg-[#faf7ff] p-5 text-center shadow-md">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#9b7bea] px-3 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                    Most Popular
                  </div>
                  <div>
                    <div className="text-2xl">🚀</div>
                    <h4 className="mt-2 font-black text-[#3d4661]">Story Lover</h4>
                    <p className="text-2xl font-black text-[#9b7bea] mt-1">$6.99</p>
                    <p className="text-xs font-bold text-[#8d98ab]">15 Sparks</p>
                  </div>
                  <button
                    onClick={() => handleStripeCheckout("popular")}
                    disabled={checkoutLoading}
                    className="mt-4 w-full rounded-xl bg-[#9b7bea] py-3 text-xs font-black text-white shadow transition hover:bg-[#8561db] disabled:opacity-50"
                  >
                    Buy 15 Sparks 💳
                  </button>
                </div>

                {/* Master */}
                <div className="flex flex-col justify-between rounded-3xl border-2 border-slate-200 bg-white p-5 text-center shadow-sm">
                  <div>
                    <div className="text-2xl">👑</div>
                    <h4 className="mt-2 font-black text-[#3d4661]">Master Author</h4>
                    <p className="text-2xl font-black text-[#ff7184] mt-1">$12.99</p>
                    <p className="text-xs font-bold text-[#8d98ab]">35 Sparks</p>
                  </div>
                  <button
                    onClick={() => handleStripeCheckout("master")}
                    disabled={checkoutLoading}
                    className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Buy 35 Sparks 💳
                  </button>
                </div>
              </div>
            </div>
          </div>
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
              {mode === "login" ? "Welcome Back! 👋" : "Explorer Account 👨‍👩‍👧"}
            </h1>
            <p className="mt-1 text-xs font-bold text-[#8a94a6]">
              Sign up to get 5 Free Magic Sparks for story creation!
            </p>
          </div>

          {!isAwaitingVerification ? (
            <div className="space-y-4">
              {mode === "signup" && (
                <div className="flex items-center rounded-2xl border-2 border-[#e6eaf0] px-4 py-3">
                  <User size={20} className="mr-3 text-[#ff8a65]" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full outline-none"
                  />
                </div>
              )}

              <div className="flex items-center rounded-2xl border-2 border-[#e6eaf0] px-4 py-3">
                <Mail size={20} className="mr-3 text-[#ff8a65]" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email address"
                  className="w-full outline-none"
                />
              </div>

              <div className="flex items-center rounded-2xl border-2 border-[#e6eaf0] px-4 py-3">
                <Lock size={20} className="mr-3 text-[#ff8a65]" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full outline-none"
                />
              </div>

              <button
                onClick={submit}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff8a65] py-4 font-black text-white shadow-lg disabled:opacity-60"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : mode === "login" ? (
                  "LOGIN 🚀"
                ) : (
                  "CREATE ACCOUNT & GET 5 SPARKS ✨"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#e5f8ff] p-4 text-center text-sm font-bold text-[#155a70]">
                📬 6-digit code sent to <b>{email}</b>.
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
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : "VERIFY & ACTIVATE ⭐"}
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
