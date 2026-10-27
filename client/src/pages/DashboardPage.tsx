import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatPaiseToRupees, getStageLabel } from '../utils/formatters';
import {
  Users,
  Compass,
  Workflow,
  Zap,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  LifeBuoy,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getDashboardStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-solar-500"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const stageData = (data?.projectsByStage || []).map((s: any) => ({
    name: getStageLabel(s._id),
    count: s.count,
    kw: s.totalKw,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Operations Control</h1>
          <p className="text-xs text-slate-500">Live operational, commercial, and engineering metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/leads"
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold text-xs transition shadow-sm"
          >
            <span>Capture New Lead</span>
            <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.totalLeads ?? 0}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            +{kpis.newLeadsToday ?? 0} new today
          </div>
        </div>

        {/* Surveys Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Surveys Queue</span>
            <Compass className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.surveysPending ?? 0}</div>
          <div className="mt-1 text-[11px] text-slate-500">Pending roof visit</div>
        </div>

        {/* Active Projects */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Projects</span>
            <Workflow className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.activeProjects ?? 0}</div>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium">In execution pipeline</div>
        </div>

        {/* Installed Capacity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Commissioned</span>
            <Zap className="w-4 h-4 text-solar-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {kpis.totalInstalledCapacityKw ?? 0} <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            {kpis.commissionedProjects ?? 0} grid synchronized
          </div>
        </div>

        {/* Invoiced Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Invoiced Total</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900 truncate">
            {formatPaiseToRupees(kpis.totalInvoicedPaise)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Contract milestones</div>
        </div>

        {/* Cash Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Collections</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-emerald-700 truncate">
            {formatPaiseToRupees(kpis.totalCollectedPaise)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Verified bank credits</div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Receivables Due</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-amber-700 truncate">
            {formatPaiseToRupees(kpis.outstandingDuePaise)}
          </div>
          <div className="mt-1 text-[11px] text-amber-600">Pending customer balance</div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.lowStockAlerts ?? 0}</div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">SKUs near reorder level</div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Tickets</span>
            <LifeBuoy className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.openTickets ?? 0}</div>
          <div className="mt-1 text-[11px] text-cyan-700">Within active SLA</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Project Lifecycle Pipeline Distribution</h2>
            <p className="text-xs text-slate-500">Projects currently active by execution stage</p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-3 h-3 rounded bg-solar-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Projects Count</span>
          </div>
        </div>
        <div className="h-64 w-full">
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No project stage records found.
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/surveys"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-solar-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-900 font-bold text-sm group-hover:text-solar-600">
            <span>Site Surveys & Roof Feasibility</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-solar-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Schedule engineer visits, record roof area, tilt, orientation, and feasibility sign-off.
          </p>
        </Link>

        <Link
          to="/designs"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-solar-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-900 font-bold text-sm group-hover:text-solar-600">
            <span>Solar Design & BOQ Engine</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-solar-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auto-compute module/inverter sizing, Bill of Quantities, and generate branded quotations.
          </p>
        </Link>

        <Link
          to="/inventory"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-solar-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-900 font-bold text-sm group-hover:text-solar-600">
            <span>Logistics & Material Dispatch</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-solar-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Allocate warehouse stock against work orders and issue official Delivery Challans.
          </p>
        </Link>
      </div>
    </div>
  );
};
