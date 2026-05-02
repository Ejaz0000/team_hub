"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AuthCard({ mode = "login" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const action = isLogin ? login : register;
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };
    const result = await action(payload);
    if (result.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="surface-card w-full max-w-md rounded-3xl p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {isLogin ? "Welcome back" : "Create account"}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          {isLogin ? "Sign in" : "Join the hub"}
        </h1>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin ? (
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Jamie Lee"
          />
        ) : null}
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="you@teamhub.io"
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="At least 8 characters"
        />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <Button
          type="submit"
          className="w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Working..." : isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-slate-400">
        {isLogin ? "Need an account?" : "Already have an account?"} {" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="text-amber-200"
        >
          {isLogin ? "Register" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
