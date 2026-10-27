import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Lead } from '../types';
import { formatPaiseToRupees, formatDate, getStatusBadgeClass } from '../utils/formatters';
import { SolarProposalModal } from '../components/SolarProposalModal';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowRight,
  Filter,
  Send,
} from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeLeadForActivity, setActiveLeadForActivity] = useState<Lead | null>(null);
  const [activityNote, setActivityNote] = useState('');
  const [activityType, setActivityType] = useState('CALL');
  const [proposalModalLead, setProposalModalLead] = useState<Lead | null>(null);

  // Form state for new lead
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411001',
    monthlyBillAmountPaise: 400000,
    preferredCapacityKw: 3,
    propertyType: 'RESIDENTIAL',
    source: 'WEBSITE',
    priority: 'MEDIUM',
    stage: 'NEW',
    notes: 'Inquired about PM Surya Ghar Muft Bijli Yojana subsidy.',
  });

  const loadLeads = async () => {
    try {
      const params: Record<string, string> = {};
      if (stageFilter) params.stage = stageFilter;
      if (search) params.search = search;
      const res = await api.getLeads(params);
      setLeads(res.leads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [stageFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLead(formData);
      setShowNewModal(false);
      loadLeads();
    } catch (err: any) {
      alert(err.message || 'Failed to create lead');
    }
  };

  const handleStageChange = async (leadId: string, newStage: string) => {
    if (newStage === 'PROPOSAL_SENT') {
      const targetLead = leads.find((l) => l._id === leadId);
      if (targetLead) {
        setProposalModalLead(targetLead);
        return;
      }
    }
    try {
      await api.updateLead(leadId, { stage: newStage });
      loadLeads();
    } catch (err: any) {
      alert(err.message || 'Failed to update stage');
    }
  };

  const handleConvert = async (leadId: string) => {
    if (!confirm('Convert this lead to a Customer & Property record?')) return;
    try {
      await api.convertLead(leadId);
      loadLeads();
      alert('Lead successfully converted to Customer & Property!');
    } catch (err: any) {
      alert(err.message || 'Conversion failed');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeadForActivity || !activityNote) return;
    try {
      await api.addLeadActivity(activeLeadForActivity._id, {
        type: activityType,
        note: activityNote,
      });
      setActiveLeadForActivity(null);
      setActivityNote('');
      loadLeads();
    } catch (err: any) {
      alert(err.message || 'Failed to add activity');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads & CRM Pipeline</h1>
          <p className="text-xs text-slate-500">Track, qualify, and convert customer enquiries</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Lead Intake</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or Lead ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-solar-500"
          />
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-solar-500"
          >
            <option value="">All Stages</option>
            <option value="NEW">New Enquiries</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="SURVEY_SCHEDULED">Survey Scheduled</option>
            <option value="SURVEY_COMPLETED">Survey Completed</option>
            <option value="WON">Won & Converted</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Lead ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Capacity & Bill</th>
                <th className="py-3 px-4">Assigned Exec</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{lead.leadId}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{lead.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" />
                          {lead.phone}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          {lead.city}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-navy-900">{lead.preferredCapacityKw} kW</div>
                      <div className="text-[11px] text-slate-500">
                        {lead.monthlyBillAmountPaise ? formatPaiseToRupees(lead.monthlyBillAmountPaise) : '—'}/mo
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {lead.assignedSalespersonId?.fullName || 'Unassigned'}
                      </div>
                      <div className="text-[10px] text-slate-400">Source: {lead.source}</div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead._id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold border focus:outline-none focus:ring-2 focus:ring-solar-500 cursor-pointer shadow-sm ${getStatusBadgeClass(
                          lead.stage
                        )}`}
                        title="Click to change lead stage"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="SURVEY_SCHEDULED">SURVEY SCHEDULED</option>
                        <option value="SURVEY_COMPLETED">SURVEY COMPLETED</option>
                        <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                        <option value="WON">WON</option>
                        <option value="LOST">LOST</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold ${
                          lead.priority === 'HIGH'
                            ? 'text-rose-600'
                            : lead.priority === 'MEDIUM'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setProposalModalLead(lead)}
                        className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition font-bold inline-flex items-center shadow-sm"
                        title="Prepare Solar Proposal & Send via WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        <span>Proposal</span>
                      </button>

                      {lead.stage !== 'QUALIFIED' && lead.stage !== 'WON' && (
                        <button
                          onClick={() => handleStageChange(lead._id, 'QUALIFIED')}
                          className="px-2.5 py-1 text-xs bg-amber-50 text-amber-900 border border-amber-300 rounded hover:bg-amber-100 transition font-bold inline-flex items-center shadow-sm"
                          title="Qualify this lead directly"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          <span>Qualify</span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveLeadForActivity(lead)}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded text-slate-700 hover:bg-slate-100 transition inline-flex items-center"
                        title="Log call or note"
                      >
                        <MessageSquare className="w-3 h-3 mr-1 text-slate-500" />
                        <span>Log Note</span>
                      </button>

                      {lead.stage !== 'WON' && (
                        <button
                          onClick={() => handleConvert(lead._id)}
                          className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-100 transition font-medium inline-flex items-center"
                          title="Convert to Customer & Property"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          <span>Convert</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lead Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">New Solar Lead Intake</h2>
            <p className="text-xs text-slate-500 mb-4">Register a prospective rooftop solar customer</p>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="e.g. Anand Mahindra"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="customer@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Installation Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Plot/Flat, Building, Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Monthly Bill (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyBillAmountPaise / 100}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyBillAmountPaise: Number(e.target.value) * 100 })
                    }
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Preferred Capacity (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.preferredCapacityKw}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredCapacityKw: Number(e.target.value) })
                    }
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Lead Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="WEBSITE">Website Portal</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WALK_IN">Walk-in</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Initial Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="NEW">NEW (Enquiry)</option>
                    <option value="QUALIFIED">QUALIFIED (Ready for Survey)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg shadow-sm"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {activeLeadForActivity && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Log Interaction for {activeLeadForActivity.customerName}
            </h2>
            <p className="text-xs text-slate-500 mb-4">{activeLeadForActivity.leadId} • {activeLeadForActivity.phone}</p>

            <form onSubmit={handleAddActivity} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Interaction Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp Message</option>
                  <option value="MEETING">Physical Meeting</option>
                  <option value="NOTE">General Note</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Discussion Notes</label>
                <textarea
                  rows={3}
                  required
                  value={activityNote}
                  onChange={(e) => setActivityNote(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Record customer preferences, objections, or follow-up commitments..."
                />
              </div>

              {/* Interaction History */}
              <div className="mt-4 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Recent Interactions</span>
                {(activeLeadForActivity.activities || []).map((act, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-800 flex justify-between">
                      <span>{act.type} • {act.performedBy}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(act.createdAt)}</span>
                    </div>
                    <div className="mt-0.5">{act.note}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveLeadForActivity(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Solar Proposal & WhatsApp Dispatch Modal */}
      <SolarProposalModal
        isOpen={!!proposalModalLead}
        lead={proposalModalLead}
        onClose={() => setProposalModalLead(null)}
        onProposalSent={() => {
          loadLeads();
          setProposalModalLead(null);
        }}
      />
    </div>
  );
};
