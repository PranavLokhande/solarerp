import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatDate, formatDateTime } from '../utils/formatters';
import { History, Shield, Search, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async () => {
    try {
      const params: Record<string, string> = { limit: '100' };
      if (actionFilter) params.action = actionFilter;
      const res = await api.getAuditLogs(params);
      setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance & Security Audit Trail</h1>
          <p className="text-xs text-slate-500">
            Immutable log of sensitive business operations, stage transitions, and financial approvals
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2 bg-white"
          >
            <option value="">All Audit Actions</option>
            <option value="LOGIN_SUCCESS">User Logins</option>
            <option value="CREATE_LEAD">Lead Creation</option>
            <option value="CONVERT_LEAD">Lead Conversion</option>
            <option value="CREATE_QUOTATION">Quotations</option>
            <option value="ACCEPT_QUOTATION_WORK_ORDER">Work Order Acceptance</option>
            <option value="DISPATCH_MATERIAL">Material Dispatch</option>
            <option value="RECORD_PAYMENT">Payment Receipts</option>
            <option value="COMMISSION_PLANT">Plant Commissioning</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.auditId}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{formatDateTime(log.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.userEmail || 'System'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress || '127.0.0.1'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {log.resourceType} <span className="font-mono text-slate-400">({log.resourceId?.slice(-6)})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                    {JSON.stringify(log.details || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
