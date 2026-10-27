import { Response, NextFunction } from 'express';
import { ProjectDocument } from '../../models/Document';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, customerId, category, status } = req.query;
    const query: any = {};

    if (projectId) query.projectId = projectId;
    if (customerId) query.customerId = customerId;
    if (category) query.category = category;
    if (status) query.status = status;

    const documents = await ProjectDocument.find(query)
      .populate('customerId', 'name customerId')
      .populate('projectId', 'projectId workOrderNumber')
      .populate('verifiedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { documents } });
  } catch (error) {
    next(error);
  }
}

export async function uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, customerId, category, title, fileUrl, fileType, fileSize } = req.body;

    const count = await ProjectDocument.countDocuments();
    const documentId = `DOC-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const doc = await ProjectDocument.create({
      documentId,
      projectId,
      customerId,
      category,
      title: title || `${category} Document`,
      fileUrl: fileUrl || '/uploads/sample_doc.pdf',
      fileType: fileType || 'application/pdf',
      fileSize: fileSize || 1024 * 250,
      status: 'UNDER_REVIEW',
    });

    await logAuditEvent(req, 'UPLOAD_DOCUMENT', 'ProjectDocument', (doc._id as any).toString(), {
      documentId,
      category,
      projectId,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and queued for verification',
      data: { document: doc },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const doc = await ProjectDocument.findById(id);
    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    doc.status = status;
    doc.verifiedBy = req.user?.userId as any;
    doc.verifiedAt = new Date();
    if (status === 'REJECTED' || status === 'CORRECTION_REQUIRED') {
      doc.rejectionReason = rejectionReason || 'Document details do not match or are unreadable';
    } else {
      doc.rejectionReason = undefined;
    }

    await doc.save();

    await logAuditEvent(req, 'VERIFY_DOCUMENT', 'ProjectDocument', id, {
      status,
      rejectionReason: doc.rejectionReason,
    });

    res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: { document: doc },
    });
  } catch (error) {
    next(error);
  }
}

export async function initiateNameCorrection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { documentId, nameOnBill, nameOnId, requestedCorrectName, discomApplicationRef } = req.body;

    const doc = await ProjectDocument.findById(documentId);
    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    doc.nameMismatchDetails = {
      hasMismatch: true,
      nameOnBill,
      nameOnId,
      requestedCorrectName,
      discomApplicationRef,
      resolutionStatus: 'SUBMITTED',
    };
    doc.status = 'CORRECTION_REQUIRED';
    await doc.save();

    await logAuditEvent(req, 'NAME_CORRECTION_WORKFLOW', 'ProjectDocument', documentId, {
      nameOnBill,
      requestedCorrectName,
      discomApplicationRef,
    });

    res.status(200).json({
      success: true,
      message: 'Name correction application logged and tracked for DISCOM resolution',
      data: { document: doc },
    });
  } catch (error) {
    next(error);
  }
}
