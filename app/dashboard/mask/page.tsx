"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type ApiKey = {
  id: string;
  name: string;
};

type ForcedValue = {
  id: string;
  label: string | null;
  keyId: string | null;
  keyName: string | null;
  createdAt: string;
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function MaskPage() {
  const [forcedValues, setForcedValues] = useState<ForcedValue[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  // add modal
  const [showAdd, setShowAdd] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [selectedKeyId, setSelectedKeyId] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    try {
      const [valuesData, keysData] = await Promise.all([
        api<{ values: ForcedValue[] }>("/api/forced-values"),
        api<{ keys: ApiKey[] }>("/api/keys"),
      ]);
      setForcedValues(valuesData.values);
      setApiKeys(keysData.keys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function addForcedValue() {
    if (!newValue.trim()) return;
    try {
      setAdding(true);
      await api("/api/forced-values", {
        method: "POST",
        body: JSON.stringify({
          value: newValue.trim(),
          label: newLabel.trim() || null,
          keyId: selectedKeyId === "all" ? null : selectedKeyId,
        }),
      });
      setShowAdd(false);
      setNewValue("");
      setNewLabel("");
      setSelectedKeyId("all");
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api("/api/forced-values", {
        method: "DELETE",
        body: JSON.stringify({ id: deleteTarget }),
      });
      setForcedValues((prev) => prev.filter((v) => v.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="text-white/40">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Mask</h1>
          <p className="text-white/40 mt-2">
            Values added here are always masked automatically on every request.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition-all"
        >
          + Add Value
        </button>
      </div>

      {/* Info banner */}
      <div className="glass rounded-2xl p-5 mb-6 border border-white/5">
        <p className="text-sm text-white/50 leading-relaxed">
          <span className="text-white/80 font-medium">How it works — </span>
          Any value added here is scrubbed from every API request before
          processing. You can scope it to a specific API key or apply it
          globally across all keys.
        </p>
      </div>

      {/* List */}
      {forcedValues.length === 0 ? (
        <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-lg font-medium mb-2">No forced mask values</h3>
          <p className="text-white/40 text-sm mb-6">
            Add a value to always mask it in every request, no matter what.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition-all text-sm"
          >
            + Add Value
          </button>
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-sm">
                <th className="text-left px-6 py-4">Label</th>
                <th className="text-left px-6 py-4">Applies To</th>
                <th className="text-left px-6 py-4">Added</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forcedValues.map((fv) => (
                <tr
                  key={fv.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs border bg-violet-500/10 text-violet-300 border-violet-400/10">
                        Always masked
                      </span>
                      <span className="text-white/60 text-sm">
                        {fv.label ?? (
                          <span className="text-white/20 italic">no label</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {fv.keyId === null ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs border bg-white/5 text-white/50 border-white/10">
                        All API Keys
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs border bg-white/5 text-white/60 border-white/10">
                        {fv.keyName ?? fv.keyId}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-white/40 text-sm">
                    {new Date(fv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteTarget(fv.id)}
                        className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal
          title="Add Forced Mask Value"
          onClose={() => {
            setShowAdd(false);
            setNewValue("");
            setNewLabel("");
            setSelectedKeyId("all");
            setDropdownOpen(false);
          }}
        >
          <p className="text-white/40 text-sm mb-4">
            This value will be permanently masked on every request. Stored
            encrypted — never shown again after saving.
          </p>

          <input
            autoFocus
            type="text"
            placeholder="Value to always mask (e.g. 4111111111111111)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400/40 mb-3"
          />

          <input
            type="text"
            placeholder="Label (optional — e.g. my amex card)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400/40 mb-3"
          />

          {/* Custom Key Selector */}
          <div className="relative mb-4" data-dropdown>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 flex items-center justify-between hover:bg-white/[0.08] hover:border-white/20 transition-all outline-none focus:border-violet-400/40"
            >
              <span>
                {selectedKeyId === "all"
                  ? "All API Keys"
                  : apiKeys.find((k) => k.id === selectedKeyId)?.name ?? "Select key"}
              </span>
              <svg
                className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {[{ id: "all", name: "All API Keys" }, ...apiKeys].map((key) => (
                  <button
                    key={key.id}
                    type="button"
                    onClick={() => {
                      setSelectedKeyId(key.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-sm text-left transition-all hover:bg-white/5 ${
                      selectedKeyId === key.id
                        ? "text-violet-300 bg-violet-500/10"
                        : "text-white/60"
                    }`}
                  >
                    {key.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={addForcedValue}
            disabled={adding || !newValue.trim()}
            className="w-full py-3 rounded-xl bg-violet-500/20 border border-violet-400/20 text-violet-300 hover:bg-violet-500/30 transition-all text-sm disabled:opacity-40"
          >
            {adding ? "Saving..." : "Save & Always Mask"}
          </button>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal
          title="Remove Forced Value"
          onClose={() => setDeleteTarget(null)}
        >
          <p className="text-white/40 text-sm mb-6">
            This value will no longer be automatically masked in future
            requests. This cannot be undone.
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
              disabled={deleting}
              className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-400/20 text-red-300 hover:bg-red-500/25 transition-all text-sm disabled:opacity-40"
            >
              {deleting ? "Removing..." : "Remove"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}