"use client";

import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { api } from "@/lib/api";

type VaultToken = { id: string; token: string; type: string; createdAt: string; lastUsed: string; };

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  EMAIL: "bg-blue-500/10 text-blue-300 border-blue-400/10",
  PHONE: "bg-green-500/10 text-green-300 border-green-400/10",
  CARD: "bg-yellow-500/10 text-yellow-300 border-yellow-400/10",
  BANK: "bg-orange-500/10 text-orange-300 border-orange-400/10",
  AADHAAR: "bg-red-500/10 text-red-300 border-red-400/10",
  PAN: "bg-red-500/10 text-red-300 border-red-400/10",
  UPI: "bg-purple-500/10 text-purple-300 border-purple-400/10",
  PASSWORD: "bg-pink-500/10 text-pink-300 border-pink-400/10",
  OTP: "bg-teal-500/10 text-teal-300 border-teal-400/10",
  APIKEY: "bg-indigo-500/10 text-indigo-300 border-indigo-400/10",
  IFSC: "bg-cyan-500/10 text-cyan-300 border-cyan-400/10",
  CVV: "bg-rose-500/10 text-rose-300 border-rose-400/10",
  EXPIRY: "bg-amber-500/10 text-amber-300 border-amber-400/10",
  FORCED: "bg-violet-500/10 text-violet-300 border-violet-400/10",
};

function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_COLORS[type] ?? "bg-white/5 text-white/50 border-white/10";
  return <span className={`inline-flex px-3 py-1 rounded-full text-xs border ${colors}`}>{type}</span>;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<VaultToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  async function loadTokens() {
    try {
      const data = await api<{ tokens: VaultToken[] }>("/api/tokens");
      setTokens(data.tokens);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTokens(); }, []);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api("/api/token", { method: "DELETE", body: JSON.stringify({ tokenId: deleteTarget }) });
      setTokens((prev) => prev.filter((t) => t.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  const allTypes = ["ALL", ...Array.from(new Set(tokens.map((t) => t.type)))];
  const filtered = tokens.filter((t) => {
    const matchesSearch = t.token.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a3e">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton width={180} height={36} className="mb-2" />
              <Skeleton width={260} height={16} />
            </div>
            <Skeleton width={90} height={34} borderRadius={999} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Skeleton width={256} height={38} borderRadius={12} />
            <Skeleton width={50} height={30} borderRadius={8} />
            <Skeleton width={70} height={30} borderRadius={8} />
            <Skeleton width={60} height={30} borderRadius={8} />
          </div>
          <div className="glass rounded-3xl overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-5 border-b border-white/5 flex items-center gap-6">
                <Skeleton width={220} height={24} borderRadius={8} />
                <Skeleton width={70} height={24} borderRadius={999} />
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={16} />
                <div className="ml-auto">
                  <Skeleton width={70} height={32} borderRadius={8} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Vault Tokens</h1>
          <p className="text-white/40 mt-2">Every masked value stored in your vault.</p>
        </div>
        <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/40 text-sm">{tokens.length} token{tokens.length !== 1 ? "s" : ""}</div>
      </div>

      {tokens.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <input type="text" placeholder="Search tokens..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400/40 text-white/70 placeholder:text-white/20 w-64" />
          <div className="flex items-center gap-2 flex-wrap">
            {allTypes.map((type) => (
              <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${filterType === type ? "bg-violet-500/20 border-violet-400/20 text-violet-300" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}>{type}</button>
            ))}
          </div>
        </div>
      )}

      {tokens.length === 0 ? (
        <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-lg font-medium mb-2">No tokens yet</h3>
          <p className="text-white/40 text-sm">Tokens appear here once you start making mask requests via your API.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-white/40 text-sm">No tokens match your search.</p>
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-sm">
                <th className="text-left px-6 py-4">Token</th>
                <th className="text-left px-6 py-4">Type</th>
                <th className="text-left px-6 py-4">Last Used</th>
                <th className="text-left px-6 py-4">Created</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-5"><code className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-lg">{t.token}</code></td>
                  <td className="px-6 py-5"><TypeBadge type={t.type} /></td>
                  <td className="px-6 py-5 text-white/40 text-sm">{t.lastUsed ? new Date(t.lastUsed).toLocaleString() : "Never"}</td>
                  <td className="px-6 py-5 text-white/40 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5"><div className="flex justify-end"><button onClick={() => setDeleteTarget(t.id)} className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm transition-all">Revoke</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <Modal title="Revoke Token" onClose={() => setDeleteTarget(null)}>
          <p className="text-white/40 text-sm mb-6">This token will be permanently deleted. Any app trying to unmask it will get an error. This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm">Cancel</button>
            <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-400/20 text-red-300 hover:bg-red-500/25 transition-all text-sm disabled:opacity-40">{deleting ? "Revoking..." : "Revoke Token"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}