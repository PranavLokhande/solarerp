import { Response, NextFunction } from 'express';
import { SolarDesign, IBOQItem } from '../../models/SolarDesign';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getDesigns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId } = req.query;
    const query: any = {};
    if (customerId) query.customerId = customerId;

    const designs = await SolarDesign.find(query)
      .populate('customerId', 'name phone email city')
      .populate('surveyId', 'surveyId usableRoofAreaSqFt outcome')
      .populate('designerId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { designs } });
  } catch (error) {
    next(error);
  }
}

export async function createDesign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      customerId,
      surveyId,
      systemType,
      dcCapacityKw,
      acCapacityKw,
      panelModel,
      panelWattage,
      panelQty,
      inverterModel,
      inverterCapacityKw,
      inverterPhase,
      structureSpecification,
    } = req.body;

    const count = await SolarDesign.countDocuments();
    const designId = `DES-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // Standardized Indian Solar BOQ computation (in paise)
    // ₹1 = 100 paise. For example, 545W Mono PERC module ~ ₹14,000 each = 1400000 paise
    const computedPanelQty = panelQty || Math.ceil((dcCapacityKw * 1000) / (panelWattage || 545));
    const moduleRatePaise = Math.round((panelWattage || 545) * 23 * 100); // ~₹23/watt
    const inverterRatePaise = Math.round((inverterCapacityKw || dcCapacityKw) * 8000 * 100); // ~₹8,000/kW
    const structureRatePaise = Math.round(dcCapacityKw * 4500 * 100); // ~₹4,500/kW HDG
    const cablingBOSPaise = Math.round(dcCapacityKw * 5000 * 100); // cables, ACDB/DCDB, earthing

    const boqItems: IBOQItem[] = [
      {
        category: 'SOLAR_MODULES',
        description: `${panelModel || 'Tier-1 Mono PERC Bi-facial'} ${panelWattage || 545}W (ALMM Approved)`,
        make: 'Adani / Waaree / Goldi',
        qty: computedPanelQty,
        unit: 'NOS',
        unitRatePaise: moduleRatePaise,
        totalAmountPaise: moduleRatePaise * computedPanelQty,
      },
      {
        category: 'INVERTER',
        description: `${inverterModel || 'Grid-tied String Inverter'} ${inverterCapacityKw || dcCapacityKw}kW (${inverterPhase || 'SINGLE_PHASE'})`,
        make: 'Growatt / Havells / Solis',
        qty: 1,
        unit: 'NOS',
        unitRatePaise: inverterRatePaise,
        totalAmountPaise: inverterRatePaise,
      },
      {
        category: 'MOUNTING_STRUCTURE',
        description: structureSpecification || 'Hot Dip Galvanized (HDG) Rooftop Elevated Structure, 18 deg tilt',
        make: 'Standard EPC HDG 80 Micron',
        qty: Math.round(dcCapacityKw),
        unit: 'SETS',
        unitRatePaise: structureRatePaise / Math.max(1, Math.round(dcCapacityKw)),
        totalAmountPaise: structureRatePaise,
      },
      {
        category: 'ELECTRICAL_BOS',
        description: 'Solar DC Cable 4 sq.mm, AC Cable 4 Core, ACDB/DCDB with SPD, Chemical Earthing & Lightning Arrester',
        make: 'Polycab / Schneider / Reputed',
        qty: 1,
        unit: 'SETS',
        unitRatePaise: cablingBOSPaise,
        totalAmountPaise: cablingBOSPaise,
      },
    ];

    const estimatedDailyGenKwh = Math.round(dcCapacityKw * 4.2 * 10) / 10;
    const estimatedAnnualGenKwh = Math.round(dcCapacityKw * 1530);
    const estimatedCo2MitigatedTonsPerYear = Math.round(dcCapacityKw * 1.25 * 10) / 10;

    const design = await SolarDesign.create({
      designId,
      customerId,
      surveyId,
      systemType: systemType || 'ON_GRID',
      dcCapacityKw,
      acCapacityKw: acCapacityKw || dcCapacityKw,
      panelModel: panelModel || '545W Mono PERC Half-cut',
      panelWattage: panelWattage || 545,
      panelQty: computedPanelQty,
      almmCompliant: true,
      inverterModel: inverterModel || 'Grid-tied String Inverter',
      inverterCapacityKw: inverterCapacityKw || dcCapacityKw,
      inverterPhase: inverterPhase || 'SINGLE_PHASE',
      structureSpecification: structureSpecification || 'HDG Rooftop Structure',
      boqItems,
      estimatedDailyGenKwh,
      estimatedAnnualGenKwh,
      estimatedCo2MitigatedTonsPerYear,
      designerId: req.user?.userId,
      status: 'APPROVED',
    });

    await logAuditEvent(req, 'CREATE_SOLAR_DESIGN', 'SolarDesign', (design._id as any).toString(), {
      designId,
      dcCapacityKw,
    });

    res.status(201).json({
      success: true,
      message: 'Solar PV system design and BOQ generated successfully',
      data: { design },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDesignById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const design = await SolarDesign.findById(id)
      .populate('customerId')
      .populate('surveyId')
      .populate('designerId', 'fullName email');

    if (!design) {
      throw new AppError('Solar design not found', 404);
    }

    res.status(200).json({ success: true, data: { design } });
  } catch (error) {
    next(error);
  }
}
