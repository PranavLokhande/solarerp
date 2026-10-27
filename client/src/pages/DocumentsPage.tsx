import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ProjectDocument, Customer } from '../types';
import { formatDate, getStatusBadgeClass } from '../utils/formatters';
import {
  FolderLock,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [selectedDocForMismatch, setSelectedDocForMismatch] = useState<ProjectDocument | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    customerId: '',
    category: 'ELECTRICITY_BILL',
    title: 'Latest Electricity Bill Copy',
    fileUrl: '/uploads/sample_bill.pdf',
  });

  // Name Mismatch Form State
  const [mismatchForm, setMismatchForm] = useState({
    nameOnBill: 'Late Raghunath Sharma',
    nameOnId: 'Rajesh Raghunath Sharma',
    requestedCorrectName: 'Rajesh Raghunath Sharma',
    discomApplicationRef: 'MSEDCL-NAME-CORR-2026-8819',
  });

  const loadDocuments = async () => {
    try {
      const res = await api.getDocuments();
      setDocuments(res.documents);

      // fetch customers
      const cRes = await fetch('/api/v1/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('helios_access_token')}` },
      });
      const cData = await cRes.json();
      if (cData.data?.customers) {
        setCustomers(cData.data.customers);
        if (cData.data.customers.length > 0) {
          setUploadForm((prev) => ({ ...prev, customerId: cData.data.customers[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.uploadDocument(uploadForm);
      setShowUploadModal(false);
      loadDocuments();
      alert('Document securely stored in Document Vault!');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    }
  };

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const reason = status === 'REJECTED' ? prompt('Reason for document rejection:') : undefined;
    if (status === 'REJECTED' && !reason) return;
    try {
      await api.verifyDocument(id, { status, rejectionReason: reason });
      loadDocuments();
      alert(`Document marked as ${status}`);
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleNameMismatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForMismatch) return;
    try {
      await api.initiateNameCorrection({
        documentId: selectedDocForMismatch._id,
        ...mismatchForm,
      });
      setShowMismatchModal(false);
      setSelectedDocForMismatch(null);
      loadDocuments();
      alert('DISCOM Name Mismatch Correction process successfully initiated and tracked!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit correction');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">KYC & Document Vault</h1>
          <p className="text-xs text-slate-500">
            Secure private document storage, electricity bill verification, and DISCOM name correction tracking
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold text-xs shadow-sm transition"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Doc ID</th>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{doc.documentId}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{doc.title}</div>
                      {doc.nameMismatchDetails?.hasMismatch && (
                        <div className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 inline-flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          <span>Name Mismatch Flagged (DISCOM: {doc.nameMismatchDetails.discomApplicationRef})</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {doc.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {doc.customerId?.name || 'Customer'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(doc.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                          doc.status
                        )}`}
                      >
                        {doc.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {doc.status !== 'APPROVED' && (
                        <>
                          <button
                            onClick={() => handleVerify(doc._id, 'APPROVED')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 font-semibold"
                            title="Approve document"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerify(doc._id, 'REJECTED')}
                            className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100 font-semibold"
                            title="Reject document"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {doc.category === 'ELECTRICITY_BILL' && !doc.nameMismatchDetails?.hasMismatch && (
                        <button
                          onClick={() => {
                            setSelectedDocForMismatch(doc);
                            setShowMismatchModal(true);
                          }}
                          className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 font-semibold text-[11px]"
                          title="Name mismatch between Bill and ID proof"
                        >
                          Flag Name Mismatch
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

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Upload to Secure Document Vault</h2>
            <p className="text-xs text-slate-500 mb-4">KYC, Electricity Bills, and Regulatory Clearances</p>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Customer</label>
                <select
                  required
                  value={uploadForm.customerId}
                  onChange={(e) => setUploadForm({ ...uploadForm, customerId: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.customerId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Document Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      category: e.target.value,
                      title: `${e.target.value.replace(/_/g, ' ')} Copy`,
                    })
                  }
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="ELECTRICITY_BILL">Latest Electricity Bill</option>
                  <option value="AADHAAR_CARD">Aadhaar Card (Masked)</option>
                  <option value="PAN_CARD">PAN Card (Masked)</option>
                  <option value="PROPERTY_TAX_RECEIPT">Property Tax Receipt</option>
                  <option value="CANCELLED_CHEQUE">Cancelled Cheque (Subsidy Bank Account)</option>
                  <option value="SIGNED_AGREEMENT">Signed Solar EPC Contract</option>
                  <option value="DISCOM_APPROVAL">DISCOM Feasibility Approval Letter</option>
                  <option value="COMMISSIONING_CERTIFICATE">Commissioning Certificate</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg"
                >
                  Upload & Secure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Name Mismatch Workflow Modal */}
      {showMismatchModal && selectedDocForMismatch && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center text-amber-700">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
              <span>Initiate DISCOM Name Correction Workflow</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Track statutory name rectification when electricity bill name differs from applicant identity proof.
            </p>

            <form onSubmit={handleNameMismatch} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Name Appearing on Electricity Bill</label>
                <input
                  type="text"
                  required
                  value={mismatchForm.nameOnBill}
                  onChange={(e) => setMismatchForm({ ...mismatchForm, nameOnBill: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Name on Government ID Proof</label>
                <input
                  type="text"
                  required
                  value={mismatchForm.nameOnId}
                  onChange={(e) => setMismatchForm({ ...mismatchForm, nameOnId: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Requested Correct Name</label>
                <input
                  type="text"
                  required
                  value={mismatchForm.requestedCorrectName}
                  onChange={(e) => setMismatchForm({ ...mismatchForm, requestedCorrectName: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">DISCOM Application Reference Number</label>
                <input
                  type="text"
                  required
                  value={mismatchForm.discomApplicationRef}
                  onChange={(e) => setMismatchForm({ ...mismatchForm, discomApplicationRef: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMismatchModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold rounded-lg shadow-sm"
                >
                  Submit Correction Filing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
