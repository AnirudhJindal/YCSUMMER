"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ApiKey } from "@/lib/types/api";

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

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  // Reveal modal
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Rename modal
  const [renameTarget, setRenameTarget] = useState<ApiKey | null>(null);
  const [renameName, setRenameName] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function loadKeys() {
    try {
      const data = await api<{ keys: ApiKey[] }>("/api/keys");
      setKeys(data.keys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadKeys(); }, []);

  async function createKey() {
    if (!newKeyName.trim()) return;
    try {
      setCreating(true);
      const data = await api<{ apiKey: string }>("/api/keys/create", {
        method: "POST",
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      setShowCreate(false);
      setNewKeyName("");
      setNewKeyValue(data.apiKey);
      await loadKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function confirmRename() {
    if (!renameTarget || !renameName.trim()) return;
    try {
      await api("/api/keys/rename", {
        method: "PATCH",
        body: JSON.stringify({ keyId: renameTarget.id, name: renameName.trim() }),
      });
      setKeys((prev) => prev.map((k) => k.id === renameTarget.id ? { ...k, name: renameName.trim() } : k));
      setRenameTarget(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api("/api/keys/delete", {
        method: "DELETE",
        body: JSON.stringify({ keyId: deleteTarget }),
      });
      setKeys((prev) => prev.filter((k) => k.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleKey(id: string, active: boolean) {
    try {
      await api(active ? "/api/keys/deactivate" : "/api/keys/activate", {
        method: "POST",
        body: JSON.stringify({ keyId: id }),
      });
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, active: !active } : k));
    } catch (err) {
      console.error(err);
    }
  }

  function copyKey() {
    if (!newKeyValue) return;
    navigator.clipboard.writeText(newKeyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="text-white/40">Loading keys...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">API Keys</h1>
          <p className="text-white/40 mt-2">Manage developer access keys.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition-all"
        >
          Create Key
        </button>
      </div>

      {/* Empty state */}
      {keys.length === 0 ? (
        <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
          <p className="text-white/40 text-sm mb-6">Create your first key to start making API requests.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition-all text-sm"
          >
            Create Key
          </button>
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-sm">
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Requests</th>
                <th className="text-left px-6 py-4">Last Used</th>
                <th className="text-left px-6 py-4">Created</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-5 font-medium">{key.name}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs border ${
                      key.active
                        ? "bg-green-500/10 text-green-300 border-green-400/10"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}>
                      {key.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-white/60">{key.requests.toLocaleString()}</td>
                  <td className="px-6 py-5 text-white/40 text-sm">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}
                  </td>
                  <td className="px-6 py-5 text-white/40 text-sm">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => { setRenameTarget(key); setRenameName(key.name); }}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-all"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => toggleKey(key.id, key.active)}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-all"
                      >
                        {key.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(key.id)}
                        className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create API Key" onClose={() => { setShowCreate(false); setNewKeyName(""); }}>
          <input
            autoFocus
            type="text"
            placeholder="Key name (e.g. Production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400/40 mb-4"
          />
          <button
            onClick={createKey}
            disabled={creating || !newKeyName.trim()}
            className="w-full py-3 rounded-xl bg-violet-500/20 border border-violet-400/20 text-violet-300 hover:bg-violet-500/30 transition-all text-sm disabled:opacity-40"
          >
            {creating ? "Creating..." : "Create Key"}
          </button>
        </Modal>
      )}

      {/* New Key Reveal Modal */}
      {newKeyValue && (
        <Modal title="Your New API Key" onClose={() => { setNewKeyValue(null); setCopied(false); }}>
          <p className="text-white/40 text-sm mb-4">
            Copy this key now — it won't be shown again.
          </p>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4">
            <code className="text-xs text-violet-300 flex-1 break-all">{newKeyValue}</code>
            <button
              onClick={copyKey}
              className="ml-2 px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-400/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-all shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => { setNewKeyValue(null); setCopied(false); }}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm"
          >
            Done
          </button>
        </Modal>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <Modal title="Rename Key" onClose={() => setRenameTarget(null)}>
          <input
            autoFocus
            type="text"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400/40 mb-4"
          />
          <button
            onClick={confirmRename}
            disabled={!renameName.trim()}
            className="w-full py-3 rounded-xl bg-violet-500/20 border border-violet-400/20 text-violet-300 hover:bg-violet-500/30 transition-all text-sm disabled:opacity-40"
          >
            Save
          </button>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal title="Delete Key" onClose={() => setDeleteTarget(null)}>
          <p className="text-white/40 text-sm mb-6">
            This key will be permanently deleted and any apps using it will stop working.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-400/20 text-red-300 hover:bg-red-500/25 transition-all text-sm"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}