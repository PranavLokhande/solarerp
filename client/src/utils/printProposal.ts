export interface ProposalPrintData {
  proposalId: string;
  customerName: string;
  phone: string;
  city: string;
  state?: string;
  address?: string;
  capacityKw: number;
  ratePerKw: number;
  grossCost: number;
  discountPercent?: number;
  subsidyAmount: number;
  netPayable: number;
  monthlyUnits: number;
  annualUnits: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: string | number;
  lifetime25YrSavings: number;
  panelModel?: string;
  inverterModel?: string;
}

export function generateProposalHtml(data: ProposalPrintData): string {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const discountAmount = data.discountPercent
    ? Math.round((data.capacityKw * data.ratePerKw * data.discountPercent) / 100)
    : 0;

  const panelCount = Math.ceil((data.capacityKw * 1000) / 550);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Solar Proposal - ${data.customerName} - ${data.proposalId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.45;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 14px;
      border-bottom: 2.5px solid #0f172a;
    }
    .brand-title {
      font-size: 18pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-tagline {
      font-size: 8.5pt;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }
    .company-meta {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 6px;
      line-height: 1.35;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-badge {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 4px 10px;
      font-family: monospace;
      font-weight: 800;
      font-size: 9.5pt;
      border-radius: 4px;
      color: #0f172a;
    }
    .meta-list {
      font-size: 8pt;
      color: #334155;
      margin-top: 6px;
      line-height: 1.4;
    }
    .client-card {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
      margin: 14px 0;
      font-size: 8.5pt;
    }
    .section-title {
      font-size: 9pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin: 14px 0 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-size: 8.5pt;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1.5px solid #94a3b8;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .text-right {
      text-align: right;
    }
    .subsidy-row {
      background: #ecfdf5 !important;
      color: #065f46 !important;
      font-weight: 700;
    }
    .total-row {
      background: #0f172a !important;
      color: #ffffff !important;
      font-weight: 800;
      font-size: 10pt;
    }
    .total-row td {
      border-bottom: none;
      padding: 9px 10px;
    }
    .highlight-net {
      color: #fbbf24 !important;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 12px 0;
    }
    .metric-box {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
    }
    .metric-label {
      font-size: 7pt;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }
    .metric-val {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .metric-sub {
      font-size: 6.5pt;
      color: #059669;
      font-weight: 600;
    }
    .boq-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 4px;
      font-size: 8pt;
    }
    .boq-item {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      padding: 6px 8px;
      border-radius: 4px;
    }
    .terms-box {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-top: 12px;
      font-size: 7.5pt;
    }
    .terms-col {
      flex: 1;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      font-size: 7.5pt;
      color: #64748b;
    }
    .signature-line {
      border-bottom: 1.5px solid #334155;
      width: 150px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-title">
        <span>☀️ HELIOSOPS SOLAR EPC</span>
      </div>
      <div class="brand-tagline">
        Rooftop Solar PV Systems • MNRE Approved Channel Partner
      </div>
      <div class="company-meta">
        HeliosOps Solar Private Limited • Pune Central Operations Hub, Maharashtra 411005<br>
        Email: contact@heliosops.com | Helpline: +91 98220 11223 | CIN: U40106PN2026PTC198822 | GSTIN: 27AABCH1234F1Z8
      </div>
    </div>

    <div class="doc-meta">
      <div class="doc-badge">${data.proposalId}</div>
      <div class="meta-list">
        <strong>Date:</strong> ${currentDate}<br>
        <strong>Validity:</strong> 15 Days<br>
        <strong>Scheme:</strong> PM Surya Ghar Muft Bijli
      </div>
    </div>
  </div>

  <!-- Customer Card -->
  <div class="client-card">
    <div>
      <div style="font-size: 7pt; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Proposal Prepared For:</div>
      <div style="font-size: 11pt; font-weight: 800; color: #0f172a; margin-top: 1px;">${data.customerName}</div>
      <div style="color: #475569; margin-top: 2px;">
        ${data.address || `${data.city} City`}, ${data.city}, ${data.state || 'Maharashtra'}<br>
        Contact: <strong>${data.phone}</strong>
      </div>
    </div>

    <div style="text-align: right;">
      <div style="font-size: 7pt; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Proposed Plant Details:</div>
      <div style="font-size: 11pt; font-weight: 800; color: #0f172a; margin-top: 1px;">${data.capacityKw.toFixed(1)} kW On-Grid Solar PV</div>
      <div style="color: #475569; margin-top: 2px;">
        DISCOM: <strong>MSEDCL Net-Metering</strong><br>
        Phase: Single / Three Phase AC
      </div>
    </div>
  </div>

  <!-- Financial Commercials -->
  <div class="section-title">1. Commercial Investment & Subsidy Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Scope Description</th>
        <th class="text-right">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>Turnkey Rooftop Solar PV System (${data.capacityKw.toFixed(1)} kW @ ₹${data.ratePerKw.toLocaleString('en-IN')}/kW)</strong><br>
          <span style="font-size: 7.5pt; color: #64748b;">
            Includes Solar PV Modules, On-Grid Inverter, HDG Mounting Structure, AC/DC Cabling, Switchgear & Complete Installation
          </span>
        </td>
        <td class="text-right" style="font-weight: 700;">₹${data.grossCost.toLocaleString('en-IN')}</td>
      </tr>
      ${discountAmount > 0 ? `
      <tr style="color: #dc2626;">
        <td>Authorized Promotional Discount (${data.discountPercent}%)</td>
        <td class="text-right" style="font-weight: 700;">- ₹${discountAmount.toLocaleString('en-IN')}</td>
      </tr>` : ''}
      <tr class="subsidy-row">
        <td>
          <strong>PM Surya Ghar Muft Bijli Yojana Central Govt DBT Subsidy</strong><br>
          <span style="font-size: 7.5pt; color: #047857; font-weight: 400;">
            Direct Benefit Transfer credited directly to Customer Bank A/c upon DISCOM commissioning
          </span>
        </td>
        <td class="text-right" style="font-size: 9.5pt;">- ₹${data.subsidyAmount.toLocaleString('en-IN')}</td>
      </tr>
      <tr class="total-row">
        <td>EFFECTIVE NET CUSTOMER INVESTMENT PAYABLE:</td>
        <td class="text-right highlight-net">₹${data.netPayable.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <!-- Energy & ROI Metrics -->
  <div class="metrics-grid">
    <div class="metric-box">
      <div class="metric-label">Est. Monthly Generation</div>
      <div class="metric-val">~${data.monthlyUnits} Units</div>
      <div class="metric-sub">kWh / month</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Est. Monthly Bill Savings</div>
      <div class="metric-val" style="color: #059669;">~₹${data.monthlySavings.toLocaleString('en-IN')}</div>
      <div class="metric-sub">Based on DISCOM slab</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Simple Payback Period</div>
      <div class="metric-val" style="color: #2563eb;">~${data.paybackYears} Years</div>
      <div class="metric-sub">Free power after payback</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">25-Yr Cumulative Savings</div>
      <div class="metric-val">~₹${(data.lifetime25YrSavings / 100000).toFixed(2)}L</div>
      <div class="metric-sub">Guaranteed yield</div>
    </div>
  </div>

  <!-- Technical BOQ -->
  <div class="section-title">2. Scope of Equipment & Bill of Materials (BOQ)</div>
  <div class="boq-grid">
    <div class="boq-item">
      <strong>Solar PV Modules:</strong> Tier-1 ALMM Certified 550W Mono PERC Bifacial (${panelCount} Nos.)<br>
      <span style="color: #64748b; font-size: 7pt;">25 Years Linear Performance Warranty (Min. 84.8% at Year 25)</span>
    </div>
    <div class="boq-item">
      <strong>Grid Inverter:</strong> ${data.inverterModel || `Growatt / Solis ${data.capacityKw.toFixed(1)} kW On-Grid MPPT`}<br>
      <span style="color: #64748b; font-size: 7pt;">Built-in Wi-Fi Mobile App Monitoring • 5 Years Replacement Warranty</span>
    </div>
    <div class="boq-item">
      <strong>Mounting Structure:</strong> Hot-Dip Galvanized (HDG) Elevated Rooftop Structure<br>
      <span style="color: #64748b; font-size: 7pt;">80-Micron Zinc Coating • Rated for 150 km/h wind speeds</span>
    </div>
    <div class="boq-item">
      <strong>Electrical & Safety:</strong> Dual Chemical Earthing, Class-II SPD, DCDB/ACDB & Fire Retardant FRLS Cabling<br>
      <span style="color: #64748b; font-size: 7pt;">End-to-End MSEDCL DISCOM Net-Metering approvals included</span>
    </div>
  </div>

  <!-- Payment Terms & Bank Details -->
  <div class="terms-box">
    <div class="terms-col">
      <strong style="color: #0f172a;">Standard Payment Milestones:</strong>
      <ol style="margin: 4px 0 0 16px; padding: 0; line-height: 1.45; color: #475569;">
        <li><strong>20% Advance</strong> upon booking & site engineering survey</li>
        <li><strong>60% Material Dispatch</strong> against delivery of panels & inverter</li>
        <li><strong>15% Installation</strong> upon completion of structure & wiring</li>
        <li><strong>5% Commissioning</strong> upon net-meter installation & subsidy filing</li>
      </ol>
    </div>

    <div class="terms-col">
      <strong style="color: #0f172a;">Bank Details for Token / Advance Payment:</strong>
      <div style="margin-top: 4px; color: #475569; line-height: 1.45;">
        Beneficiary: <strong>HeliosOps Solar EPC Private Limited</strong><br>
        Bank: <strong>HDFC Bank Ltd</strong>, Shivaji Nagar Branch, Pune<br>
        A/C Number: <strong>50200088992211</strong> (Current A/c)<br>
        IFSC Code: <strong>HDFC0000039</strong>
      </div>
    </div>
  </div>

  <!-- Sign-off Footer -->
  <div class="footer">
    <div>
      System Generated Official Proposal • HeliosOps Solar EPC Platform<br>
      This document constitutes a formal preliminary commercial quotation.
    </div>
    <div style="text-align: right;">
      <div class="signature-line"></div>
      <strong style="color: #0f172a;">Authorized Signatory</strong><br>
      <span>HeliosOps Solar Commercial Division</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Robust print function using an invisible iframe.
 * Avoids any modal clipping, background issues, or empty pages.
 */
export function printProposalDocument(data: ProposalPrintData): void {
  const html = generateProposalHtml(data);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback: open clean popup
    const popup = window.open('', '_blank', 'width=900,height=800');
    if (popup) {
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      popup.focus();
      setTimeout(() => popup.print(), 250);
    }
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Iframe print failed, falling back to popup:', err);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 250);
}
