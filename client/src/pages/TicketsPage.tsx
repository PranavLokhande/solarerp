import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Ticket, Customer } from '../types';
import { formatDate, getStatusBadgeClass } from '../utils/formatters';
import { LifeBuoy, ShieldCheck, Plus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [amcList, setAmcList] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'warranty' | 'amc'>('tickets');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // New Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    customerId: '',
    category: 'CLEANING_REQUEST',
    priority: 'MEDIUM',
    subject: 'Quarterly Solar Module Cleaning & Generation Audit',
    description: 'Routine maintenance request under active AMC contract.',
  });

  const loadData = async () => {
    try {
      const [tRes, wRes, aRes] = await Promise.all([
        api.getTickets(),
        api.getWarranties(),
        api.getAMCContracts(),
      ]);
      setTickets(tRes.tickets);
      setWarranties(wRes.warranties);
      setAmcList(aRes.contracts);

      // fetch customers
      const cRes = await fetch('/api/v1/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('helios_access_token')}` },
      });
      const cData = await cRes.json();
      if (cData.data?.customers && cData.data.customers.length > 0) {
        setCustomers(cData.data.customers);
        setTicketForm((prev) => ({ ...prev, customerId: cData.data.customers[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTicket(ticketForm);
      setShowNewTicketModal(false);
      loadData();
      alert('Support ticket created with automated SLA deadline!');
    } catch (err: any) {
      alert(err.message || 'Ticket creation failed');
    }
  };

  const handleResolveTicket = async (id: string) => {
    const notes = prompt('Enter resolution summary / action taken:');
    if (!notes) return;
    try {
      await api.resolveTicket(id, { resolutionNotes: notes, status: 'RESOLVED' });
      loadData();
      alert('Ticket marked as RESOLVED');
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Service Tickets, Warranty & AMC
          </h1>
          <p className="text-xs text-slate-500">
            Post-commissioning operations, warranty validations, SLA tracking, and scheduled maintenance
          </p>
        </div>
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Raise Service Ticket</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'tickets'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Support Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('warranty')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'warranty'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Active Plant Warranties ({warranties.length})
        </button>
        <button
          onClick={() => setActiveTab('amc')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'amc'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Annual Maintenance Contracts ({amcList.length})
        </button>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Issue Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority & SLA</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.ticketId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.customerId?.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{t.category.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-800">{t.subject}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{t.priority}</div>
                      <div className="text-[10px] text-slate-400 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        <span>SLA: {formatDate(t.slaDeadline)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{t.assignedTechnicianName || 'Nilesh Shinde'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleResolveTicket(t._id)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded font-semibold text-xs hover:bg-emerald-100"
                        >
                          Resolve Ticket
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warranty Tab */}
      {activeTab === 'warranty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warranties.map((w) => (
            <div key={w._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm">{w.warrantyId}</span>
                  <div className="text-xs text-slate-500 font-medium">Customer: {w.customerId?.name}</div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold">
                  Active Warranty
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Workmanship Warranty:</span>
                  <span className="font-bold text-navy-900">{w.workmanshipWarrantyYears} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inverter Manufacturer Warranty:</span>
                  <span className="font-bold text-navy-900">{w.inverterWarrantyYears} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Module Linear Generation Guarantee:</span>
                  <span className="font-bold text-emerald-700">{w.panelPerformanceYears} Years (80%)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>Coverage Period:</span>
                  <span>
                    {formatDate(w.startDate)} - {formatDate(w.endDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AMC Tab */}
      {activeTab === 'amc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {amcList.map((a) => (
            <div key={a._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm">{a.amcId}</span>
                  <div className="text-xs text-slate-500 font-medium">{a.planName.replace(/_/g, ' ')}</div>
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-bold">
                  {a.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-800">{a.customerId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Visits per Year:</span>
                  <span className="font-bold text-slate-800">{a.visitsPerYear} Routine Visits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Visits Completed:</span>
                  <span className="font-bold text-emerald-600">{a.visitsCompleted}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>Valid Until:</span>
                  <span>{formatDate(a.endDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raise Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Raise Service / Maintenance Ticket</h2>
            <p className="text-xs text-slate-500 mb-4">Post-sales support, generation audits, and inverter alerts</p>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Customer</label>
                <select
                  required
                  value={ticketForm.customerId}
                  onChange={(e) => setTicketForm({ ...ticketForm, customerId: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.customerId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Issue Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="CLEANING_REQUEST">Module Cleaning Request</option>
                    <option value="ZERO_GENERATION">Zero / Low Generation Alert</option>
                    <option value="INVERTER_FAULT">Inverter Error Code Fault</option>
                    <option value="NET_METER_READING">Net Meter Discrepancy</option>
                    <option value="PHYSICAL_DAMAGE">Physical Storm / Animal Damage</option>
                    <option value="GENERAL">General Query</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="LOW">Low (120h SLA)</option>
                    <option value="MEDIUM">Medium (72h SLA)</option>
                    <option value="HIGH">High (48h SLA)</option>
                    <option value="CRITICAL">Critical (24h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  required
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg shadow-sm"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
