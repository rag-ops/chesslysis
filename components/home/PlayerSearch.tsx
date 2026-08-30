"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayerSearch() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = username.trim();
    if (value) router.push(`/dashboard/${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Enter a Chess.com username"
        className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-slate-900 placeholder:text-slate-400 focus:ring-2"
        aria-label="Chess.com username"
      />
      <button className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">
        Open dashboard
      </button>
    </form>
  );
}
