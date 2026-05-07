export type ApiKey = {
  id: string;
  name: string;
  active: boolean;
  requests: number;
  lastUsedAt: string | null;
  createdAt: string;
};
export type AuditLog = {
  id: string;
  action: string;
  createdAt: string;
  metadata: any;
};