import { Response, NextFunction } from 'express';
import { LoanApplication } from '../../models/RegistrationApplication';
import { Project } from '../../models/Project';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getLoans(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, status } = req.query;
    const query: any = {};

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;

    const loans = await LoanApplication.find(query)
      .populate('projectId', 'projectId workOrderNumber customerId')
      .populate('customerId', 'name phone email customerId')
      .populate('assignedFinanceOfficerId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { loans } });
  } catch (error) {
    next(error);
  }
}

export async function createLoan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, customerId, financingPartner, applicationNumber, requestedAmountPaise } = req.body;

    const count = await LoanApplication.countDocuments();
    const loanId = `LN-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const loan = await LoanApplication.create({
      loanId,
      projectId,
      customerId,
      financingPartner,
      applicationNumber,
      requestedAmountPaise,
      status: 'SUBMITTED',
      assignedFinanceOfficerId: req.user?.userId,
    });

    await logAuditEvent(req, 'CREATE_LOAN_APP', 'LoanApplication', (loan._id as any).toString(), {
      loanId,
      applicationNumber,
      financingPartner,
    });

    res.status(201).json({
      success: true,
      message: 'Financing loan application logged',
      data: { loan },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLoanStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, sanctionedAmountPaise, disbursedAmountPaise, sanctionLetterUrl, rejectionReason } = req.body;

    const loan = await LoanApplication.findById(id);
    if (!loan) {
      throw new AppError('Loan record not found', 404);
    }

    loan.status = status;
    if (sanctionedAmountPaise !== undefined) loan.sanctionedAmountPaise = sanctionedAmountPaise;
    if (disbursedAmountPaise !== undefined) loan.disbursedAmountPaise = disbursedAmountPaise;
    if (sanctionLetterUrl) loan.sanctionLetterUrl = sanctionLetterUrl;
    if (rejectionReason) loan.rejectionReason = rejectionReason;

    await loan.save();

    await logAuditEvent(req, 'UPDATE_LOAN_STATUS', 'LoanApplication', id, {
      status,
      sanctionedAmountPaise,
    });

    res.status(200).json({
      success: true,
      message: `Loan status updated to ${status}`,
      data: { loan },
    });
  } catch (error) {
    next(error);
  }
}
