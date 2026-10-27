import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../models/User';
import { Branch, Department, EmployeeProfile } from '../models/EmployeeProfile';
import { Lead } from '../models/Lead';
import { Customer, Property } from '../models/Customer';
import { SiteSurvey } from '../models/SiteSurvey';
import { SolarDesign } from '../models/SolarDesign';
import { Quotation, WorkOrder } from '../models/Quotation';
import { Project } from '../models/Project';
import { ProjectDocument } from '../models/Document';
import { RegistrationApplication, LoanApplication } from '../models/RegistrationApplication';
import { Warehouse, InventoryItem, StockMovement } from '../models/InventoryItem';
import { MaterialDispatch, InstallationRecord, QualityInspection, MeterRecord, CommissioningRecord } from '../models/InstallationOperations';
import { Invoice, Payment, FinancialLedgerEntry } from '../models/Finance';
import { Ticket, Warranty, AMCContract } from '../models/ServiceAndSupport';
import { AuditLog } from '../models/AuditLog';

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(env.MONGO_URI);
  console.log('[Seed] Connected. Clearing collections for fresh realistic seed...');

  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Department.deleteMany({}),
    EmployeeProfile.deleteMany({}),
    Lead.deleteMany({}),
    Customer.deleteMany({}),
    Property.deleteMany({}),
    SiteSurvey.deleteMany({}),
    SolarDesign.deleteMany({}),
    Quotation.deleteMany({}),
    WorkOrder.deleteMany({}),
    Project.deleteMany({}),
    ProjectDocument.deleteMany({}),
    RegistrationApplication.deleteMany({}),
    LoanApplication.deleteMany({}),
    Warehouse.deleteMany({}),
    InventoryItem.deleteMany({}),
    StockMovement.deleteMany({}),
    MaterialDispatch.deleteMany({}),
    InstallationRecord.deleteMany({}),
    QualityInspection.deleteMany({}),
    MeterRecord.deleteMany({}),
    CommissioningRecord.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    FinancialLedgerEntry.deleteMany({}),
    Ticket.deleteMany({}),
    Warranty.deleteMany({}),
    AMCContract.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('[Seed] Seeding Branches & Departments...');
  const branchPune = await Branch.create({
    branchCode: 'PUN-01',
    name: 'Pune Central Operations Hub',
    state: 'Maharashtra',
    city: 'Pune',
    address: 'Senapati Bapat Road, Shivaji Nagar, Pune, Maharashtra 411016',
    phone: '+91 20 2567 8900',
    isActive: true,
  });

  const branchAhmd = await Branch.create({
    branchCode: 'AMD-01',
    name: 'Ahmedabad Solar Operations Hub',
    state: 'Gujarat',
    city: 'Ahmedabad',
    address: 'SG Highway, Bodakdev, Ahmedabad, Gujarat 380054',
    phone: '+91 79 2687 4411',
    isActive: true,
  });

  const deptSales = await Department.create({ code: 'SALES', name: 'Sales & Business Development' });
  const deptEng = await Department.create({ code: 'ENG', name: 'Technical Survey & Solar Engineering' });
  const deptOps = await Department.create({ code: 'OPS', name: 'Project Operations & EPC Installation' });
  const deptFin = await Department.create({ code: 'FIN', name: 'Finance, Subsidy & Commercial' });
  const deptSCM = await Department.create({ code: 'SCM', name: 'Warehouse, Logistics & Procurement' });

  console.log('[Seed] Seeding Users & Employees...');
  const salt = 10;
  const adminPass = await bcrypt.hash('Admin@2026', salt);
  const commonPass = await bcrypt.hash('Solar@2026', salt);
  const custPass = await bcrypt.hash('Customer@2026', salt);

  const superAdmin = await User.create({
    email: 'admin@heliosops.com',
    passwordHash: adminPass,
    fullName: 'Vikramaditya Singhania',
    phone: '+91 98220 11223',
    role: 'Super Admin',
    employeeId: 'EMP-0001',
    branchId: branchPune._id,
    isActive: true,
  });

  const salesManager = await User.create({
    email: 'sales.manager@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Ananya Deshmukh',
    phone: '+91 98221 44556',
    role: 'Sales Manager',
    employeeId: 'EMP-0002',
    branchId: branchPune._id,
    isActive: true,
  });

  const salesExec = await User.create({
    email: 'sales.exec@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Rohan Kulkarni',
    phone: '+91 98222 77889',
    role: 'Sales Executive',
    employeeId: 'EMP-0003',
    branchId: branchPune._id,
    isActive: true,
  });

  const surveyEng = await User.create({
    email: 'survey.eng@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Pooja Patil',
    phone: '+91 98223 99001',
    role: 'Site Survey Engineer',
    employeeId: 'EMP-0004',
    branchId: branchPune._id,
    isActive: true,
  });

  const designEng = await User.create({
    email: 'design.eng@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Aditya Mehta',
    phone: '+91 98224 22334',
    role: 'Design Engineer',
    employeeId: 'EMP-0005',
    branchId: branchPune._id,
    isActive: true,
  });

  const projectMgr = await User.create({
    email: 'project.mgr@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Sameer Joshi',
    phone: '+91 98225 55667',
    role: 'Project Manager',
    employeeId: 'EMP-0006',
    branchId: branchPune._id,
    isActive: true,
  });

  const techLead = await User.create({
    email: 'tech.lead@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Nilesh Shinde',
    phone: '+91 98226 88990',
    role: 'Installation Technician',
    employeeId: 'EMP-0007',
    branchId: branchPune._id,
    isActive: true,
  });

  const qaLead = await User.create({
    email: 'qa.lead@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Kavita Nair',
    phone: '+91 98227 12345',
    role: 'Quality Assurance Engineer',
    employeeId: 'EMP-0008',
    branchId: branchPune._id,
    isActive: true,
  });

  const financeMgr = await User.create({
    email: 'finance.mgr@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Rajiv Chawla',
    phone: '+91 98228 34567',
    role: 'Finance Manager',
    employeeId: 'EMP-0009',
    branchId: branchPune._id,
    isActive: true,
  });

  const warehouseMgr = await User.create({
    email: 'warehouse.mgr@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Dinesh Sawant',
    phone: '+91 98229 56789',
    role: 'Warehouse Manager',
    employeeId: 'EMP-0010',
    branchId: branchPune._id,
    isActive: true,
  });

  const discomCoord = await User.create({
    email: 'discom.coord@heliosops.com',
    passwordHash: commonPass,
    fullName: 'Sneha Kadam',
    phone: '+91 98230 78901',
    role: 'Government Portal / DISCOM Coordinator',
    employeeId: 'EMP-0011',
    branchId: branchPune._id,
    isActive: true,
  });

  const customerUser = await User.create({
    email: 'rajesh.sharma@gmail.com',
    passwordHash: custPass,
    fullName: 'Rajesh Sharma',
    phone: '+91 98901 23456',
    role: 'Customer',
    customerId: 'CUST-2026-0001',
    isActive: true,
  });

  console.log('[Seed] Seeding Warehouses & Inventory...');
  const mainWarehouse = await Warehouse.create({
    warehouseCode: 'WH-PUN-01',
    name: 'Pune Central Solar Logistics Yard',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Plot 45, MIDC Bhosari, Pune 411026',
    managerId: warehouseMgr._id,
    isActive: true,
  });

  const invPanels = await InventoryItem.create({
    sku: 'MOD-WAAREE-545W',
    name: 'Waaree Bi-54 545W Bifacial Mono PERC Module',
    category: 'SOLAR_PANEL',
    manufacturer: 'Waaree Energies Ltd',
    modelNumber: 'WSMD-545',
    unit: 'NOS',
    currentStock: 450,
    reservedStock: 48,
    unitCostPaise: 1250000, // ₹12,500
    reorderLevel: 50,
    warehouseId: mainWarehouse._id,
    serialNumbers: ['WAR2026A001', 'WAR2026A002', 'WAR2026A003'],
  });

  const invInverter = await InventoryItem.create({
    sku: 'INV-GROWATT-5KW',
    name: 'Growatt MIN 5000TL-X 5kW Single Phase Inverter',
    category: 'INVERTER',
    manufacturer: 'Growatt New Energy',
    modelNumber: 'MIN 5000TL-X',
    unit: 'NOS',
    currentStock: 25,
    reservedStock: 4,
    unitCostPaise: 3800000, // ₹38,000
    reorderLevel: 5,
    warehouseId: mainWarehouse._id,
    serialNumbers: ['GRW5K-01992', 'GRW5K-01993'],
  });

  const invStructure = await InventoryItem.create({
    sku: 'STR-HDG-ELEV-3KW',
    name: 'Elevated 2m HDG Rooftop Structure 3kW Kit',
    category: 'MOUNTING_STRUCTURE',
    manufacturer: 'SolarStruct EPC Solutions',
    modelNumber: 'HDG-80U-3K',
    unit: 'SETS',
    currentStock: 35,
    reservedStock: 3,
    unitCostPaise: 1350000, // ₹13,500
    reorderLevel: 8,
    warehouseId: mainWarehouse._id,
  });

  const invDCCable = await InventoryItem.create({
    sku: 'CAB-DC-4SQMM',
    name: 'Polycab 4 sq.mm Solar DC Cable XLPO UV Resistant',
    category: 'DC_CABLE',
    manufacturer: 'Polycab India Ltd',
    modelNumber: 'SOLAR-4SQ-RD',
    unit: 'METERS',
    currentStock: 3200,
    reservedStock: 250,
    unitCostPaise: 4500, // ₹45/meter
    reorderLevel: 500,
    warehouseId: mainWarehouse._id,
  });

  console.log('[Seed] Seeding Customers & Properties...');
  const customer1 = await Customer.create({
    customerId: 'CUST-2026-0001',
    name: 'Rajesh Sharma',
    phone: '+91 98901 23456',
    email: 'rajesh.sharma@gmail.com',
    billingAddress: 'Bungalow 12, Prathamesh Park, Baner Road, Pune 411045',
    serviceAddress: 'Bungalow 12, Prathamesh Park, Baner Road, Pune 411045',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411045',
    maskedPan: 'ABCDE****F',
    maskedAadhaar: '********4421',
    discomName: 'MSEDCL (Maharashtra State Electricity Distribution Co Ltd)',
    consumerNumber: '028540092144',
    branchId: branchPune._id,
    portalUserId: customerUser._id,
    status: 'ACTIVE',
  });

  const prop1 = await Property.create({
    propertyId: 'PROP-0001',
    customerId: customer1._id,
    propertyType: 'RESIDENTIAL',
    address: 'Bungalow 12, Prathamesh Park, Baner Road, Pune 411045',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411045',
    roofType: 'RCC_FLAT',
    usableRoofAreaSqFt: 350,
    totalRoofAreaSqFt: 500,
    connectionPhase: 'SINGLE_PHASE',
    sanctionedLoadKw: 5,
    discomName: 'MSEDCL',
    consumerNumber: '028540092144',
  });

  console.log('[Seed] Seeding Leads across stages...');
  const lead1 = await Lead.create({
    leadId: 'LEAD-2026-0001',
    customerName: 'Amitabh Joshi',
    phone: '+91 98231 66778',
    email: 'amitabh.joshi@outlook.com',
    address: 'Row House 4, Orchid Enclave, Kothrud',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411038',
    monthlyBillAmountPaise: 450000, // ₹4,500/mo
    consumerNumber: '028510044812',
    discomName: 'MSEDCL',
    propertyType: 'RESIDENTIAL',
    connectionPhase: 'SINGLE_PHASE',
    preferredCapacityKw: 3,
    source: 'WEBSITE',
    assignedSalespersonId: salesExec._id,
    assignedSalespersonName: salesExec.fullName,
    branchId: branchPune._id,
    stage: 'NEW',
    qualificationScore: 85,
    priority: 'HIGH',
    nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    activities: [
      {
        type: 'NOTE',
        note: 'Customer requested 3kW PM Surya Ghar quote via web calculator.',
        performedBy: 'System Ingestion',
        createdAt: new Date(),
      },
    ],
  });

  const lead2 = await Lead.create({
    leadId: 'LEAD-2026-0002',
    customerName: 'Sunita Deshpande',
    phone: '+91 98232 88990',
    email: 'sunita.d@gmail.com',
    address: 'Plot 77, Viman Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411014',
    monthlyBillAmountPaise: 680000,
    consumerNumber: '028530089110',
    discomName: 'MSEDCL',
    propertyType: 'RESIDENTIAL',
    connectionPhase: 'THREE_PHASE',
    preferredCapacityKw: 5,
    source: 'REFERRAL',
    assignedSalespersonId: salesExec._id,
    assignedSalespersonName: salesExec.fullName,
    branchId: branchPune._id,
    stage: 'SURVEY_SCHEDULED',
    qualificationScore: 90,
    priority: 'HIGH',
    activities: [
      {
        type: 'CALL',
        note: 'Discussed net-metering feasibility and scheduled survey.',
        performedBy: salesExec.fullName,
        createdAt: new Date(),
      },
    ],
  });

  console.log('[Seed] Seeding Site Survey & Solar Design...');
  const survey1 = await SiteSurvey.create({
    surveyId: 'SRV-2026-0001',
    customerId: customer1._id,
    propertyId: prop1._id,
    assignedEngineerId: surveyEng._id,
    assignedEngineerName: surveyEng.fullName,
    visitDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    usableRoofAreaSqFt: 350,
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
    conditionsNotes: 'Clear unobstructed southern exposure. Excellent reinforced concrete roof slab.',
    sitePhotos: ['/uploads/sample_roof_1.jpg', '/uploads/sample_meter_1.jpg'],
    status: 'COMPLETED',
    customerAcknowledgement: true,
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  });

  const design1 = await SolarDesign.create({
    designId: 'DES-2026-0001',
    customerId: customer1._id,
    surveyId: survey1._id,
    systemType: 'ON_GRID',
    dcCapacityKw: 3.27,
    acCapacityKw: 3.0,
    panelModel: 'Waaree Bi-54 545W Mono PERC',
    panelWattage: 545,
    panelQty: 6,
    almmCompliant: true,
    inverterModel: 'Growatt MIN 3000TL-X',
    inverterCapacityKw: 3.0,
    inverterPhase: 'SINGLE_PHASE',
    structureSpecification: 'Hot Dip Galvanized (HDG) 2m Elevated Rooftop Structure (80 micron coating)',
    boqItems: [
      {
        category: 'SOLAR_MODULES',
        description: 'Waaree 545W Mono PERC Bifacial ALMM Certified',
        make: 'Waaree Energies Ltd',
        qty: 6,
        unit: 'NOS',
        unitRatePaise: 1350000,
        totalAmountPaise: 8100000, // ₹81,000
      },
      {
        category: 'INVERTER',
        description: 'Growatt MIN 3000TL-X Single Phase Inverter with WiFi Dongle',
        make: 'Growatt New Energy',
        qty: 1,
        unit: 'NOS',
        unitRatePaise: 3500000,
        totalAmountPaise: 3500000, // ₹35,000
      },
      {
        category: 'MOUNTING_STRUCTURE',
        description: 'HDG 2m Elevated Superstructure Kit for 6 Panels',
        make: 'SolarStruct EPC',
        qty: 1,
        unit: 'SETS',
        unitRatePaise: 2200000,
        totalAmountPaise: 2200000, // ₹22,000
      },
      {
        category: 'ELECTRICAL_BOS',
        description: 'Polycab 4 sq.mm DC Cable, ACDB/DCDB with Type II SPDs, Chemical Earthing (3 pits), Lightning Arrester',
        make: 'Polycab / Schneider / Reputed',
        qty: 1,
        unit: 'SETS',
        unitRatePaise: 2700000,
        totalAmountPaise: 2700000, // ₹27,000
      },
    ],
    estimatedDailyGenKwh: 13.8,
    estimatedAnnualGenKwh: 5037,
    estimatedCo2MitigatedTonsPerYear: 4.1,
    designerId: designEng._id,
    status: 'APPROVED',
  });

  console.log('[Seed] Seeding Quotation, Work Order & Project...');
  // Total BOQ = 81000 + 35000 + 22000 + 27000 = 165000 (16500000 paise)
  // Tax 13.8% = 22770 (2277000 paise)
  // Total = 18777000 paise (₹1,87,770)
  // PM Surya Ghar Subsidy = ₹78,000 (7800000 paise)
  // Net Payable = ₹1,09,770 (10977000 paise)
  const quotation1 = await Quotation.create({
    quotationNumber: 'QUO-2026-0001',
    version: 1,
    customerId: customer1._id,
    solarDesignId: design1._id,
    baseCostPaise: 16500000,
    discountPercentage: 0,
    taxPaise: 2277000,
    totalAmountPaise: 18777000,
    estimatedSubsidyPaise: 7800000,
    netCustomerPayablePaise: 10977000,
    paymentMilestones: [
      {
        milestoneName: 'Booking Advance (20%)',
        percentage: 20,
        amountPaise: 3755400,
        triggerEvent: 'Work Order signing and document verification',
        isPaid: true,
      },
      {
        milestoneName: 'Pre-Dispatch Allocation (60%)',
        percentage: 60,
        amountPaise: 11266200,
        triggerEvent: 'Material procurement and warehouse dispatch',
        isPaid: true,
      },
      {
        milestoneName: 'Structure & Panel Installation (15%)',
        percentage: 15,
        amountPaise: 2816550,
        triggerEvent: 'Completion of roof structure and panel mounting',
        isPaid: false,
      },
      {
        milestoneName: 'Commissioning & Handover (5%)',
        percentage: 5,
        amountPaise: 938850,
        triggerEvent: 'Net-meter synchronization and final handover dossier',
        isPaid: false,
      },
    ],
    termsAndConditions: [
      '5 Years comprehensive system warranty with 4 free AMC visits per year.',
      '12 Years product warranty and 25 years linear performance warranty on Waaree PV modules.',
      '8 Years warranty on Growatt grid-tied string inverter.',
    ],
    validityDays: 15,
    status: 'ACCEPTED',
    createdBy: salesExec._id,
    approvedBy: salesManager._id,
  });

  const workOrder1 = await WorkOrder.create({
    workOrderNumber: 'WO-2026-0001',
    quotationId: quotation1._id,
    customerId: customer1._id,
    agreedCapacityKw: 3.27,
    contractAmountPaise: 18777000,
    scopeOfWork: 'Turnkey EPC supply, installation, testing, and commissioning of 3.27 kW Rooftop Solar PV System.',
    deliveryTimelineDays: 30,
    status: 'IN_EXECUTION',
    signedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    signedByCustomerName: customer1.name,
  });

  const project1 = await Project.create({
    projectId: 'PRJ-2026-0001',
    workOrderNumber: workOrder1.workOrderNumber,
    workOrderId: workOrder1._id,
    customerId: customer1._id,
    propertyId: prop1._id,
    systemCapacityKw: 3.27,
    currentStage: 'STRUCTURE_INSTALLATION',
    stageHistory: [
      {
        stage: 'PROJECT_INITIATED',
        updatedBy: salesExec.fullName,
        notes: 'Work order executed by customer.',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        stage: 'KYC_DOCUMENTS',
        updatedBy: 'Sneha Kadam',
        notes: 'Electricity bill & Aadhaar verified. Consumer number matched.',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        stage: 'DISCOM_REGISTRATION',
        updatedBy: 'Sneha Kadam',
        notes: 'National Portal application submitted. Reference PM-SG-MH-2026-99218.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        stage: 'MATERIAL_DISPATCHED',
        updatedBy: warehouseMgr.fullName,
        notes: 'Material dispatched via Challan DC-2026-0001.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        stage: 'STRUCTURE_INSTALLATION',
        updatedBy: techLead.fullName,
        notes: 'Roof anchor grouting and base frames mounted.',
        timestamp: new Date(),
      },
    ],
    assignedProjectManagerId: projectMgr._id,
    assignedProjectManagerName: projectMgr.fullName,
    assignedCrewId: techLead._id,
    assignedCrewName: techLead.fullName,
    branchId: branchPune._id,
    targetCompletionDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    isBlocked: false,
  });

  workOrder1.projectId = project1._id as any;
  await workOrder1.save();

  console.log('[Seed] Seeding Project Documents...');
  await ProjectDocument.create({
    documentId: 'DOC-2026-0001',
    projectId: project1._id,
    customerId: customer1._id,
    category: 'ELECTRICITY_BILL',
    title: 'Latest MSEDCL Electricity Bill',
    fileUrl: '/uploads/sample_bill.pdf',
    fileType: 'application/pdf',
    fileSize: 450000,
    status: 'APPROVED',
    verifiedBy: discomCoord._id,
    verifiedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  });

  await ProjectDocument.create({
    documentId: 'DOC-2026-0002',
    projectId: project1._id,
    customerId: customer1._id,
    category: 'SIGNED_AGREEMENT',
    title: 'Signed Solar EPC Agreement & BOQ',
    fileUrl: '/uploads/sample_agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 1200000,
    status: 'APPROVED',
    verifiedBy: projectMgr._id,
    verifiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  console.log('[Seed] Seeding Regulatory & DISCOM Application...');
  await RegistrationApplication.create({
    applicationId: 'REG-2026-0001',
    projectId: project1._id,
    portalType: 'PM_SURYA_GHAR_NATIONAL_PORTAL',
    applicationNumber: 'PM-SG-MH-2026-99218',
    discomName: 'MSEDCL',
    consumerNumber: '028540092144',
    currentStage: 'FEASIBILITY_APPROVED',
    submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    feasibilityApprovedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    subsidyAmountPaise: 7800000, // ₹78,000
    assignedCoordinatorId: discomCoord._id,
    remarks: 'MSEDCL technical feasibility granted for 3.27 kW on single phase.',
  });

  console.log('[Seed] Seeding Material Dispatch Challan...');
  await MaterialDispatch.create({
    dispatchId: 'DSP-2026-0001',
    projectId: project1._id,
    workOrderNumber: workOrder1.workOrderNumber,
    items: [
      {
        sku: 'MOD-WAAREE-545W',
        itemName: 'Waaree 545W Mono PERC Bifacial Module',
        qty: 6,
        unit: 'NOS',
        serialNumbers: ['WAR2026A001', 'WAR2026A002', 'WAR2026A003', 'WAR2026A004', 'WAR2026A005', 'WAR2026A006'],
      },
      {
        sku: 'INV-GROWATT-5KW',
        itemName: 'Growatt Inverter 3kW Kit',
        qty: 1,
        unit: 'NOS',
        serialNumbers: ['GRW3K-8812'],
      },
      {
        sku: 'STR-HDG-ELEV-3KW',
        itemName: 'HDG 2m Elevated Structure Kit',
        qty: 1,
        unit: 'SETS',
      },
    ],
    vehicleNumber: 'MH 12 QX 4545',
    driverName: 'Santosh Pawar',
    driverPhone: '+91 99220 88771',
    challanNumber: 'DC-2026-0001',
    status: 'DELIVERED',
    dispatchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    receivedByName: 'Rajesh Sharma',
    dispatchedBy: warehouseMgr._id,
  });

  console.log('[Seed] Seeding Invoices, Payments & Financial Ledger...');
  // Milestone 1 Invoice: 20% = ₹37,554
  const inv1 = await Invoice.create({
    invoiceNumber: 'INV-2026-0001',
    projectId: project1._id,
    customerId: customer1._id,
    milestoneName: 'Booking Advance (20%)',
    baseAmountPaise: 3300000,
    gstAmountPaise: 455400,
    totalAmountPaise: 3755400,
    paidAmountPaise: 3755400,
    balanceDuePaise: 0,
    dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    status: 'PAID',
    issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  // Milestone 2 Invoice: 60% = ₹1,12,662
  const inv2 = await Invoice.create({
    invoiceNumber: 'INV-2026-0002',
    projectId: project1._id,
    customerId: customer1._id,
    milestoneName: 'Pre-Dispatch Allocation (60%)',
    baseAmountPaise: 9900000,
    gstAmountPaise: 1366200,
    totalAmountPaise: 11266200,
    paidAmountPaise: 11266200,
    balanceDuePaise: 0,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'PAID',
    issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  // Milestone 3 Invoice: 15% = ₹28,165.50 (due soon)
  const inv3 = await Invoice.create({
    invoiceNumber: 'INV-2026-0003',
    projectId: project1._id,
    customerId: customer1._id,
    milestoneName: 'Structure & Panel Installation (15%)',
    baseAmountPaise: 2475000,
    gstAmountPaise: 341550,
    totalAmountPaise: 2816550,
    paidAmountPaise: 0,
    balanceDuePaise: 2816550,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'ISSUED',
    issuedAt: new Date(),
  });

  // Payments for Invoice 1 & 2
  await Payment.create({
    paymentId: 'PAY-2026-0001',
    receiptNumber: 'RCT-2026-00001',
    invoiceId: inv1._id,
    projectId: project1._id,
    customerId: customer1._id,
    amountPaise: 3755400,
    paymentMode: 'NEFT_RTGS',
    transactionRef: 'HDFCR202609018821',
    status: 'VERIFIED',
    verifiedBy: financeMgr._id,
    verifiedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  });

  await Payment.create({
    paymentId: 'PAY-2026-0002',
    receiptNumber: 'RCT-2026-00002',
    invoiceId: inv2._id,
    projectId: project1._id,
    customerId: customer1._id,
    amountPaise: 11266200,
    paymentMode: 'NEFT_RTGS',
    transactionRef: 'HDFCR202609051199',
    status: 'VERIFIED',
    verifiedBy: financeMgr._id,
    verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  // Double-entry Immutable Ledger:
  // 1. Debit Invoice 1 (+37,554)
  await FinancialLedgerEntry.create({
    entryId: 'LED-00001',
    customerId: customer1._id,
    projectId: project1._id,
    entryType: 'DEBIT',
    amountPaise: 3755400,
    runningBalancePaise: 3755400,
    description: 'Invoice INV-2026-0001 issued for Booking Advance (20%)',
    referenceDocType: 'INVOICE',
    referenceDocId: 'INV-2026-0001',
    performedBy: financeMgr._id,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  // 2. Credit Payment 1 (-37,554) -> Balance 0
  await FinancialLedgerEntry.create({
    entryId: 'LED-00002',
    customerId: customer1._id,
    projectId: project1._id,
    entryType: 'CREDIT',
    amountPaise: 3755400,
    runningBalancePaise: 0,
    description: 'Payment received via NEFT Ref: HDFCR202609018821 Receipt: RCT-2026-00001',
    referenceDocType: 'PAYMENT',
    referenceDocId: 'RCT-2026-00001',
    performedBy: financeMgr._id,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  });

  // 3. Debit Invoice 2 (+1,12,662) -> Balance 1,12,662
  await FinancialLedgerEntry.create({
    entryId: 'LED-00003',
    customerId: customer1._id,
    projectId: project1._id,
    entryType: 'DEBIT',
    amountPaise: 11266200,
    runningBalancePaise: 11266200,
    description: 'Invoice INV-2026-0002 issued for Pre-Dispatch Allocation (60%)',
    referenceDocType: 'INVOICE',
    referenceDocId: 'INV-2026-0002',
    performedBy: financeMgr._id,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  // 4. Credit Payment 2 (-1,12,662) -> Balance 0
  await FinancialLedgerEntry.create({
    entryId: 'LED-00004',
    customerId: customer1._id,
    projectId: project1._id,
    entryType: 'CREDIT',
    amountPaise: 11266200,
    runningBalancePaise: 0,
    description: 'Payment received via NEFT Ref: HDFCR202609051199 Receipt: RCT-2026-00002',
    referenceDocType: 'PAYMENT',
    referenceDocId: 'RCT-2026-00002',
    performedBy: financeMgr._id,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  // 5. Debit Invoice 3 (+28,165.50) -> Balance 28,165.50
  await FinancialLedgerEntry.create({
    entryId: 'LED-00005',
    customerId: customer1._id,
    projectId: project1._id,
    entryType: 'DEBIT',
    amountPaise: 2816550,
    runningBalancePaise: 2816550,
    description: 'Invoice INV-2026-0003 issued for Structure & Panel Installation (15%)',
    referenceDocType: 'INVOICE',
    referenceDocId: 'INV-2026-0003',
    performedBy: financeMgr._id,
    createdAt: new Date(),
  });

  console.log('[Seed] Seeding Fully Commissioned Project with Warranty & AMC...');
  const customer2 = await Customer.create({
    customerId: 'CUST-2026-0002',
    name: 'Dr. Rameshwar Patil',
    phone: '+91 94220 55112',
    email: 'dr.rameshwar@patilclinic.com',
    billingAddress: 'Patil Polyclinic, Law College Road, Erandwane, Pune 411004',
    serviceAddress: 'Patil Polyclinic, Law College Road, Erandwane, Pune 411004',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411004',
    maskedPan: 'AWXYZ****G',
    maskedAadhaar: '********8819',
    discomName: 'MSEDCL',
    consumerNumber: '028590011884',
    branchId: branchPune._id,
    status: 'ACTIVE',
  });

  const projectCommissioned = await Project.create({
    projectId: 'PRJ-2026-0002',
    workOrderNumber: 'WO-2026-0002',
    customerId: customer2._id,
    systemCapacityKw: 10.0,
    currentStage: 'COMMISSIONED',
    stageHistory: [
      {
        stage: 'PROJECT_INITIATED',
        updatedBy: salesManager.fullName,
        timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        stage: 'COMMISSIONED',
        updatedBy: projectMgr.fullName,
        notes: 'Net-meter synchronized and plant commissioned.',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
    assignedProjectManagerId: projectMgr._id,
    assignedProjectManagerName: projectMgr.fullName,
    assignedCrewId: techLead._id,
    assignedCrewName: techLead.fullName,
    branchId: branchPune._id,
    actualCommissioningDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isBlocked: false,
  });

  await CommissioningRecord.create({
    commissioningId: 'COM-2026-0001',
    projectId: projectCommissioned._id,
    finalCapacityKw: 10.0,
    gridSyncDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    commissioningCertificateNumber: 'CERT-MSEDCL-2026-00441',
    certificateFileUrl: '/uploads/sample_commissioning.pdf',
    initialMeterReadingKwh: 12,
    signedByEngineerId: projectMgr._id,
    customerSignOff: true,
    status: 'COMMISSIONED',
  });

  await Warranty.create({
    warrantyId: 'WAR-0001',
    projectId: projectCommissioned._id,
    customerId: customer2._id,
    panelPerformanceYears: 25,
    panelProductYears: 12,
    inverterWarrantyYears: 8,
    workmanshipWarrantyYears: 5,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + (5 * 365 - 10) * 24 * 60 * 60 * 1000),
    terms: [
      '5 Years comprehensive system warranty with 4 scheduled maintenance visits per year.',
      '8 Years manufacturer inverter replacement warranty.',
      '25 Years 80% linear generation warranty on solar modules.',
    ],
    isActive: true,
  });

  await AMCContract.create({
    amcId: 'AMC-0001',
    projectId: projectCommissioned._id,
    customerId: customer2._id,
    planName: 'COMPREHENSIVE_GOLD',
    annualFeePaise: 0,
    visitsPerYear: 4,
    visitsCompleted: 1,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + (365 - 10) * 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
  });

  await Ticket.create({
    ticketId: 'TKT-2026-0001',
    customerId: customer2._id,
    projectId: projectCommissioned._id,
    category: 'CLEANING_REQUEST',
    priority: 'LOW',
    status: 'ASSIGNED',
    subject: 'First Quarter Solar Panel Dust Cleaning Visit',
    description: 'Scheduled first quarter maintenance and module dust washing.',
    assignedTechnicianId: techLead._id,
    assignedTechnicianName: techLead.fullName,
    isWarrantyCovered: true,
    slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
  });

  console.log('[Seed] Seeding Initial Audit Logs...');
  await AuditLog.create({
    auditId: 'AUD-INIT-001',
    userId: superAdmin._id,
    userEmail: superAdmin.email,
    action: 'SYSTEM_BOOTSTRAP',
    resourceType: 'System',
    ipAddress: '127.0.0.1',
    details: { message: 'HeliosOps Enterprise database initialized with seed data' },
  });

  console.log('[Seed] Database successfully seeded with realistic enterprise data!');
  console.log(`
  Demo Credentials for Testing:
  ==============================================================
  1. Super Admin:           admin@heliosops.com         / Admin@2026
  2. Sales Manager:         sales.manager@heliosops.com / Solar@2026
  3. Sales Executive:       sales.exec@heliosops.com    / Solar@2026
  4. Site Survey Engineer:  survey.eng@heliosops.com    / Solar@2026
  5. Design Engineer:       design.eng@heliosops.com    / Solar@2026
  6. Project Manager:       project.mgr@heliosops.com   / Solar@2026
  7. Technician:            tech.lead@heliosops.com     / Solar@2026
  8. QA Engineer:           qa.lead@heliosops.com       / Solar@2026
  9. Finance Manager:       finance.mgr@heliosops.com   / Solar@2026
  10. Warehouse Manager:    warehouse.mgr@heliosops.com / Solar@2026
  11. DISCOM Coordinator:   discom.coord@heliosops.com  / Solar@2026
  12. Customer Portal:      rajesh.sharma@gmail.com     / Customer@2026
  ==============================================================
  `);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
