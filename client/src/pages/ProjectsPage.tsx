import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Project } from '../types';
import { formatDate, getStageLabel, getStatusBadgeClass } from '../utils/formatters';
import {
  Workflow,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Layers,
  Zap,
  Gauge,
  Award,
  ChevronRight,
} from 'lucide-react';

const STAGES_SEQUENCE = [
  'PROJECT_INITIATED',
  'KYC_DOCUMENTS',
  'DISCOM_REGISTRATION',
  'MATERIAL_ALLOCATION',
  'MATERIAL_DISPATCHED',
  'STRUCTURE_INSTALLATION',
  'PANEL_INSTALLATION',
  'ELECTRICAL_AND_INVERTER',
  'QUALITY_INSPECTION',
  'NET_METER_APPLICATION',
  'NET_METER_INSTALLED',
  'COMMISSIONED',
];

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);

  // Advance Stage State
  const [nextStage, setNextStage] = useState('');
  const [stageNotes, setStageNotes] = useState('');

  const loadProjects = async () => {
    try {
      const res = await api.getProjects(search ? { search } : {});
      setProjects(res.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openProjectWorkspace = async (projId: string) => {
    setProjectDetailsLoading(true);
    try {
      const res = await api.getProjectById(projId);
      setSelectedProject(res);
      // Pre-select next logical stage
      const currentIdx = STAGES_SEQUENCE.indexOf(res.project.currentStage);
      if (currentIdx !== -1 && currentIdx < STAGES_SEQUENCE.length - 1) {
        setNextStage(STAGES_SEQUENCE[currentIdx + 1]);
      } else {
        setNextStage(res.project.currentStage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProjectDetailsLoading(false);
    }
  };

  const handleAdvanceStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !nextStage) return;
    try {
      await api.updateProjectStage(selectedProject.project._id, {
        stage: nextStage,
        notes: stageNotes || `Stage advanced to ${nextStage}`,
      });
      // Refresh current workspace
      await openProjectWorkspace(selectedProject.project._id);
      loadProjects();
      setStageNotes('');
      alert(`Project successfully updated to stage: ${getStageLabel(nextStage)}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update stage');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Operations & Execution</h1>
          <p className="text-xs text-slate-500">
            End-to-end solar EPC tracking: material dispatch, installation stages, inspections, and commissioning
          </p>
        </div>
      </div>

      {/* Projects List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plant Size</th>
                <th className="py-3 px-4">Current Execution Stage</th>
                <th className="py-3 px-4">Project Manager</th>
                <th className="py-3 px-4">Status / Blockers</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active solar projects found.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div>{p.projectId}</div>
                      <div className="text-[10px] text-slate-400 font-normal">WO: {p.workOrderNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.customerId?.name}
                      <div className="text-[11px] text-slate-400 font-normal">{p.customerId?.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-navy-950">{p.systemCapacityKw} kW</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {getStageLabel(p.currentStage)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {p.assignedProjectManagerName || 'Sameer Joshi'}
                    </td>
                    <td className="py-3 px-4">
                      {p.isBlocked ? (
                        <span className="inline-flex items-center text-rose-600 text-[11px] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          <span>Blocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-emerald-600 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          <span>On Track</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openProjectWorkspace(p._id)}
                        className="px-3 py-1 bg-navy-950 text-white rounded text-xs hover:bg-navy-900 font-medium transition inline-flex items-center"
                      >
                        <span>Workspace 360</span>
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project 360 Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-slate-900">{selectedProject.project.projectId}</span>
                  <span className="text-xs bg-solar-500 text-navy-950 font-bold px-2 py-0.5 rounded">
                    {selectedProject.project.systemCapacityKw} kW Rooftop Solar
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer: {selectedProject.project.customerId?.name} • WO: {selectedProject.project.workOrderNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Visual Multi-Stage Progress Timeline */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Lifecycle Stage Sequence
              </span>
              <div className="flex items-center overflow-x-auto pb-2 space-x-2">
                {STAGES_SEQUENCE.map((stageKey, idx) => {
                  const currentIdx = STAGES_SEQUENCE.indexOf(selectedProject.project.currentStage);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={stageKey}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border flex items-center space-x-1 ${
                        isCurrent
                          ? 'bg-solar-500 text-navy-950 border-solar-600 shadow-sm'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isCurrent && <Clock className="w-3 h-3 text-navy-950 animate-pulse" />}
                      <span>{getStageLabel(stageKey)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Transition Control Form */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-900 block mb-2">Advance Workflow Stage</span>
              <form onSubmit={handleAdvanceStage} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Next Target Stage</label>
                  <select
                    value={nextStage}
                    onChange={(e) => setNextStage(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {STAGES_SEQUENCE.map((stg) => (
                      <option key={stg} value={stg}>
                        {getStageLabel(stg)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Audit Justification Notes</label>
                  <input
                    type="text"
                    required
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="e.g. Structure mounted, ready for modules"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-navy-950 hover:bg-navy-900 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Confirm Stage Advance
                  </button>
                </div>
              </form>
            </div>

            {/* Sub-records Grid: Documents, Dispatches, Invoices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Material Dispatches */}
              <div className="border border-slate-200 p-3 rounded-xl">
                <span className="font-bold text-slate-900 flex items-center mb-2">
                  <Truck className="w-4 h-4 mr-1 text-solar-500" />
                  <span>Material Dispatches & Challans ({selectedProject.dispatches?.length || 0})</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(selectedProject.dispatches || []).map((d: any) => (
                    <div key={d._id} className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{d.challanNumber}</div>
                        <div className="text-[10px] text-slate-500">Vehicle: {d.vehicleNumber} • Driver: {d.driverName}</div>
                      </div>
                      <span className="font-semibold text-emerald-700">{d.status}</span>
                    </div>
                  ))}
                  {(!selectedProject.dispatches || selectedProject.dispatches.length === 0) && (
                    <div className="text-slate-400 py-2">No material dispatch recorded yet.</div>
                  )}
                </div>
              </div>

              {/* Invoices */}
              <div className="border border-slate-200 p-3 rounded-xl">
                <span className="font-bold text-slate-900 flex items-center mb-2">
                  <Zap className="w-4 h-4 mr-1 text-solar-500" />
                  <span>Invoices & Milestones ({selectedProject.invoices?.length || 0})</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(selectedProject.invoices || []).map((inv: any) => (
                    <div key={inv._id} className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{inv.milestoneName}</div>
                        <div className="text-[10px] text-slate-500">{inv.invoiceNumber}</div>
                      </div>
                      <span className="font-bold text-slate-900">{inv.status}</span>
                    </div>
                  ))}
                  {(!selectedProject.invoices || selectedProject.invoices.length === 0) && (
                    <div className="text-slate-400 py-2">No invoices issued for this project.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Stage History Audit Trail */}
            <div className="border-t border-slate-100 pt-3 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Project Activity History
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(selectedProject.project.stageHistory || []).map((h: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] p-1.5 bg-slate-50 rounded">
                    <div>
                      <span className="font-bold text-slate-800">{getStageLabel(h.stage)}</span>
                      <span className="text-slate-500 ml-2">{h.notes}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{formatDate(h.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
