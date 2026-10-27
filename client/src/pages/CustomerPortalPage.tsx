import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatPaiseToRupees, formatDate, getStageLabel } from '../utils/formatters';
import {
  Sun,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ReceiptText,
  LifeBuoy,
  MapPin,
  Calendar,
  Zap,
} from 'lucide-react';

export const CustomerPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerProject() {
      try {
        const res = await api.getProjects();
        if (res.projects && res.projects.length > 0) {
          const detailed = await api.getProjectById(res.projects[0]._id);
          setProject(detailed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerProject();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-solar-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-lg mx-auto">
        <Sun className="w-12 h-12 text-solar-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Welcome to HeliosOps Customer Portal</h2>
        <p className="text-xs text-slate-500 mt-1">
          No active solar installation project found for your registered account. Please contact your dedicated solar EPC executive.
        </p>
      </div>
    );
  }

  const p = project.project;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-navy-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-solar-400 uppercase tracking-wider block">
            Welcome, {p.customerId?.name}
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            {p.systemCapacityKw} kW Rooftop Solar PV Installation
          </h1>
          <p className="text-xs text-slate-300 mt-1 flex items-center space-x-2">
            <span>Project Ref: {p.projectId}</span>
            <span>•</span>
            <span>Work Order: {p.workOrderNumber}</span>
          </p>
        </div>
        <div className="text-right bg-navy-900/60 p-3 rounded-xl border border-navy-800">
          <div className="text-xs text-slate-400">Current Lifecycle Milestone</div>
          <div className="text-sm font-bold text-solar-300 mt-0.5">{getStageLabel(p.currentStage)}</div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Installation Roadmap & Milestones</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
            <div className="font-bold text-slate-900">1. Site Survey & Feasibility</div>
            <div className="text-[10px] text-emerald-700">Completed & Verified</div>
          </div>
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
            <div className="font-bold text-slate-900">2. Contract & Approvals</div>
            <div className="text-[10px] text-emerald-700">Work Order Executed</div>
          </div>
          <div className="p-3 rounded-lg border border-solar-300 bg-solar-50">
            <Clock className="w-4 h-4 text-solar-600 mb-1 animate-pulse" />
            <div className="font-bold text-navy-950">3. Physical EPC Mounting</div>
            <div className="text-[10px] text-solar-800 font-semibold">{getStageLabel(p.currentStage)}</div>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 opacity-70">
            <Zap className="w-4 h-4 text-slate-400 mb-1" />
            <div className="font-bold text-slate-700">4. Net Meter & Grid Sync</div>
            <div className="text-[10px] text-slate-500">Upcoming DISCOM inspection</div>
          </div>
        </div>
      </div>

      {/* Documents & Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Customer Documents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-solar-500" />
            <span>My Submitted KYC & Clearances</span>
          </h3>
          <div className="space-y-2">
            {(project.documents || []).map((doc: any) => (
              <div key={doc._id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">{doc.title}</div>
                  <div className="text-[10px] text-slate-400">{doc.category.replace(/_/g, ' ')}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Payment Receipts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center">
            <ReceiptText className="w-4 h-4 mr-1 text-solar-500" />
            <span>Payment Schedules & Verified Receipts</span>
          </h3>
          <div className="space-y-2">
            {(project.invoices || []).map((inv: any) => (
              <div key={inv._id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">{inv.milestoneName}</div>
                  <div className="text-[10px] text-slate-500">Invoice: {inv.invoiceNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatPaiseToRupees(inv.totalAmountPaise)}</div>
                  <span className={`text-[10px] font-bold ${inv.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
