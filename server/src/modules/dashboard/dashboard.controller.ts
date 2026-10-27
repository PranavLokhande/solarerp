import { Response, NextFunction } from 'express';
import { Lead } from '../../models/Lead';
import { Project } from '../../models/Project';
import { SiteSurvey } from '../../models/SiteSurvey';
import { Invoice, Payment } from '../../models/Finance';
import { InventoryItem } from '../../models/InventoryItem';
import { Ticket } from '../../models/ServiceAndSupport';
import { AuthenticatedRequest } from '../../types';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallel aggregation for performance
    const [
      totalLeads,
      newLeadsToday,
      surveysPending,
      activeProjects,
      commissionedProjects,
      invoices,
      payments,
      inventoryItems,
      openTickets,
      projectsByStage,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: today } }),
      SiteSurvey.countDocuments({ status: { $in: ['SCHEDULED', 'IN_PROGRESS'] } }),
      Project.countDocuments({ currentStage: { $nin: ['COMMISSIONED', 'HANDOVER_COMPLETED'] } }),
      Project.countDocuments({ currentStage: { $in: ['COMMISSIONED', 'HANDOVER_COMPLETED'] } }),
      Invoice.find({ status: { $nin: ['CANCELLED', 'DRAFT'] } }),
      Payment.find({ status: 'VERIFIED' }),
      InventoryItem.find(),
      Ticket.countDocuments({ status: { $in: ['OPEN', 'TRIAGED', 'IN_PROGRESS', 'WAITING_FOR_PARTS'] } }),
      Project.aggregate([
        { $group: { _id: '$currentStage', count: { $sum: 1 }, totalKw: { $sum: '$systemCapacityKw' } } },
      ]),
    ]);

    // Financial totals in paise
    const totalInvoicedPaise = invoices.reduce((sum, inv) => sum + inv.totalAmountPaise, 0);
    const totalCollectedPaise = payments.reduce((sum, pay) => sum + pay.amountPaise, 0);
    const outstandingDuePaise = Math.max(0, totalInvoicedPaise - totalCollectedPaise);

    // Total Installed Capacity (kW)
    const commissionedDocs = await Project.find({
      currentStage: { $in: ['COMMISSIONED', 'HANDOVER_COMPLETED'] },
    });
    const totalInstalledCapacityKw = commissionedDocs.reduce((sum, p) => sum + p.systemCapacityKw, 0);

    // Low stock items count
    const lowStockAlerts = inventoryItems.filter((i) => i.currentStock <= i.reorderLevel).length;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalLeads,
          newLeadsToday,
          surveysPending,
          activeProjects,
          commissionedProjects,
          totalInstalledCapacityKw,
          totalInvoicedPaise,
          totalCollectedPaise,
          outstandingDuePaise,
          openTickets,
          lowStockAlerts,
        },
        projectsByStage,
      },
    });
  } catch (error) {
    next(error);
  }
}
