import { Response, NextFunction } from 'express';
import { Ticket, Warranty, AMCContract } from '../../models/ServiceAndSupport';
import { Customer } from '../../models/Customer';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getTickets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, priority, category, customerId, assignedTo } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (customerId) query.customerId = customerId;
    if (assignedTo) query.assignedTechnicianId = assignedTo;

    if (req.user?.role === 'Customer') {
      const customer = await Customer.findOne({ customerId: req.user.customerId });
      if (customer) query.customerId = customer._id;
    }

    const tickets = await Ticket.find(query)
      .populate('customerId', 'name phone email customerId')
      .populate('projectId', 'projectId workOrderNumber systemCapacityKw')
      .populate('assignedTechnicianId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { tickets } });
  } catch (error) {
    next(error);
  }
}

export async function createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId, projectId, category, priority, subject, description } = req.body;

    const count = await Ticket.countDocuments();
    const ticketId = `TKT-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // SLA calculation: Critical=24h, High=48h, Medium=72h, Low=120h
    const hours = priority === 'CRITICAL' ? 24 : priority === 'HIGH' ? 48 : priority === 'MEDIUM' ? 72 : 120;
    const slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

    const ticket = await Ticket.create({
      ticketId,
      customerId,
      projectId,
      category,
      priority: priority || 'MEDIUM',
      subject,
      description,
      status: 'OPEN',
      slaDeadline,
    });

    await logAuditEvent(req, 'CREATE_TICKET', 'Ticket', (ticket._id as any).toString(), {
      ticketId,
      category,
      priority,
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket raised successfully',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { resolutionNotes, status } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    ticket.status = status || 'RESOLVED';
    ticket.resolutionNotes = resolutionNotes;
    ticket.resolvedAt = new Date();
    if (status === 'CLOSED') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    await logAuditEvent(req, 'RESOLVE_TICKET', 'Ticket', id, { status: ticket.status });

    res.status(200).json({
      success: true,
      message: `Ticket marked as ${ticket.status}`,
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
}

export async function getWarranties(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId } = req.query;
    const query: any = {};
    if (customerId) query.customerId = customerId;

    if (req.user?.role === 'Customer') {
      const customer = await Customer.findOne({ customerId: req.user.customerId });
      if (customer) query.customerId = customer._id;
    }

    const warranties = await Warranty.find(query)
      .populate('customerId', 'name customerId phone')
      .populate('projectId', 'projectId workOrderNumber systemCapacityKw')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { warranties } });
  } catch (error) {
    next(error);
  }
}

export async function getAMCContracts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId } = req.query;
    const query: any = {};
    if (customerId) query.customerId = customerId;

    if (req.user?.role === 'Customer') {
      const customer = await Customer.findOne({ customerId: req.user.customerId });
      if (customer) query.customerId = customer._id;
    }

    const contracts = await AMCContract.find(query)
      .populate('customerId', 'name customerId phone')
      .populate('projectId', 'projectId systemCapacityKw')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { contracts } });
  } catch (error) {
    next(error);
  }
}
