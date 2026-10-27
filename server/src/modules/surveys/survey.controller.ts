import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { SiteSurvey } from '../../models/SiteSurvey';
import { Lead } from '../../models/Lead';
import { User } from '../../models/User';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getSurveys(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, engineerId, search } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (engineerId) query.assignedEngineerId = engineerId;

    if (req.user?.role === 'Site Survey Engineer') {
      query.assignedEngineerId = req.user.userId;
    }

    const surveys = await SiteSurvey.find(query)
      .populate('leadId', 'customerName phone address city preferredCapacityKw stage')
      .populate('assignedEngineerId', 'fullName email phone')
      .sort({ visitDate: -1 });

    res.status(200).json({ success: true, data: { surveys } });
  } catch (error) {
    next(error);
  }
}

export async function createSurvey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leadId, assignedEngineerId, assignedEngineerName, visitDate } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new AppError('Associated Lead not found', 404);
    }

    let engineerId = assignedEngineerId;
    let engineerName = assignedEngineerName;

    if (!engineerId || !mongoose.Types.ObjectId.isValid(engineerId)) {
      const defaultEngineer =
        (await User.findOne({ role: 'Site Survey Engineer' })) ||
        (await User.findOne({ role: 'Super Admin' }));
      engineerId = defaultEngineer?._id;
      engineerName = defaultEngineer?.fullName || 'Site Survey Engineer';
    }

    const count = await SiteSurvey.countDocuments();
    const surveyId = `SRV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const survey = await SiteSurvey.create({
      surveyId,
      leadId: lead._id,
      assignedEngineerId: engineerId,
      assignedEngineerName: engineerName || 'Pooja Patil',
      visitDate: new Date(visitDate),
      usableRoofAreaSqFt: Math.round(lead.preferredCapacityKw * 100),
      preliminaryCapacityKw: lead.preferredCapacityKw,
      status: 'SCHEDULED',
    });

    lead.stage = 'SURVEY_SCHEDULED';
    lead.activities.push({
      type: 'STATUS_CHANGE',
      note: `Site Survey scheduled (${surveyId}) with ${survey.assignedEngineerName} on ${new Date(visitDate).toLocaleDateString()}`,
      performedBy: req.user?.fullName || 'System',
      createdAt: new Date(),
    });
    await lead.save();

    await logAuditEvent(req, 'SCHEDULE_SURVEY', 'SiteSurvey', (survey._id as any).toString(), {
      surveyId,
      leadId,
    });

    res.status(201).json({
      success: true,
      message: 'Survey scheduled successfully',
      data: { survey },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSurveyById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const survey = await SiteSurvey.findById(id)
      .populate('leadId')
      .populate('customerId')
      .populate('propertyId')
      .populate('assignedEngineerId', 'fullName email phone');

    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    res.status(200).json({ success: true, data: { survey } });
  } catch (error) {
    next(error);
  }
}

export async function updateSurvey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const survey = await SiteSurvey.findById(id);
    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    const {
      usableRoofAreaSqFt,
      roofType,
      roofCondition,
      shadingAssessment,
      orientation,
      tiltAngleDegrees,
      existingMeterPhase,
      existingMeterType,
      sanctionLoadKw,
      inverterPlacementLocation,
      cableLengthMetersDC,
      cableLengthMetersAC,
      earthingFeasible,
      lightningProtectionNeeded,
      preliminaryCapacityKw,
      outcome,
      conditionsNotes,
      sitePhotos,
      status,
      customerAcknowledgement,
    } = req.body;

    if (usableRoofAreaSqFt !== undefined) survey.usableRoofAreaSqFt = usableRoofAreaSqFt;
    if (roofType) survey.roofType = roofType;
    if (roofCondition) survey.roofCondition = roofCondition;
    if (shadingAssessment) survey.shadingAssessment = shadingAssessment;
    if (orientation) survey.orientation = orientation;
    if (tiltAngleDegrees !== undefined) survey.tiltAngleDegrees = tiltAngleDegrees;
    if (existingMeterPhase) survey.existingMeterPhase = existingMeterPhase;
    if (existingMeterType) survey.existingMeterType = existingMeterType;
    if (sanctionLoadKw !== undefined) survey.sanctionLoadKw = sanctionLoadKw;
    if (inverterPlacementLocation) survey.inverterPlacementLocation = inverterPlacementLocation;
    if (cableLengthMetersDC !== undefined) survey.cableLengthMetersDC = cableLengthMetersDC;
    if (cableLengthMetersAC !== undefined) survey.cableLengthMetersAC = cableLengthMetersAC;
    if (earthingFeasible !== undefined) survey.earthingFeasible = earthingFeasible;
    if (lightningProtectionNeeded !== undefined) survey.lightningProtectionNeeded = lightningProtectionNeeded;
    if (preliminaryCapacityKw !== undefined) survey.preliminaryCapacityKw = preliminaryCapacityKw;
    if (outcome) survey.outcome = outcome;
    if (conditionsNotes !== undefined) survey.conditionsNotes = conditionsNotes;
    if (sitePhotos) survey.sitePhotos = sitePhotos;
    if (customerAcknowledgement !== undefined) survey.customerAcknowledgement = customerAcknowledgement;

    if (status) {
      survey.status = status;
      if (status === 'COMPLETED') {
        survey.completedAt = new Date();
        // Update lead stage
        if (survey.leadId) {
          await Lead.findByIdAndUpdate(survey.leadId, {
            stage: 'SURVEY_COMPLETED',
            $push: {
              activities: {
                type: 'STATUS_CHANGE',
                note: `Site Survey completed: Outcome = ${survey.outcome}`,
                performedBy: req.user?.fullName || 'Survey Engineer',
                createdAt: new Date(),
              },
            },
          });
        }
      }
    }

    await survey.save();

    await logAuditEvent(req, 'UPDATE_SURVEY', 'SiteSurvey', id, { outcome: survey.outcome, status: survey.status });

    res.status(200).json({
      success: true,
      message: 'Survey findings saved successfully',
      data: { survey },
    });
  } catch (error) {
    next(error);
  }
}
