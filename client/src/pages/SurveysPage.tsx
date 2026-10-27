import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SiteSurvey, Lead } from '../types';
import { formatDate, getStatusBadgeClass } from '../utils/formatters';
import {
  Compass,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Layers,
  Zap,
  Save,
  Plus,
} from 'lucide-react';

export const SurveysPage: React.FC = () => {
  const [surveys, setSurveys] = useState<SiteSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<SiteSurvey | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Schedule modal form state
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);

  // Active survey edit form state
  const [formData, setFormData] = useState({
    usableRoofAreaSqFt: 300,
    roofType: 'RCC_FLAT',
    roofCondition: 'EXCELLENT',
    shadingAssessment: 'NONE',
    orientation: 'SOUTH',
    tiltAngleDegrees: 18,
    existingMeterPhase: 'SINGLE_PHASE',
    existingMeterType: 'DIGITAL',
    sanctionLoadKw: 5,
    inverterPlacementLocation: 'Under Staircase Shade Wall',
    cableLengthMetersDC: 20,
    cableLengthMetersAC: 12,
    earthingFeasible: true,
    lightningProtectionNeeded: true,
    preliminaryCapacityKw: 3,
    outcome: 'FEASIBLE',
    conditionsNotes: '',
    status: 'COMPLETED',
  });

  const loadSurveys = async () => {
    try {
      const res = await api.getSurveys();
      setSurveys(res.surveys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const openSurveyEditor = (survey: SiteSurvey) => {
    setSelectedSurvey(survey);
    setFormData({
      usableRoofAreaSqFt: survey.usableRoofAreaSqFt || 300,
      roofType: survey.roofType || 'RCC_FLAT',
      roofCondition: survey.roofCondition || 'GOOD',
      shadingAssessment: survey.shadingAssessment || 'NONE',
      orientation: survey.orientation || 'SOUTH',
      tiltAngleDegrees: survey.tiltAngleDegrees || 18,
      existingMeterPhase: survey.existingMeterPhase || 'SINGLE_PHASE',
      existingMeterType: 'DIGITAL',
      sanctionLoadKw: survey.sanctionLoadKw || 5,
      inverterPlacementLocation: 'Indoor Main Wall',
      cableLengthMetersDC: 20,
      cableLengthMetersAC: 10,
      earthingFeasible: true,
      lightningProtectionNeeded: true,
      preliminaryCapacityKw: survey.preliminaryCapacityKw || 3,
      outcome: survey.outcome || 'FEASIBLE',
      conditionsNotes: survey.conditionsNotes || '',
      status: 'COMPLETED',
    });
  };

  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;
    try {
      await api.updateSurvey(selectedSurvey._id, formData);
      setSelectedSurvey(null);
      loadSurveys();
      alert('Site Survey findings and feasibility sign-off saved!');
    } catch (err: any) {
      alert(err.message || 'Failed to save survey');
    }
  };

  const openSchedule = async () => {
    try {
      const res = await api.getLeads({ stage: 'QUALIFIED' });
      setLeads(res.leads);
      if (res.leads.length > 0) setSelectedLeadId(res.leads[0]._id);
      setShowScheduleModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;
    try {
      await api.createSurvey({
        leadId: selectedLeadId,
        assignedEngineerName: 'Pooja Patil',
        visitDate,
      });
      setShowScheduleModal(false);
      loadSurveys();
      alert('Survey scheduled!');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule survey');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Site Visit & Technical Surveys</h1>
          <p className="text-xs text-slate-500">
            Roof physical measurements, shading assessments, electrical infrastructure & feasibility
          </p>
        </div>
        <button
          onClick={openSchedule}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Schedule Site Visit</span>
        </button>
      </div>

      {/* Surveys List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Survey ID</th>
                <th className="py-3 px-4">Lead / Customer</th>
                <th className="py-3 px-4">Visit Date</th>
                <th className="py-3 px-4">Assigned Engineer</th>
                <th className="py-3 px-4">Roof Usable Area</th>
                <th className="py-3 px-4">Feasibility Outcome</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No site surveys found.
                  </td>
                </tr>
              ) : (
                surveys.map((srv) => (
                  <tr key={srv._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{srv.surveyId}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{srv.leadId?.customerName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500">{srv.leadId?.address || 'Site Address'}</div>
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-1.5 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(srv.visitDate)}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{srv.assignedEngineerName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {srv.usableRoofAreaSqFt} <span className="text-slate-500 font-normal">sq.ft</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                          srv.outcome
                        )}`}
                      >
                        {srv.outcome.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(
                          srv.status
                        )}`}
                      >
                        {srv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openSurveyEditor(srv)}
                        className="px-3 py-1 bg-navy-950 text-white rounded text-xs hover:bg-navy-900 font-medium transition"
                      >
                        {srv.status === 'COMPLETED' ? 'View Findings' : 'Fill Survey Form'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Survey Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Schedule Roof Survey Visit</h2>
            <p className="text-xs text-slate-500 mb-4">Assign a site engineer to conduct feasibility</p>

            <form onSubmit={handleScheduleSurvey} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Select Qualified Lead</label>
                <select
                  required
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                >
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.customerName} ({l.leadId}) - {l.preferredCapacityKw} kW - {l.city}
                    </option>
                  ))}
                  {leads.length === 0 && <option value="">No qualified leads awaiting survey</option>}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Visit Date</label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leads.length === 0}
                  className="px-4 py-1.5 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg disabled:opacity-50"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Field Survey Findings Editor Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Site Survey Report: {selectedSurvey.surveyId}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedSurvey.leadId?.customerName} • Engineer: {selectedSurvey.assignedEngineerName}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                  formData.outcome
                )}`}
              >
                {formData.outcome.replace(/_/g, ' ')}
              </span>
            </div>

            <form onSubmit={handleSaveSurvey} className="space-y-4 text-xs">
              {/* Roof Physical Parameters */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-solar-500" />
                  <span>Roof Physical Dimensions & Condition</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Usable Area (Sq. Ft.)</label>
                    <input
                      type="number"
                      value={formData.usableRoofAreaSqFt}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usableRoofAreaSqFt: Number(e.target.value),
                          preliminaryCapacityKw: Math.round((Number(e.target.value) / 100) * 10) / 10,
                        })
                      }
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Roof Surface Type</label>
                    <select
                      value={formData.roofType}
                      onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="RCC_FLAT">RCC Flat Slab</option>
                      <option value="TIN_SHED">Industrial Tin Shed</option>
                      <option value="TILED">Clay Tile Slanted</option>
                      <option value="ELEVATED">Elevated Superstructure</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Structural Condition</label>
                    <select
                      value={formData.roofCondition}
                      onChange={(e) => setFormData({ ...formData, roofCondition: e.target.value })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="EXCELLENT">Excellent (Reinforced)</option>
                      <option value="GOOD">Good / Suitable</option>
                      <option value="NEEDS_REPAIR">Waterproofing / Repair Needed</option>
                      <option value="UNSUITABLE">Unsuitable</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Orientation</label>
                    <select
                      value={formData.orientation}
                      onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="SOUTH">True South (Optimal)</option>
                      <option value="SOUTH_WEST">South-West</option>
                      <option value="SOUTH_EAST">South-East</option>
                      <option value="EAST">East</option>
                      <option value="WEST">West</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Recommended Tilt (deg)</label>
                    <input
                      type="number"
                      value={formData.tiltAngleDegrees}
                      onChange={(e) => setFormData({ ...formData, tiltAngleDegrees: Number(e.target.value) })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Shading Assessment</label>
                    <select
                      value={formData.shadingAssessment}
                      onChange={(e) => setFormData({ ...formData, shadingAssessment: e.target.value })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="NONE">Zero Shading (Optimal)</option>
                      <option value="PARTIAL_MORNING">Partial Morning Shading</option>
                      <option value="PARTIAL_EVENING">Partial Evening Shading</option>
                      <option value="HEAVY">Heavy Tree / Parapet Shadow</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Electrical Parameters */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-solar-500" />
                  <span>Existing Electrical Infrastructure & Cabling</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Grid Connection Phase</label>
                    <select
                      value={formData.existingMeterPhase}
                      onChange={(e) => setFormData({ ...formData, existingMeterPhase: e.target.value })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="SINGLE_PHASE">Single Phase (1-Ph)</option>
                      <option value="THREE_PHASE">Three Phase (3-Ph)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Sanctioned Load (kW)</label>
                    <input
                      type="number"
                      value={formData.sanctionLoadKw}
                      onChange={(e) => setFormData({ ...formData, sanctionLoadKw: Number(e.target.value) })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Calculated Plant Size (kW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.preliminaryCapacityKw}
                      onChange={(e) => setFormData({ ...formData, preliminaryCapacityKw: Number(e.target.value) })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-navy-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Est. DC Cable Run (Meters)</label>
                    <input
                      type="number"
                      value={formData.cableLengthMetersDC}
                      onChange={(e) => setFormData({ ...formData, cableLengthMetersDC: Number(e.target.value) })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Est. AC Cable Run (Meters)</label>
                    <input
                      type="number"
                      value={formData.cableLengthMetersAC}
                      onChange={(e) => setFormData({ ...formData, cableLengthMetersAC: Number(e.target.value) })}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Feasibility Sign-Off */}
              <div>
                <label className="font-semibold text-slate-700">Technical Feasibility Decision *</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value as any })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                >
                  <option value="FEASIBLE">FEASIBLE (Clear for Solar PV Design & BOQ)</option>
                  <option value="FEASIBLE_WITH_CONDITIONS">FEASIBLE WITH CONDITIONS (e.g. Elevate 2m or Waterproofing)</option>
                  <option value="ADDITIONAL_INSPECTION_REQUIRED">ADDITIONAL STRUCTURAL INSPECTION REQUIRED</option>
                  <option value="NOT_FEASIBLE">NOT FEASIBLE (Unsafe roof or extreme shading)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Engineering Observations & Notes</label>
                <textarea
                  rows={2}
                  value={formData.conditionsNotes}
                  onChange={(e) => setFormData({ ...formData, conditionsNotes: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Record structural recommendations, anchor bolting details, or DISCOM load enhancement note..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSurvey(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-solar-500 hover:bg-solar-600 text-navy-950 font-semibold rounded-lg shadow-sm flex items-center space-x-1"
                >
                  <Save className="w-4 h-4 mr-1" />
                  <span>Save Survey & Sign Off Feasibility</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
