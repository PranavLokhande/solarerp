import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Compass,
  Cpu,
  FileSpreadsheet,
  Workflow,
  FolderLock,
  Building2,
  Landmark,
  Boxes,
  ReceiptText,
  LifeBuoy,
  UserCircle,
  Briefcase,
  History,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isCustomer = user?.role === 'Customer';

  const navItems = isCustomer
    ? [
        { to: '/customer-portal', label: 'My Solar Project', icon: UserCircle },
        { to: '/quotations', label: 'My Quotation', icon: FileSpreadsheet },
        { to: '/documents', label: 'My Documents', icon: FolderLock },
        { to: '/billing', label: 'Payments & Receipts', icon: ReceiptText },
        { to: '/support', label: 'Help & Warranty', icon: LifeBuoy },
      ]
    : [
        { to: '/', label: 'Master Dashboard', icon: LayoutDashboard },
        { to: '/leads', label: 'Leads & CRM', icon: Users },
        { to: '/surveys', label: 'Site Surveys', icon: Compass },
        { to: '/designs', label: 'Solar Design & BOQ', icon: Cpu },
        { to: '/quotations', label: 'Quotations & Orders', icon: FileSpreadsheet },
        { to: '/projects', label: 'Project Operations', icon: Workflow },
        { to: '/documents', label: 'Document Vault & KYC', icon: FolderLock },
        { to: '/regulatory', label: 'DISCOM & Subsidy', icon: Building2 },
        { to: '/loans', label: 'Financing & Loans', icon: Landmark },
        { to: '/inventory', label: 'Warehouse & Stock', icon: Boxes },
        { to: '/billing', label: 'Invoices & Ledger', icon: ReceiptText },
        { to: '/support', label: 'Service & Warranty', icon: LifeBuoy },
        { to: '/customer-portal', label: 'Customer View Preview', icon: UserCircle },
        { to: '/employees', label: 'Workforce & Branch', icon: Briefcase },
        { to: '/audit', label: 'Compliance Audit', icon: History },
      ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {isCustomer ? 'Customer Portal' : 'Enterprise Modules'}
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-solar-500 text-navy-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        HeliosOps v1.0.0 • Solar EPC ERP
      </div>
    </aside>
  );
};
