import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SolarDesign, Quotation, Customer } from '../types';
import { formatPaiseToRupees, formatDate, getStatusBadgeClass } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { printProposalDocument } from '../utils/printProposal';
import {
  Cpu,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Percent,
  Zap,
  Printer,
  ShieldAlert,
  Send,
} from 'lucide-react';

export const DesignQuotationPage: React.FC = () => {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<SolarDesign[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quotations' | 'designs'>('quotations');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // New Design Modal
  const [showNewDesignModal, setShowNewDesignModal] = useState(false);
  const [designForm, setDesignForm] = useState({
    customerId: '',
    dcCapacityKw: 3.27,
    acCapacityKw: 3.0,
    panelModel: 'Waaree Bi-54 545W Mono PERC Bifacial',
    panelWattage: 545,
    inverterModel: 'Growatt MIN 3000TL-X',
    structureSpecification: 'Hot Dip Galvanized (HDG) Rooftop Elevated Structure, 18 deg tilt',
  });

  // New Quotation Modal
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    customerId: '',
    solarDesignId: '',
    discountPercentage: 0,
  });

  const loadData = async () => {
    try {
      const [resDesigns, resQuotes, resCusts] = await Promise.all([
        api.getDesigns(),
        api.getQuotations(),
        api.getEmployees().catch(() => ({ employees: [] })), // fallback
      ]);
      setDesigns(resDesigns.designs);
      setQuotations(resQuotes.quotations);

      // fetch customers
      const cRes = await fetch('/api/v1/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('helios_access_token')}` },
      });
      const cData = await cRes.json();
      if (cData.data?.customers) {
        setCustomers(cData.data.customers);
        if (cData.data.customers.length > 0) {
          setDesignForm((prev) => ({ ...prev, customerId: cData.data.customers[0]._id }));
          setQuoteForm((prev) => ({ ...prev, customerId: cData.data.customers[0]._id }));
        }
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

  const handleCreateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDesign(designForm);
      setShowNewDesignModal(false);
      loadData();
      alert('Solar PV design and Bill of Materials (BOQ) generated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create design');
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createQuotation(quoteForm);
      setShowNewQuoteModal(false);
      loadData();
      alert('Quotation generated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to generate quotation');
    }
  };

  const handleApproveDiscount = async (quoteId: string) => {
    try {
      await api.approveQuotation(quoteId);
      loadData();
      alert('Discount approved! Quotation marked as APPROVED.');
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleAcceptQuotation = async (quoteId: string) => {
    if (!confirm('Customer agrees to proceed? This will generate the signed Work Order and initiate Project Operations.'))
      return;
    try {
      await api.acceptQuotation(quoteId);
      loadData();
      alert('Quotation accepted! Official Work Order and active Project created.');
    } catch (err: any) {
      alert(err.message || 'Acceptance failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Solar Design, BOQ & Quotations
          </h1>
          <p className="text-xs text-slate-500">
            Automated Bill of Quantities, discount approval gates, and customer contract generation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewDesignModal(true)}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-navy-950 hover:bg-navy-900 text-white font-semibold text-xs shadow-sm transition"
          >
            <Cpu className="w-4 h-4 mr-1.5" />
            <span>Generate Solar Design</span>
          </button>
          <button
            onClick={() => {
              if (designs.length > 0) {
                setQuoteForm((prev) => ({
                  ...prev,
                  solarDesignId: designs[0]._id,
                  customerId: designs[0].customerId?._id || prev.customerId,
                }));
              }
              setShowNewQuoteModal(true);
            }}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold text-xs shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'quotations'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Quotations & Contracts ({quotations.length})
        </button>
        <button
          onClick={() => setActiveTab('designs')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'designs'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Approved Solar Designs & BOQs ({designs.length})
        </button>
      </div>

      {/* Quotations Tab Content */}
      {activeTab === 'quotations' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Quote No</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plant Size</th>
                  <th className="py-3 px-4">Contract Total</th>
                  <th className="py-3 px-4">Govt Subsidy</th>
                  <th className="py-3 px-4">Net Customer Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No quotations generated yet.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {q.quotationNumber} <span className="text-[10px] text-slate-400">v{q.version}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{q.customerId?.name}</div>
                        <div className="text-[11px] text-slate-400">{q.customerId?.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-navy-900">
                        {q.solarDesignId?.dcCapacityKw || 3} kW
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatPaiseToRupees(q.totalAmountPaise)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">
                        {formatPaiseToRupees(q.estimatedSubsidyPaise)}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-navy-950">
                        {formatPaiseToRupees(q.netCustomerPayablePaise)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                            q.status
                          )}`}
                        >
                          {q.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedQuotation(q)}
                          className="px-2.5 py-1 text-xs border border-slate-200 rounded text-slate-700 hover:bg-slate-100 transition inline-flex items-center"
                        >
                          <FileText className="w-3 h-3 mr-1 text-slate-500" />
                          <span>View Offer</span>
                        </button>

                        {q.status === 'PENDING_APPROVAL' && (
                          <button
                            onClick={() => handleApproveDiscount(q._id)}
                            className="px-2.5 py-1 text-xs bg-amber-500 text-navy-950 font-bold rounded hover:bg-amber-400 transition inline-flex items-center"
                          >
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            <span>Approve Discount</span>
                          </button>
                        )}

                        {(q.status === 'APPROVED' || q.status === 'SENT_TO_CUSTOMER') && (
                          <button
                            onClick={() => handleAcceptQuotation(q._id)}
                            className="px-2.5 py-1 text-xs bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-500 transition inline-flex items-center shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            <span>Customer Accepted</span>
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
      )}

      {/* Designs Tab Content */}
      {activeTab === 'designs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {designs.map((des) => (
            <div key={des._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-navy-900 text-sm">{des.designId}</span>
                  <div className="text-xs text-slate-500 font-medium">Customer: {des.customerId?.name}</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold">
                  {des.dcCapacityKw} kW DC / {des.acCapacityKw} kW AC
                </span>
              </div>

              {/* Equipment Breakdown */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Modules:</span>
                  <span className="font-semibold text-slate-800">
                    {des.panelQty}x {des.panelModel} ({des.panelWattage}W)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inverter:</span>
                  <span className="font-semibold text-slate-800">{des.inverterModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Structure:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {des.structureSpecification}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Est. Daily Generation:</span>
                  <span className="font-bold text-amber-600">{des.estimatedDailyGenKwh} Units/day</span>
                </div>
              </div>

              {/* BOQ Summary */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Bill of Materials (BOQ) Items
                </span>
                <div className="mt-2 divide-y divide-slate-100 max-h-36 overflow-y-auto text-[11px]">
                  {(des.boqItems || []).map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between">
                      <span className="text-slate-700 truncate max-w-[220px]">{item.description}</span>
                      <span className="font-bold text-slate-900">{formatPaiseToRupees(item.totalAmountPaise)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Branded Quotation Preview Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Branded Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="text-lg font-black text-navy-950 flex items-center space-x-1">
                  <span>HELIOS</span>
                  <span className="text-solar-500">OPS</span>
                  <span className="text-xs font-normal text-slate-500 ml-2">SOLAR EPC QUOTATION</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Ref: {selectedQuotation.quotationNumber} • Rev {selectedQuotation.version}
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                title="Print or Export PDF"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & System Summary */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase">Prepared For:</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedQuotation.customerId?.name}</div>
                <div className="text-slate-500">{selectedQuotation.customerId?.billingAddress}</div>
                <div className="text-slate-500">Phone: {selectedQuotation.customerId?.phone}</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-400 uppercase">System Specification:</span>
                <div className="text-sm font-bold text-navy-900 mt-0.5">
                  {selectedQuotation.solarDesignId?.dcCapacityKw || 3} kW Grid-Tied PV System
                </div>
                <div className="text-slate-500">Net-metering under PM Surya Ghar Scheme</div>
                <div className="text-slate-500">Validity: {selectedQuotation.validityDays} Days</div>
              </div>
            </div>

            {/* Financial Commercials Table */}
            <div className="py-4 space-y-2 text-xs">
              <div className="font-bold text-slate-900">Commercial Summary</div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base System Cost (Supply & Installation):</span>
                  <span className="font-semibold text-slate-900">
                    {formatPaiseToRupees(selectedQuotation.baseCostPaise)}
                  </span>
                </div>
                {selectedQuotation.discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Authorized Discount ({selectedQuotation.discountPercentage}%):</span>
                    <span>
                      -
                      {formatPaiseToRupees(
                        (selectedQuotation.baseCostPaise * selectedQuotation.discountPercentage) / 100
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">GST on Solar PV (Composite 13.8%):</span>
                  <span className="font-semibold text-slate-900">
                    {formatPaiseToRupees(selectedQuotation.taxPaise)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Total EPC Turnkey Amount:</span>
                  <span>{formatPaiseToRupees(selectedQuotation.totalAmountPaise)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg">
                  <span>Direct Benefit Transfer (DBT) National Subsidy:</span>
                  <span>- {formatPaiseToRupees(selectedQuotation.estimatedSubsidyPaise)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 text-base font-black text-navy-950">
                  <span>Effective Net Customer Cost:</span>
                  <span className="text-solar-600">
                    {formatPaiseToRupees(selectedQuotation.netCustomerPayablePaise)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Milestones */}
            <div className="py-3 text-xs">
              <span className="font-bold text-slate-900">Payment Milestones</span>
              <div className="mt-2 space-y-1.5">
                {(selectedQuotation.paymentMilestones || []).map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px] border border-slate-100"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{m.milestoneName}</span>
                      <div className="text-[10px] text-slate-500">{m.triggerEvent}</div>
                    </div>
                    <span className="font-bold text-slate-900">{formatPaiseToRupees(m.amountPaise)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => {
                  const kw = selectedQuotation.solarDesignId?.dcCapacityKw || 3;
                  const grossCost = Math.round(selectedQuotation.totalAmountPaise / 100);
                  const subsidyAmount = Math.round(selectedQuotation.estimatedSubsidyPaise / 100);
                  const netPayable = Math.round(selectedQuotation.netCustomerPayablePaise / 100);
                  const monthlyUnits = Math.round(kw * 125);
                  const annualUnits = monthlyUnits * 12;
                  const monthlySavings = Math.round(monthlyUnits * 7.5);
                  const annualSavings = monthlySavings * 12;
                  const paybackYears = annualSavings > 0 ? (netPayable / annualSavings).toFixed(1) : '3.5';

                  printProposalDocument({
                    proposalId: selectedQuotation.quotationNumber,
                    customerName: selectedQuotation.customerId?.name || 'Customer',
                    phone: selectedQuotation.customerId?.phone || '',
                    city: selectedQuotation.customerId?.city || 'Pune',
                    address: selectedQuotation.customerId?.billingAddress || '',
                    capacityKw: kw,
                    ratePerKw: Math.round(grossCost / kw),
                    grossCost,
                    discountPercent: selectedQuotation.discountPercentage || 0,
                    subsidyAmount,
                    netPayable,
                    monthlyUnits,
                    annualUnits,
                    monthlySavings,
                    annualSavings,
                    paybackYears,
                    lifetime25YrSavings: annualSavings * 25,
                    panelModel: selectedQuotation.solarDesignId?.panelModel,
                    inverterModel: selectedQuotation.solarDesignId?.inverterModel,
                  });
                }}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-lg flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print / Save PDF</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const phone = (selectedQuotation.customerId?.phone || '').replace(/\D/g, '');
                    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
                    const custName = selectedQuotation.customerId?.name || 'Customer';
                    const kw = selectedQuotation.solarDesignId?.dcCapacityKw || 3;
                    const totalRs = formatPaiseToRupees(selectedQuotation.totalAmountPaise);
                    const subRs = formatPaiseToRupees(selectedQuotation.estimatedSubsidyPaise);
                    const netRs = formatPaiseToRupees(selectedQuotation.netCustomerPayablePaise);

                    const text = `☀️ *HELIOSOPS SOLAR EPC - OFFICIAL QUOTATION* ☀️\n\nNamaste *${custName}* ji! 🙏\nHere is your official solar quotation *${selectedQuotation.quotationNumber}*:\n\n⚡ Capacity: *${kw} kW Grid-Tied Solar System*\n💰 Turnkey Cost: *${totalRs}*\n🎁 PM Surya Ghar Subsidy: *- ${subRs}*\n✨ *Net Payable: ${netRs}*\n\n25-Year Performance Warranty & Turnkey Net-Metering included.\nPlease reply to confirm your work order!\nHeliosOps Solar EPC`;

                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp (wa.me)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedQuotation(null)}
                  className="px-4 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Solar Design Modal */}
      {showNewDesignModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Generate Solar PV System Design</h2>
            <p className="text-xs text-slate-500 mb-4">Compute module count, inverter sizing, and BOQ</p>

            <form onSubmit={handleCreateDesign} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Target Customer</label>
                <select
                  required
                  value={designForm.customerId}
                  onChange={(e) => setDesignForm({ ...designForm, customerId: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.customerId}) - {c.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">DC Capacity (kW)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={designForm.dcCapacityKw}
                    onChange={(e) =>
                      setDesignForm({
                        ...designForm,
                        dcCapacityKw: Number(e.target.value),
                        acCapacityKw: Math.min(Number(e.target.value), 3),
                      })
                    }
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">AC Inverter Capacity (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={designForm.acCapacityKw}
                    onChange={(e) => setDesignForm({ ...designForm, acCapacityKw: Number(e.target.value) })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Module Model (ALMM Certified)</label>
                <input
                  type="text"
                  required
                  value={designForm.panelModel}
                  onChange={(e) => setDesignForm({ ...designForm, panelModel: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Grid Inverter Specification</label>
                <input
                  type="text"
                  required
                  value={designForm.inverterModel}
                  onChange={(e) => setDesignForm({ ...designForm, inverterModel: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDesignModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg"
                >
                  Generate BOQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Quotation Modal */}
      {showNewQuoteModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Generate Commercial Quotation</h2>
            <p className="text-xs text-slate-500 mb-4">Attach an approved design, apply discount, and compute taxes</p>

            <form onSubmit={handleCreateQuotation} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Select Approved Solar Design</label>
                <select
                  required
                  value={quoteForm.solarDesignId}
                  onChange={(e) => {
                    const des = designs.find((d) => d._id === e.target.value);
                    setQuoteForm({
                      ...quoteForm,
                      solarDesignId: e.target.value,
                      customerId: des?.customerId?._id || quoteForm.customerId,
                    });
                  }}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  {designs.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.designId} ({d.dcCapacityKw} kW - {d.customerId?.name})
                    </option>
                  ))}
                  {designs.length === 0 && <option value="">No approved designs available</option>}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={quoteForm.discountPercentage}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, discountPercentage: Number(e.target.value) })
                  }
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  * Discounts above 5% automatically require Sales Manager or Director approval.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewQuoteModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={designs.length === 0}
                  className="px-4 py-2 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg disabled:opacity-50"
                >
                  Issue Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
