import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatDate } from '../utils/formatters';
import { Users, Briefcase, Plus, MapPin, Mail, Phone, Shield } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite Employee Form
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Sales Executive',
    designation: 'Solar Technical Consultant',
    password: 'Solar@2026',
  });

  const loadData = async () => {
    try {
      const [empRes, bRes, dRes] = await Promise.all([
        api.getEmployees(),
        api.getBranches(),
        api.getDepartments(),
      ]);
      setEmployees(empRes.employees);
      setBranches(bRes.branches);
      setDepartments(dRes.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEmployee(inviteForm);
      setShowInviteModal(false);
      loadData();
      alert('Employee account successfully created and provisioned!');
    } catch (err: any) {
      alert(err.message || 'Creation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Workforce Directory & Branch Organization
          </h1>
          <p className="text-xs text-slate-500">
            Internal EPC employee administration, role permissions, and branch assignments
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Provision Employee</span>
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Official Email & Phone</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Branch Hub</th>
                <th className="py-3 px-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{emp.employeeId || 'EMP-ADMIN'}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{emp.fullName}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800">{emp.email}</div>
                    <div className="text-[11px] text-slate-400">{emp.phone || '+91 98220 00000'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-navy-50 text-navy-900 border border-navy-200">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {emp.branchId?.name || 'Pune Central HQ'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Employee Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Provision New Employee Account</h2>
            <p className="text-xs text-slate-500 mb-4">Grant access to internal EPC operational modules</p>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="name@heliosops.com"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">System Role Assignment</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Site Survey Engineer">Site Survey Engineer</option>
                  <option value="Design Engineer">Design Engineer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Installation Technician">Installation Technician</option>
                  <option value="Quality Assurance Engineer">Quality Assurance Engineer</option>
                  <option value="Finance Executive">Finance Executive</option>
                  <option value="Warehouse Manager">Warehouse Manager</option>
                  <option value="Government Portal / DISCOM Coordinator">DISCOM Coordinator</option>
                  <option value="Customer Support Executive">Customer Support Executive</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg shadow-sm"
                >
                  Create & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
