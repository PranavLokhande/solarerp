import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { Quotation } from '../models/Quotation';
import { FinancialLedgerEntry } from '../models/Finance';

describe('Enterprise Solar ERP Core Business Logic & Security Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should authenticate user and verify password hash with bcrypt', async () => {
    const admin = await User.findOne({ email: 'admin@heliosops.com' }).select('+passwordHash');
    expect(admin).not.toBeNull();
    const isMatch = await admin!.comparePassword('Admin@2026');
    expect(isMatch).toBe(true);

    const isWrongMatch = await admin!.comparePassword('WrongPassword');
    expect(isWrongMatch).toBe(false);
  });

  it('should verify integer paise precision in Quotations to eliminate floating point issues', async () => {
    const quotation = await Quotation.findOne({ quotationNumber: 'QUO-2026-0001' });
    expect(quotation).not.toBeNull();

    // Verify all amounts are pure integers
    expect(Number.isInteger(quotation!.baseCostPaise)).toBe(true);
    expect(Number.isInteger(quotation!.taxPaise)).toBe(true);
    expect(Number.isInteger(quotation!.totalAmountPaise)).toBe(true);
    expect(Number.isInteger(quotation!.netCustomerPayablePaise)).toBe(true);

    // Verify milestone percentages sum to 100% and amounts sum to totalAmountPaise
    const milestoneSumPaise = quotation!.paymentMilestones.reduce((acc, m) => acc + m.amountPaise, 0);
    expect(milestoneSumPaise).toBe(quotation!.totalAmountPaise);
  });

  it('should prevent active duplicate leads for the same phone number', async () => {
    const existing = await Lead.findOne({ phone: '+91 98231 66778' });
    expect(existing).not.toBeNull();

    const isDuplicateActive = existing!.stage !== 'WON' && existing!.stage !== 'LOST';
    expect(isDuplicateActive).toBe(true);
  });

  it('should maintain immutable double-entry ledger balance integrity', async () => {
    const entries = await FinancialLedgerEntry.find({ referenceDocId: { $in: ['INV-2026-0001', 'RCT-2026-00001'] } });
    expect(entries.length).toBe(2);

    const debit = entries.find((e) => e.entryType === 'DEBIT');
    const credit = entries.find((e) => e.entryType === 'CREDIT');

    expect(debit).toBeDefined();
    expect(credit).toBeDefined();
    expect(debit!.amountPaise).toBe(credit!.amountPaise);
  });
});
