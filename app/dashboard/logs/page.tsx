"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import type { AuditLog } from "@/lib/types/api";

export default function LogsPage() {
  const [logs, setLogs] = useState<
    AuditLog[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  async function loadLogs() {
    try {
      const data = await api<{
        logs: AuditLog[];
      }>("/api/logs");

      setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="text-white/40">
        Loading logs...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Audit Logs
        </h1>

        <p className="text-white/40 mt-2">
          Recent API activity and events.
        </p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-sm">
              <th className="text-left px-6 py-4">
                Action
              </th>

              <th className="text-left px-6 py-4">
                Metadata
              </th>

              <th className="text-left px-6 py-4">
                Created
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-white/5"
              >
                <td className="px-6 py-5">
                  <div className="inline-flex px-3 py-1 rounded-full text-xs border bg-violet-500/10 text-violet-300 border-violet-400/10 capitalize">
                    {log.action}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <pre className="text-xs text-white/50 overflow-x-auto max-w-[600px]">
                    {JSON.stringify(
                      log.metadata,
                      null,
                      2
                    )}
                  </pre>
                </td>

                <td className="px-6 py-5 text-white/40 text-sm">
                  {new Date(
                    log.createdAt
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="p-10 text-center text-white/40">
            No audit logs yet.
          </div>
        )}
      </div>
    </div>
  );
}