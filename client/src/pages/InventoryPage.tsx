import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { InventoryItem, Project } from '../types';
import { formatPaiseToRupees } from '../utils/formatters';
import {
  Boxes,
  Truck,
  Plus,
  AlertTriangle,
  CheckCircle2,
  PackagePlus,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'dispatches'>('stock');

  // Inward Modal
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [inwardForm, setInwardForm] = useState({
    sku: '',
    qty: 10,
    unitCostPaise: 1250000,
    referenceId: 'PO-2026-0044',
    notes: 'Received from Waaree / Growatt primary distributor',
  });

  // Dispatch Modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    projectId: '',
    vehicleNumber: 'MH 12 QX 4545',
    driverName: 'Santosh Pawar',
    driverPhone: '+91 99220 88771',
    sku: 'MOD-WAAREE-545W',
    qty: 6,
  });

  const loadData = async () => {
    try {
      const [invRes, dispRes, projRes] = await Promise.all([
        api.getInventory(),
        api.getDispatches(),
        api.getProjects(),
      ]);
      setItems(invRes.items);
      setDispatches(dispRes.dispatches);
      setProjects(projRes.projects);
      if (invRes.items.length > 0) {
        setInwardForm((prev) => ({ ...prev, sku: invRes.items[0].sku }));
        setDispatchForm((prev) => ({ ...prev, sku: invRes.items[0].sku }));
      }
      if (projRes.projects.length > 0) {
        setDispatchForm((prev) => ({ ...prev, projectId: projRes.projects[0]._id }));
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

  const handleInward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inwardStock(inwardForm);
      setShowInwardModal(false);
      loadData();
      alert('Stock inward recorded and inventory balance updated!');
    } catch (err: any) {
      alert(err.message || 'Inward failed');
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const selItem = items.find((i) => i.sku === dispatchForm.sku);
    try {
      await api.dispatchMaterial({
        projectId: dispatchForm.projectId,
        vehicleNumber: dispatchForm.vehicleNumber,
        driverName: dispatchForm.driverName,
        driverPhone: dispatchForm.driverPhone,
        items: [
          {
            sku: dispatchForm.sku,
            itemName: selItem?.name || dispatchForm.sku,
            qty: Number(dispatchForm.qty),
            unit: selItem?.unit || 'NOS',
          },
        ],
      });
      setShowDispatchModal(false);
      loadData();
      alert('Material dispatch challan created and stock deducted!');
    } catch (err: any) {
      alert(err.message || 'Dispatch failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Warehouse Logistics & Stock Movements
          </h1>
          <p className="text-xs text-slate-500">
            Real-time stock valuation, goods receipt inwards, and project delivery challans
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInwardModal(true)}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-navy-950 hover:bg-navy-900 text-white font-semibold text-xs shadow-sm transition"
          >
            <ArrowDownLeft className="w-4 h-4 mr-1.5 text-emerald-400" />
            <span>Receive Inward Stock</span>
          </button>
          <button
            onClick={() => setShowDispatchModal(true)}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold text-xs shadow-sm transition"
          >
            <Truck className="w-4 h-4 mr-1.5" />
            <span>Dispatch to Site</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'stock'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Warehouse Stock Master ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('dispatches')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'dispatches'
              ? 'border-solar-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Site Delivery Challans ({dispatches.length})
        </button>
      </div>

      {/* Stock Master Content */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Item & Make</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Total Physical</th>
                  <th className="py-3 px-4">Reserved</th>
                  <th className="py-3 px-4">Available Free</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => {
                  const free = Math.max(0, it.currentStock - it.reservedStock);
                  const isLow = it.currentStock <= it.reorderLevel;

                  return (
                    <tr key={it._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{it.sku}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{it.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {it.manufacturer} • Model: {it.modelNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{it.category.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {it.currentStock} {it.unit}
                      </td>
                      <td className="py-3 px-4 text-amber-600 font-semibold">
                        {it.reservedStock} {it.unit}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-navy-950">
                        {free} {it.unit}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatPaiseToRupees(it.unitCostPaise)}
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            <span>Low Stock Alert</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            <span>Healthy Stock</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispatches Content */}
      {activeTab === 'dispatches' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Challan No</th>
                  <th className="py-3 px-4">Project ID</th>
                  <th className="py-3 px-4">Vehicle & Driver</th>
                  <th className="py-3 px-4">Items Loaded</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispatches.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.challanNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {d.projectId?.projectId || d.workOrderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{d.vehicleNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        {d.driverName} ({d.driverPhone})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {(d.items || []).map((itm: any, idx: number) => (
                        <div key={idx} className="text-slate-800">
                          {itm.qty}x {itm.itemName}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inward Modal */}
      {showInwardModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Receive Inward Goods Receipt</h2>
            <p className="text-xs text-slate-500 mb-4">Stock addition from manufacturer / distributor delivery</p>

            <form onSubmit={handleInward} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Inventory SKU</label>
                <select
                  required
                  value={inwardForm.sku}
                  onChange={(e) => setInwardForm({ ...inwardForm, sku: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  {items.map((i) => (
                    <option key={i.sku} value={i.sku}>
                      {i.name} ({i.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Quantity Received</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={inwardForm.qty}
                  onChange={(e) => setInwardForm({ ...inwardForm, qty: Number(e.target.value) })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Purchase Order / Invoice Ref</label>
                <input
                  type="text"
                  required
                  value={inwardForm.referenceId}
                  onChange={(e) => setInwardForm({ ...inwardForm, referenceId: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInwardModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white font-semibold rounded-lg"
                >
                  Receive Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Generate Site Delivery Challan</h2>
            <p className="text-xs text-slate-500 mb-4">Deduct stock and issue official transport challan</p>

            <form onSubmit={handleDispatch} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Target Project</label>
                <select
                  required
                  value={dispatchForm.projectId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, projectId: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectId} ({p.systemCapacityKw} kW - {p.customerId?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.vehicleNumber}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Driver Contact</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.driverPhone}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">SKU</label>
                  <select
                    value={dispatchForm.sku}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, sku: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {items.map((i) => (
                      <option key={i.sku} value={i.sku}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dispatchForm.qty}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, qty: Number(e.target.value) })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-solar-500 hover:bg-solar-600 text-navy-950 font-bold rounded-lg shadow-sm"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
