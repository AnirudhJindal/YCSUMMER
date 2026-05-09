"use client";

import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { api } from "@/lib/api";
import type { AuditLog } from "@/lib/types/api";

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    try {
      const data = await api<{ logs: AuditLog[] }>("/api/logs");
      setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLogs(); }, []);

  if (loading) {
    return (
      <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a3e">
        <div>
          <div className="mb-8">
            <Skeleton width={160} height={36} className="mb-2" />
            <Skeleton width={240} height={16} />
          </div>
          <div className="glass rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex gap-12">
              <Skeleton width={60} height={13} />
              <Skeleton width={80} height={13} />
              <Skeleton width={60} height={13} />
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-6 py-5 border-b border-white/5 flex items-center gap-12">
                <Skeleton width={70} height={24} borderRadius={999} />
                <Skeleton width={300} height={48} borderRadius={8} />
                <Skeleton width={120} height={16} />
              </div>
            ))}
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Audit Logs</h1>
        <p className="text-white/40 mt-2">Recent API activity and events.</p>
      </div>
      <div className="glass rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-sm">
              <th className="text-left px-6 py-4">Action</th>
              <th className="text-left px-6 py-4">Metadata</th>
              <th className="text-left px-6 py-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/5">
                <td className="px-6 py-5">
                  <div className="inline-flex px-3 py-1 rounded-full text-xs border bg-violet-500/10 text-violet-300 border-violet-400/10 capitalize">{log.action}</div>
                </td>
                <td className="px-6 py-5">
                  <pre className="text-xs text-white/50 overflow-x-auto max-w-[600px]">{JSON.stringify(log.metadata, null, 2)}</pre>
                </td>
                <td className="px-6 py-5 text-white/40 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <div className="p-10 text-center text-white/40">No audit logs yet.</div>}
      </div>
    </div>
  );
}