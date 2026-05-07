"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import type { ApiKey } from "@/lib/types/api";

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] =
    useState(false);

  async function loadKeys() {
    try {
      const data = await api<{
        keys: ApiKey[];
      }>("/api/keys");

      setKeys(data.keys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function createKey() {
    const name = prompt("Key name");

    if (!name) return;

    try {
      setCreating(true);

      const data = await api<{
        apiKey: string;
      }>("/api/keys/create", {
        method: "POST",

        body: JSON.stringify({
          name,
        }),
      });

      alert(
        `Copy this API key now:\n\n${data.apiKey}`
      );

      await loadKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function renameKey(
    id: string,
    currentName: string
  ) {
    const name = prompt(
      "New key name",
      currentName
    );

    if (!name) return;

    try {
      await api("/api/keys/rename", {
        method: "PATCH",

        body: JSON.stringify({
          keyId: id,
          name,
        }),
      });

      setKeys((prev) =>
        prev.map((k) =>
          k.id === id
            ? {
                ...k,
                name,
              }
            : k
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteKey(id: string) {
    try {
      await api("/api/keys/delete", {
        method: "DELETE",

        body: JSON.stringify({
          keyId: id,
        }),
      });

      setKeys((prev) =>
        prev.filter((k) => k.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleKey(
    id: string,
    active: boolean
  ) {
    try {
      await api(
        active
          ? "/api/keys/deactivate"
          : "/api/keys/activate",
        {
          method: "POST",

          body: JSON.stringify({
            keyId: id,
          }),
        }
      );

      setKeys((prev) =>
        prev.map((k) =>
          k.id === id
            ? {
                ...k,
                active: !active,
              }
            : k
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="text-white/40">
        Loading keys...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            API Keys
          </h1>

          <p className="text-white/40 mt-2">
            Manage developer access keys.
          </p>
        </div>

        <button
          onClick={createKey}
          disabled={creating}
          className="px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition-all"
        >
          {creating
            ? "Creating..."
            : "Create Key"}
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-sm">
              <th className="text-left px-6 py-4">
                Name
              </th>

              <th className="text-left px-6 py-4">
                Status
              </th>

              <th className="text-left px-6 py-4">
                Requests
              </th>

              <th className="text-left px-6 py-4">
                Last Used
              </th>

              <th className="text-left px-6 py-4">
                Created
              </th>

              <th className="text-right px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {keys.map((key) => (
              <tr
                key={key.id}
                className="border-b border-white/5"
              >
                <td className="px-6 py-5">
                  <div className="font-medium">
                    {key.name}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-xs border ${
                      key.active
                        ? "bg-green-500/10 text-green-300 border-green-400/10"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}
                  >
                    {key.active
                      ? "Active"
                      : "Inactive"}
                  </div>
                </td>

                <td className="px-6 py-5 text-white/60">
                  {key.requests.toLocaleString()}
                </td>

                <td className="px-6 py-5 text-white/40 text-sm">
                  {key.lastUsedAt
                    ? new Date(
                        key.lastUsedAt
                      ).toLocaleString()
                    : "Never"}
                </td>

                <td className="px-6 py-5 text-white/40 text-sm">
                  {new Date(
                    key.createdAt
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() =>
                        renameKey(
                          key.id,
                          key.name
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
                    >
                      Rename
                    </button>

                    <button
                      onClick={() =>
                        toggleKey(
                          key.id,
                          key.active
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
                    >
                      {key.active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      onClick={() =>
                        deleteKey(key.id)
                      }
                      className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm"
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
    </div>
  );
}
