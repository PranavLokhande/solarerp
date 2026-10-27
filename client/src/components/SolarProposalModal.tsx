import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { api } from '../api/client';
import { printProposalDocument } from '../utils/printProposal';
import {
  X,
  Send,
  Printer,
  Copy,
  Check,
  Zap,
  Sun,
  ShieldCheck,
  TrendingUp,
  FileText,
  IndianRupee,
  Building,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface SolarProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onProposalSent?: () => void;
}

export const SolarProposalModal: React.FC<SolarProposalModalProps> = ({
  isOpen,
  onClose,
  lead,
  onProposalSent,
}) => {
  if (!isOpen || !lead) return null;

  // Commercial parameters
  const [capacityKw, setCapacityKw] = useState<number>(lead.preferredCapacityKw || 3);
  const [ratePerKw, setRatePerKw] = useState<number>(58000);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'whatsapp' | 'document'>('preview');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate PM Surya Ghar Subsidy based on MNRE rules
  const calculateSubsidy = (kw: number) => {
    if (kw <= 0) return 0;
    if (kw < 2) return 30000;
    if (kw < 3) return 60000;
    return 78000; // 3 kW and above is capped at ₹78,000
  };

  const subsidyAmount = calculateSubsidy(capacityKw);
  const grossCost = Math.round(capacityKw * ratePerKw * (1 - discountPercent / 100));
  const netPayable = Math.max(0, grossCost - subsidyAmount);

  // Generation & Savings metrics
  const monthlyUnits = Math.round(capacityKw * 125); // ~125 units per kW/month in India
  const annualUnits = monthlyUnits * 12;
  const estimatedTariffPerUnit = 7.5; // Average residential DISCOM unit tariff in INR
  const monthlySavings = Math.round(monthlyUnits * estimatedTariffPerUnit);
  const annualSavings = monthlySavings * 12;
  const paybackYears = annualSavings > 0 ? (netPayable / annualSavings).toFixed(1) : '3.5';
  const lifetime25YrSavings = Math.round(annualSavings * 25);

  const proposalId = `PROP-2026-${lead.leadId?.replace('LEAD-', '') || '004'}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Clean phone number for WhatsApp wa.me link
  const getCleanWhatsAppNumber = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
  };

  const recipientPhone = getCleanWhatsAppNumber(lead.phone);

  // Pre-formatted WhatsApp Message text
  const whatsappMessage = `☀️ *HELIOSOPS SOLAR EPC - OFFICIAL ROOFTOP QUOTATION* ☀️
--------------------------------------------------
Namaste *${lead.customerName}* ji! 🙏
Thank you for your interest in Rooftop Solar with HeliosOps EPC for your property in *${lead.city || 'Maharashtra'}*.

Here is your customized Solar Proposal Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ *System Capacity:* ${capacityKw.toFixed(1)} kW Grid-Tied Solar
📊 *Estimated Generation:* ~${monthlyUnits} Units/month (~${annualUnits} Units/year)
💰 *Total Turnkey Project Cost:* ₹${grossCost.toLocaleString('en-IN')}
🎁 *PM Surya Ghar Govt Subsidy:* ₹${subsidyAmount.toLocaleString('en-IN')} (Direct to your Bank)
━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *YOUR NET INVESTMENT: ₹${netPayable.toLocaleString('en-IN')} ONLY*
━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Financial Returns & Savings:*
• Est. Monthly Electricity Savings: *~₹${monthlySavings.toLocaleString('en-IN')}/month*
• Est. Annual Savings: *~₹${annualSavings.toLocaleString('en-IN')}/year*
• Simple Payback Period: *~${paybackYears} Years*
• 25-Year Cumulative Savings: *~₹${(lifetime25YrSavings / 100000).toFixed(1)} Lakhs*

🛠️ *Scope of Turnkey EPC Installation:*
✔ ALMM Certified 550W Mono PERC / TOPCon Solar Panels (25-Yr Performance Warranty)
✔ High-Efficiency Grid-Tied Smart Inverter with Mobile App Wi-Fi Monitoring
✔ Hot-Dip Galvanized (HDG) Elevated Structure designed for 150 km/h wind loads
✔ Dual Chemical Earthing & Class-II Lightning Surge Protection
✔ Complete End-to-End DISCOM Net-Metering Sanction & PM Surya Ghar Subsidy Liaisoning

📄 *Proposal Reference:* ${proposalId}
📅 *Validity:* 15 Days from ${currentDate}

👉 *Next Step:*
Reply *YES* to this WhatsApp message or call us at *+91 98220 11223* to confirm your site inspection and lock in your PM Surya Ghar central subsidy slot!

Warm Regards,
*HeliosOps Solar EPC Solutions*
Pune Central Operations Hub
🌐 www.heliosops.com | 📞 +91 98220 11223`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update lead stage to PROPOSAL_SENT
      await api.updateLead(lead._id, { stage: 'PROPOSAL_SENT' });

      // 2. Log activity note on lead
      await api.addLeadActivity(lead._id, {
        type: 'WHATSAPP',
        note: `Solar Proposal (${capacityKw} kW, Net ₹${netPayable.toLocaleString('en-IN')}) dispatched via WhatsApp to ${lead.phone}`,
      });

      // 3. Open WhatsApp Web / App using wa.me link
      const waUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(waUrl, '_blank');

      if (onProposalSent) onProposalSent();
    } catch (err: any) {
      alert(err.message || 'Failed to update lead status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printProposalDocument({
      proposalId,
      customerName: lead.customerName,
      phone: lead.phone,
      city: lead.city,
      state: lead.state,
      address: lead.address,
      capacityKw,
      ratePerKw,
      grossCost,
      discountPercent,
      subsidyAmount,
      netPayable,
      monthlyUnits,
      annualUnits,
      monthlySavings,
      annualSavings,
      paybackYears,
      lifetime25YrSavings,
    });
  };

  return (
    <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Modal Navigation Header (Screen only) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-solar-500/20 border border-solar-500/40 flex items-center justify-center text-solar-400 font-bold">
              <Sun className="w-5 h-5 text-solar-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">Solar Proposal & Quotation Dispatch</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-solar-500 text-navy-950 font-bold">
                  {proposalId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customer: <span className="text-slate-200 font-semibold">{lead.customerName}</span> ({lead.phone}) • {lead.city}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection (Screen only) */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'preview'
                  ? 'bg-white text-navy-950 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Proposal Calculator & Specs
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>2. WhatsApp Dispatch (wa.me)</span>
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'document'
                  ? 'bg-white text-navy-950 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Formal Printable PDF Quotation</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              <span>Download / Print PDF</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              disabled={isSubmitting}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
              title="Open WhatsApp with proposal quote"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs">
          {/* TAB 1: INTERACTIVE CALCULATOR */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Parameter Configuration */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proposed Capacity (kW)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="100"
                      value={capacityKw}
                      onChange={(e) => setCapacityKw(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-navy-950 text-sm focus:ring-2 focus:ring-solar-500"
                    />
                    <span className="font-bold text-slate-500">kW</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Lead Requested: {lead.preferredCapacityKw || 3} kW</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Turnkey Rate per kW (₹)</label>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      step="1000"
                      value={ratePerKw}
                      onChange={(e) => setRatePerKw(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Includes Panels, Inverter, Structure, GST & Net Meter</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Special Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Festival / Early-bird incentive</p>
                </div>
              </div>

              {/* Financial Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Gross Project Cost</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    ₹{grossCost.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Inclusive of 13.8% Composite GST</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    PM Surya Ghar Subsidy
                  </span>
                  <div className="text-xl font-bold text-emerald-800 mt-1">
                    - ₹{subsidyAmount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-600">Central DBT Govt Incentive</span>
                </div>

                <div className="p-4 rounded-xl bg-solar-50 border border-solar-300 shadow-sm">
                  <span className="text-[11px] text-navy-900 font-bold">Net Customer Investment</span>
                  <div className="text-2xl font-black text-navy-950 mt-1">
                    ₹{netPayable.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-solar-800 font-semibold">Effective Out-of-Pocket Cost</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[11px] text-blue-700 font-medium flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    Simple Payback Period
                  </span>
                  <div className="text-xl font-bold text-blue-900 mt-1">{paybackYears} Years</div>
                  <span className="text-[10px] text-blue-600">Free power for next 21+ years!</span>
                </div>
              </div>

              {/* Technical BOQ & Bill Savings Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <Zap className="w-4 h-4 mr-1.5 text-solar-500" />
                    <span>Technical Bill of Materials (BOQ)</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Solar PV Modules:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        Waaree / Tata Power 550W DCR Mono PERC ({Math.ceil((capacityKw * 1000) / 550)} Modules)
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Grid Inverter:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        Growatt / Solis {capacityKw} kW MPPT On-Grid (WiFi App)
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Mounting Structure:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        Hot-Dip Galvanized (HDG) Elevated Rooftop
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Safety & Protection:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        Dual Chemical Earthing & Class-II Lightning Arrester
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Net Metering:</span>
                      <span className="font-semibold text-emerald-700 text-right">
                        Turnkey DISCOM Sanction & Testing Included
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-600" />
                    <span>Energy Generation & Savings Forecast</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Avg. Monthly Generation:</span>
                      <span className="font-semibold text-slate-800 font-mono">~{monthlyUnits} kWh (Units)</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Avg. Annual Generation:</span>
                      <span className="font-semibold text-slate-800 font-mono">~{annualUnits} kWh (Units)</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Est. Monthly Bill Savings:</span>
                      <span className="font-bold text-emerald-700">~₹{monthlySavings.toLocaleString('en-IN')} / mo</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Est. Annual Bill Savings:</span>
                      <span className="font-bold text-emerald-700">~₹{annualSavings.toLocaleString('en-IN')} / year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">25-Year Cumulative Savings:</span>
                      <span className="font-black text-navy-950">
                        ~₹{(lifetime25YrSavings / 100000).toFixed(2)} Lakhs
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Ready to send this Proposal to Customer?</h4>
                    <p className="text-xs text-emerald-700">
                      Dispatch directly on WhatsApp via <span className="font-mono font-bold">wa.me</span> or print formal PDF letterhead.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('whatsapp')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Proceed to WhatsApp Dispatch</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHATSAPP DISPATCH */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm flex items-center">
                    <Send className="w-4 h-4 mr-1.5 text-emerald-600" />
                    <span>Instant WhatsApp Quotation Dispatch via wa.me (100% Free)</span>
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Target Recipient: <span className="font-bold font-mono text-emerald-950">{lead.phone}</span> ({recipientPhone})
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 rounded-lg hover:bg-emerald-100/50 transition flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open WhatsApp & Mark as Sent</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Message Preview Box */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-400/30 flex items-center justify-center font-bold text-[11px]">
                      {lead.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{lead.customerName}</div>
                      <div className="text-[10px] text-emerald-200">Online • {lead.phone}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-100">WhatsApp Preview</span>
                </div>

                <div className="p-4 bg-[#E5DDD5] min-h-[300px] flex justify-start">
                  <div className="bg-white p-3.5 rounded-lg rounded-tl-none shadow-sm max-w-xl text-slate-800 font-sans text-xs whitespace-pre-wrap leading-relaxed border border-slate-200">
                    {whatsappMessage}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Operations Tip:</strong> Clicking "Open WhatsApp & Mark as Sent" automatically transitions this lead’s pipeline status to <strong>PROPOSAL SENT</strong> in HeliosOps CRM, records a timestamped communication log in the lead activity feed, and opens WhatsApp Web/Mobile with this pre-filled quote ready to send!
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: FORMAL PRINTABLE PDF PROPOSAL */}
          {activeTab === 'document' && (
            <div>
              <div className="no-print mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="text-xs text-blue-900">
                  <strong>Corporate Proposal Letterhead:</strong> Click below to print or download as a PDF document for your customer.
                </div>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition"
                >
                  <Printer className="w-4 h-4 text-solar-400" />
                  <span>Download / Print Proposal PDF</span>
                </button>
              </div>

              {/* Printable Area with ID */}
              <div
                id="printable-proposal"
                className="bg-white border border-slate-200 rounded-xl p-8 max-w-3xl mx-auto text-slate-800 font-sans shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-solar-400 font-black text-lg">
                        ☀️
                      </div>
                      <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">HELIOSOPS SOLAR EPC</h1>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Rooftop Solar PV Solutions • MNRE Registered Channel Partner
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 space-y-0.5">
                      <p>Pune Central Operations Hub, Maharashtra 411005</p>
                      <p>Email: contact@heliosops.com | Phone: +91 98220 11223</p>
                      <p>CIN: U40106PN2026PTC198822 | GSTIN: 27AABCH1234F1Z8</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-mono font-bold text-xs rounded border border-slate-300">
                      {proposalId}
                    </span>
                    <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                      <p>Date: <strong className="text-slate-900">{currentDate}</strong></p>
                      <p>Validity: <strong>15 Days</strong></p>
                      <p>Scheme: <strong>PM Surya Ghar Muft Bijli</strong></p>
                    </div>
                  </div>
                </div>

                {/* Customer Information Block */}
                <div className="my-6 p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Proposal Prepared For:</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{lead.customerName}</div>
                    <p className="text-slate-600 mt-1">{lead.address || 'Nagpur City'}, {lead.city}, {lead.state}</p>
                    <p className="text-slate-600">Contact: {lead.phone} {lead.email && `• ${lead.email}`}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">System Specifications:</span>
                    <div className="font-bold text-navy-950 text-sm mt-0.5">{capacityKw} kW On-Grid Solar PV</div>
                    <p className="text-slate-600 mt-1">Grid Phase: Single Phase / Three Phase</p>
                    <p className="text-slate-600">DISCOM: MSEDCL Net-Metering</p>
                  </div>
                </div>

                {/* Financial Summary Table */}
                <div className="my-6">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    1. Commercial Investment Breakdown
                  </h3>
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="py-2 px-3">
                          Total Turnkey EPC Plant Cost ({capacityKw} kW @ ₹{ratePerKw.toLocaleString('en-IN')}/kW)
                          <div className="text-[10px] text-slate-500">
                            Includes Solar PV Modules, Inverter, Structure, Cabling, Switchgear & Installation
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-semibold">
                          ₹{grossCost.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      {discountPercent > 0 && (
                        <tr className="text-rose-600">
                          <td className="py-2 px-3">Special Promotional Discount ({discountPercent}%)</td>
                          <td className="py-2 px-3 text-right font-semibold">
                            - ₹{Math.round((capacityKw * ratePerKw * discountPercent) / 100).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-emerald-50 text-emerald-800 font-bold">
                        <td className="py-2 px-3">
                          PM Surya Ghar Muft Bijli Yojana Central Govt DBT Subsidy
                          <div className="text-[10px] text-emerald-600 font-normal">
                            Direct Benefit Transfer to Customer Bank A/c upon Commissioning
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-800">
                          - ₹{subsidyAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr className="bg-slate-900 text-white font-bold text-sm">
                        <td className="py-2.5 px-3">Effective Net Customer Payable Amount:</td>
                        <td className="py-2.5 px-3 text-right text-solar-400">
                          ₹{netPayable.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Energy & Financial Return Metrics */}
                <div className="my-6 grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Monthly Generation</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">~{monthlyUnits} Units</div>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Annual Bill Savings</div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">
                      ~₹{annualSavings.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Payback Period</div>
                    <div className="text-sm font-bold text-blue-900 mt-0.5">~{paybackYears} Years</div>
                  </div>
                </div>

                {/* Scope of Supply */}
                <div className="my-6">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    2. Scope of Equipment & Warranties
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                    <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                      <strong>Solar Modules:</strong> Tier-1 ALMM 550W Mono PERC Bifacial (25-Yr Performance Warranty)
                    </div>
                    <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                      <strong>Grid Inverter:</strong> IP65 On-Grid Inverter with Wi-Fi Cloud Monitoring (5-Yr Warranty)
                    </div>
                    <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                      <strong>Structure:</strong> Elevated Hot-Dip Galvanized (HDG) 80-micron zinc coating
                    </div>
                    <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                      <strong>Electrical & Earthing:</strong> Dual Chemical Earthing, LA & Fire-Retardant FRLS Cabling
                    </div>
                  </div>
                </div>

                {/* Payment Milestones & Bank Details */}
                <div className="my-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Standard Payment Terms:</h4>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      <li>20% Advance with Work Order Booking</li>
                      <li>60% Upon Material Dispatch at Site</li>
                      <li>15% Upon Physical Installation & Inverter Wiring</li>
                      <li>5% Upon Net Metering & Inspection Sign-Off</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Bank Account for Advance Booking:</h4>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p>Beneficiary: <strong>HeliosOps Solar EPC Pvt Ltd</strong></p>
                      <p>Bank: <strong>HDFC Bank Ltd</strong> | Branch: Shivaji Nagar, Pune</p>
                      <p>A/C No: <strong>50200088992211</strong> (Current)</p>
                      <p>IFSC: <strong>HDFC0000039</strong></p>
                    </div>
                  </div>
                </div>

                {/* Sign-off footer */}
                <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400">System Generated Document • HeliosOps EPC Platform</p>
                    <p className="text-[10px] text-slate-400">HeliosOps Solar EPC Solutions, Maharashtra</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-semibold text-[11px] text-slate-800">
                      Authorized Signatory
                    </div>
                    <p className="text-[10px] text-slate-500">HeliosOps Solar Commercial Division</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <div className="text-xs text-slate-500">
            Current Stage: <span className="font-semibold text-slate-800">{lead.stage}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-xs transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-xs flex items-center space-x-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp (`wa.me`)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
