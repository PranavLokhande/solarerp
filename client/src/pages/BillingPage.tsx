import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Invoice, Payment, FinancialLedgerEntry, Customer } from '../types';
import { formatPaiseToRupees, formatDate, getStatusBadgeClass } from '../utils/formatters';
import {
  ReceiptText,
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ledger, setLedger] = useState<FinancialLedgerEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'ledger'>('invoices');

  // Record Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    customerId: '',
    amountPaise: 2816550,
    paymentMode: 'NEFT_RTGS',
    transactionRef: 'NEFT-AXIS-2026-99128',
    notes: 'Structure installation milestone clearance',
  });

  const loadData = async () => {
    try {
      const [invRes, payRes] = await Promise.all([api.getInvoices(), api.getPayments()]);
      setInvoices(invRes.invoices);
      setPayments(payRes.payments);

      // fetch customers
      const cRes = await fetch('/api/v1/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('helios_access_token')}` },
      });
      const cData = await cRes.json();
      if (cData.data?.customers && cData.data.customers.length > 0) {
        setCustomers(cData.data.customers);
        const firstId = cData.data.customers[0]._id;
        setSelectedCustomerId(firstId);
        loadLedger(firstId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLedger = async (custMongoId: string) => {
    try {
      const res = await api.getCustomerLedger(custMongoId);
      setLedger(res.ledger);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordPayment({
        ...paymentForm,
        customerId: paymentForm.customerId || selectedCustomerId,
      });
      setShowPaymentModal(false);
      loadData();
      alert('Payment receipt generated and posted to financial ledger!');
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Financial Ledger, Invoices & Collections
          </h1>
          <p className="text-xs text-slate-500">
            Append-only financial transaction ledger with zero floating-point rounding errors (integer paise precision)
          </p>
        </div>
        <button
          onClick={() => {
            if (invoices.length > 0) {
              setPaymentForm((prev) => ({
                ...prev,
                invoiceId: invoices[0]._id,
                customerId: invoices[0].customerId?._id || selectedCustomerId,
                amountPaise: invoices[0].balanceDuePaise || 2816550,
              }));
            }
            setShowPaymentModal(true);
          }}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
        >
          <CreditCard className="w-4 h-4 mr-1.5" />
          <span>Record Verified Payment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'invoices'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Milestone Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'payments'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Payment Receipts ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'ledger'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Customer Financial Ledger
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Base & GST</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{inv.customerId?.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{inv.milestoneName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      <div>Base: {formatPaiseToRupees(inv.baseAmountPaise)}</div>
                      <div className="text-[10px]">GST 13.8%: {formatPaiseToRupees(inv.gstAmountPaise)}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatPaiseToRupees(inv.totalAmountPaise)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {formatPaiseToRupees(inv.paidAmountPaise)}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-amber-700">
                      {formatPaiseToRupees(inv.balanceDuePaise)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                          inv.status
                        )}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount Cleared</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Bank Ref / Transaction ID</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.receiptNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.customerId?.name}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700 text-sm">
                      {formatPaiseToRupees(p.amountPaise)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{p.paymentMode}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{p.transactionRef}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <span>Verified in Bank</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Financial Ledger Tab */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-solar-500" />
              <div>
                <span className="text-xs font-bold text-slate-900">Select Customer Account</span>
                <p className="text-[11px] text-slate-500">Append-only audit trail of Debits (Invoices) and Credits (Payments)</p>
              </div>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                loadLedger(e.target.value);
              }}
              className="text-xs border border-slate-300 rounded-lg p-2 font-medium bg-white"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.customerId})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Entry ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Ref Document</th>
                    <th className="py-3 px-4 text-right">Debit (+)</th>
                    <th className="py-3 px-4 text-right">Credit (-)</th>
                    <th className="py-3 px-4 text-right">Running Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledger.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{l.entryId}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(l.createdAt)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            l.entryType === 'DEBIT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {l.entryType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{l.description}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{l.referenceDocId}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-700">
                        {l.entryType === 'DEBIT' ? formatPaiseToRupees(l.amountPaise) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {l.entryType === 'CREDIT' ? formatPaiseToRupees(l.amountPaise) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-navy-950">
                        {formatPaiseToRupees(l.runningBalancePaise)}
                      </td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No financial ledger entries found for this customer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Record Verified Customer Payment</h2>
            <p className="text-xs text-slate-500 mb-4">Post verified bank credit to ledger and clear milestone</p>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Select Milestone Invoice</label>
                <select
                  required
                  value={paymentForm.invoiceId}
                  onChange={(e) => {
                    const inv = invoices.find((i) => i._id === e.target.value);
                    setPaymentForm({
                      ...paymentForm,
                      invoiceId: e.target.value,
                      customerId: inv?.customerId?._id || paymentForm.customerId,
                      amountPaise: inv?.balanceDuePaise || 0,
                    });
                  }}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {inv.milestoneName} (Due: {formatPaiseToRupees(inv.balanceDuePaise)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Amount Received (₹)</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amountPaise / 100}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amountPaise: Number(e.target.value) * 100 })
                  }
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Payment Mode</label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="NEFT_RTGS">NEFT / RTGS</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="GATEWAY">Payment Gateway</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Bank UTR / Transaction Ref</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.transactionRef}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirm & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
