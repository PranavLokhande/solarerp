import { Response, NextFunction } from 'express';
import { Invoice, Payment, FinancialLedgerEntry } from '../../models/Finance';
import { Project } from '../../models/Project';
import { Customer } from '../../models/Customer';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, customerId, status } = req.query;
    const query: any = {};

    if (projectId) query.projectId = projectId;
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;

    if (req.user?.role === 'Customer') {
      const customer = await Customer.findOne({ customerId: req.user.customerId });
      if (customer) query.customerId = customer._id;
    }

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name phone email customerId')
      .populate('projectId', 'projectId workOrderNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { invoices } });
  } catch (error) {
    next(error);
  }
}

export async function createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, customerId, milestoneName, baseAmountPaise, gstAmountPaise, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const totalAmountPaise = (baseAmountPaise || 0) + (gstAmountPaise || 0);
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      projectId: project._id,
      customerId,
      milestoneName,
      baseAmountPaise,
      gstAmountPaise,
      totalAmountPaise,
      paidAmountPaise: 0,
      balanceDuePaise: totalAmountPaise,
      dueDate: new Date(dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'ISSUED',
    });

    // Immutable Financial Ledger DEBIT Entry
    const lastEntry = await FinancialLedgerEntry.findOne({ customerId }).sort({ createdAt: -1 });
    const prevBalance = lastEntry ? lastEntry.runningBalancePaise : 0;
    const newBalance = prevBalance + totalAmountPaise;

    const ledgerCount = await FinancialLedgerEntry.countDocuments();
    await FinancialLedgerEntry.create({
      entryId: `LED-${(ledgerCount + 1).toString().padStart(5, '0')}`,
      customerId,
      projectId: project._id,
      entryType: 'DEBIT',
      amountPaise: totalAmountPaise,
      runningBalancePaise: newBalance,
      description: `Invoice ${invoiceNumber} issued for milestone: ${milestoneName}`,
      referenceDocType: 'INVOICE',
      referenceDocId: invoiceNumber,
      performedBy: req.user?.userId,
    });

    await logAuditEvent(req, 'CREATE_INVOICE', 'Invoice', (invoice._id as any).toString(), {
      invoiceNumber,
      totalAmountPaise,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice generated and posted to financial ledger',
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, customerId } = req.query;
    const query: any = {};

    if (projectId) query.projectId = projectId;
    if (customerId) query.customerId = customerId;

    if (req.user?.role === 'Customer') {
      const customer = await Customer.findOne({ customerId: req.user.customerId });
      if (customer) query.customerId = customer._id;
    }

    const payments = await Payment.find(query)
      .populate('customerId', 'name phone email customerId')
      .populate('invoiceId', 'invoiceNumber milestoneName')
      .populate('verifiedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { payments } });
  } catch (error) {
    next(error);
  }
}

export async function recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { invoiceId, projectId, customerId, amountPaise, paymentMode, transactionRef, notes } = req.body;

    const count = await Payment.countDocuments();
    const paymentId = `PAY-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    const receiptNumber = `RCT-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    const payment = await Payment.create({
      paymentId,
      receiptNumber,
      invoiceId,
      projectId,
      customerId,
      amountPaise,
      paymentMode,
      transactionRef,
      status: 'VERIFIED',
      verifiedBy: req.user?.userId,
      verifiedAt: new Date(),
      notes,
    });

    // Update invoice if linked
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        invoice.paidAmountPaise += amountPaise;
        invoice.balanceDuePaise = Math.max(0, invoice.totalAmountPaise - invoice.paidAmountPaise);
        if (invoice.balanceDuePaise === 0) {
          invoice.status = 'PAID';
        } else {
          invoice.status = 'PARTIALLY_PAID';
        }
        await invoice.save();
      }
    }

    // Immutable Financial Ledger CREDIT Entry
    const lastEntry = await FinancialLedgerEntry.findOne({ customerId }).sort({ createdAt: -1 });
    const prevBalance = lastEntry ? lastEntry.runningBalancePaise : 0;
    const newBalance = prevBalance - amountPaise;

    const ledgerCount = await FinancialLedgerEntry.countDocuments();
    await FinancialLedgerEntry.create({
      entryId: `LED-${(ledgerCount + 1).toString().padStart(5, '0')}`,
      customerId,
      projectId,
      entryType: 'CREDIT',
      amountPaise,
      runningBalancePaise: newBalance,
      description: `Payment received (${paymentMode}) Ref: ${transactionRef} Receipt: ${receiptNumber}`,
      referenceDocType: 'PAYMENT',
      referenceDocId: receiptNumber,
      performedBy: req.user?.userId,
    });

    await logAuditEvent(req, 'RECORD_PAYMENT', 'Payment', (payment._id as any).toString(), {
      paymentId,
      receiptNumber,
      amountPaise,
    });

    res.status(201).json({
      success: true,
      message: 'Payment verified, receipt issued, and posted to ledger',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerLedger(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId } = req.params;

    const entries = await FinancialLedgerEntry.find({ customerId })
      .populate('performedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { ledger: entries } });
  } catch (error) {
    next(error);
  }
}
