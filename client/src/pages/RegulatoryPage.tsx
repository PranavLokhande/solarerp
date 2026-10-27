import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatDate, formatPaiseToRupees, getStatusBadgeClass } from '../utils/formatters';
import { Building2, ShieldCheck, CheckCircle2, Clock, Plus, ExternalLink } from 'lucide-react';

export const RegulatoryPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.getRegulatory();
      setApplications(res.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStage = async (id: string, currentStage: string) => {
    try {
      await api.updateRegulatoryStage(id, { currentStage });
      loadData();
      alert(`Portal stage updated to ${currentStage}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update stage');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            DISCOM & PM Surya Ghar National Portal Tracker
          </h1>
          <p className="text-xs text-slate-500">
            Technical feasibility clearance, net-metering applications, and DBT central subsidy claims
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">App Ref</th>
                <th className="py-3 px-4">Portal Type</th>
                <th className="py-3 px-4">DISCOM & Consumer No</th>
                <th className="py-3 px-4">Project Capacity</th>
                <th className="py-3 px-4">Current Portal Stage</th>
                <th className="py-3 px-4">Subsidy Amount</th>
                <th className="py-3 px-4 text-right">Update Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No regulatory portal applications recorded.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{app.applicationNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {app.portalType === 'PM_SURYA_GHAR_NATIONAL_PORTAL' ? (
                        <span className="text-solar-700 font-bold">PM Surya Ghar Portal</span>
                      ) : (
                        app.portalType
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.discomName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Cons: {app.consumerNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-navy-950">
                      {app.projectId?.systemCapacityKw || 3} kW
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                          app.currentStage
                        )}`}
                      >
                        {app.currentStage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      {formatPaiseToRupees(app.subsidyAmountPaise || 7800000)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <select
                        value={app.currentStage}
                        onChange={(e) => handleUpdateStage(app._id, e.target.value)}
                        className="text-[11px] border border-slate-200 rounded p-1 font-medium bg-white"
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="FEASIBILITY_APPROVED">Feasibility Approved</option>
                        <option value="NET_METER_APPLIED">Net Meter Applied</option>
                        <option value="COMMISSIONED">Commissioned</option>
                        <option value="SUBSIDY_APPLIED">Subsidy Claimed</option>
                        <option value="SUBSIDY_DISBURSED">Subsidy Disbursed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
