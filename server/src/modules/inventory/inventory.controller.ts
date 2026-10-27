import { Response, NextFunction } from 'express';
import { InventoryItem, StockMovement, Warehouse } from '../../models/InventoryItem';
import { MaterialDispatch } from '../../models/InstallationOperations';
import { Project } from '../../models/Project';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getInventory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, warehouseId, lowStock } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (warehouseId) query.warehouseId = warehouseId;

    let items = await InventoryItem.find(query)
      .populate('warehouseId', 'name city warehouseCode')
      .sort({ name: 1 });

    if (lowStock === 'true') {
      items = items.filter((item) => item.currentStock <= item.reorderLevel);
    }

    res.status(200).json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
}

export async function inwardStock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sku, warehouseId, qty, unitCostPaise, referenceId, notes, serialNumbers } = req.body;

    const item = await InventoryItem.findOne({ sku: sku.toUpperCase() });
    if (!item) {
      throw new AppError(`Item with SKU ${sku} not found`, 404);
    }

    item.currentStock += qty;
    if (unitCostPaise) item.unitCostPaise = unitCostPaise;
    if (serialNumbers && Array.isArray(serialNumbers)) {
      item.serialNumbers = [...(item.serialNumbers || []), ...serialNumbers];
    }
    await item.save();

    const count = await StockMovement.countDocuments();
    const movementId = `MOV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    await StockMovement.create({
      movementId,
      sku: item.sku,
      warehouseId: warehouseId || item.warehouseId,
      movementType: 'INWARD',
      qty,
      referenceType: 'PURCHASE_ORDER',
      referenceId,
      performedBy: req.user?.userId,
      notes,
    });

    await logAuditEvent(req, 'INWARD_STOCK', 'InventoryItem', (item._id as any).toString(), {
      sku: item.sku,
      qtyAdded: qty,
      newStock: item.currentStock,
    });

    res.status(200).json({
      success: true,
      message: `Successfully received ${qty} units of ${item.name}`,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

export async function dispatchMaterial(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, items, vehicleNumber, driverName, driverPhone } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check stock availability first to prevent negative stock
    for (const line of items) {
      const invItem = await InventoryItem.findOne({ sku: line.sku.toUpperCase() });
      if (!invItem) {
        throw new AppError(`SKU ${line.sku} not found in inventory`, 404);
      }
      if (invItem.currentStock < line.qty) {
        throw new AppError(
          `Insufficient stock for ${invItem.name} (${line.sku}). Available: ${invItem.currentStock}, Requested: ${line.qty}`,
          400
        );
      }
    }

    // Deduct stock and log movements
    for (const line of items) {
      const invItem = await InventoryItem.findOne({ sku: line.sku.toUpperCase() });
      if (invItem) {
        invItem.currentStock -= line.qty;
        await invItem.save();

        const count = await StockMovement.countDocuments();
        await StockMovement.create({
          movementId: `MOV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`,
          sku: invItem.sku,
          warehouseId: invItem.warehouseId,
          movementType: 'OUTWARD_DISPATCH',
          qty: line.qty,
          referenceType: 'PROJECT',
          referenceId: project.projectId,
          performedBy: req.user?.userId,
          notes: `Dispatched to site for ${project.projectId}`,
        });
      }
    }

    const dispCount = await MaterialDispatch.countDocuments();
    const dispatchId = `DSP-${new Date().getFullYear()}-${(dispCount + 1).toString().padStart(4, '0')}`;
    const challanNumber = `DC-${new Date().getFullYear()}-${(dispCount + 1).toString().padStart(4, '0')}`;

    const dispatch = await MaterialDispatch.create({
      dispatchId,
      projectId: project._id,
      workOrderNumber: project.workOrderNumber,
      items,
      vehicleNumber,
      driverName,
      driverPhone,
      challanNumber,
      status: 'DISPATCHED',
      dispatchedAt: new Date(),
      dispatchedBy: req.user?.userId,
    });

    // Advance project stage to MATERIAL_DISPATCHED
    project.currentStage = 'MATERIAL_DISPATCHED';
    project.stageHistory.push({
      stage: 'MATERIAL_DISPATCHED',
      updatedBy: req.user?.fullName || 'Warehouse Manager',
      notes: `Materials dispatched via Challan ${challanNumber} (Vehicle: ${vehicleNumber})`,
      timestamp: new Date(),
    });
    await project.save();

    await logAuditEvent(req, 'DISPATCH_MATERIAL', 'MaterialDispatch', (dispatch._id as any).toString(), {
      dispatchId,
      challanNumber,
      projectId: project.projectId,
    });

    res.status(201).json({
      success: true,
      message: 'Material dispatched successfully and Delivery Challan generated',
      data: { dispatch, project },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDispatches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId } = req.query;
    const query: any = {};
    if (projectId) query.projectId = projectId;

    const dispatches = await MaterialDispatch.find(query)
      .populate('projectId', 'projectId workOrderNumber customerId')
      .populate('dispatchedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { dispatches } });
  } catch (error) {
    next(error);
  }
}
