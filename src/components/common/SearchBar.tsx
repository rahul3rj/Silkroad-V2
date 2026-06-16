"use client";

// SearchBar — search input with debounce
// TODO: Implement debounced search, keyboard shortcut (Cmd+K), and suggestions dropdown
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition w-64"
      />
    </form>
  );
}
