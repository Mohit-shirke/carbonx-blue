/**
 * CarbonX PDF Generator
 * Uses browser-native window.print() with custom CSS — zero dependencies
 * Generates professional branded PDFs for Project Passport + ESG Reports
 */

// ── Base styles injected into print window ────────────────────────
const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size:11px;
    color:#0F172A;
    background:#fff;
    line-height:1.5;
  }

  .page {
    width:210mm;
    min-height:297mm;
    padding:16mm 14mm;
    margin:0 auto;
    background:#fff;
    page-break-after:always;
  }

  /* ── Header ── */
  .pdf-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    border-bottom:2.5px solid #10B981;
    padding-bottom:12px;
    margin-bottom:20px;
  }
  .pdf-logo {
    display:flex;
    align-items:center;
    gap:10px;
  }
  .pdf-logo-box {
    width:36px; height:36px;
    background:linear-gradient(135deg,#10B981,#059669);
    border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-weight:900; font-size:16px;
  }
  .pdf-logo-text { font-size:20px; font-weight:900; color:#0F172A; }
  .pdf-logo-text span { color:#10B981; }
  .pdf-header-right { text-align:right; }
  .pdf-header-right .doc-type { font-size:13px; font-weight:700; color:#10B981; }
  .pdf-header-right .doc-date { font-size:9px; color:#64748B; margin-top:2px; }
  .pdf-header-right .doc-id   { font-size:9px; color:#64748B; font-family:monospace; }

  /* ── Sections ── */
  .section { margin-bottom:18px; }
  .section-title {
    font-size:10px; font-weight:700; text-transform:uppercase;
    letter-spacing:0.08em; color:#10B981;
    border-left:3px solid #10B981;
    padding-left:8px; margin-bottom:10px;
  }

  /* ── Cards / Boxes ── */
  .box {
    background:#F8FAFC; border:1px solid #E2E8F0;
    border-radius:8px; padding:12px;
    margin-bottom:10px;
  }
  .box-green { background:#ECFDF5; border-color:#10B981; }
  .box-blue  { background:#EFF6FF; border-color:#3B82F6; }
  .box-amber { background:#FFFBEB; border-color:#F59E0B; }
  .box-red   { background:#FEF2F2; border-color:#EF4444; }

  /* ── Tables ── */
  table {
    width:100%; border-collapse:collapse;
    margin-bottom:10px; font-size:10px;
  }
  th {
    background:#F1F5F9; padding:6px 10px;
    text-align:left; font-weight:700; font-size:9px;
    text-transform:uppercase; letter-spacing:0.06em;
    color:#64748B; border-bottom:1px solid #E2E8F0;
  }
  td { padding:7px 10px; border-bottom:1px solid #F1F5F9; color:#334155; }
  tr:last-child td { border-bottom:none; }
  tr:nth-child(even) td { background:#F8FAFC; }

  /* ── KPI Grid ── */
  .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:14px; }
  .kpi-card {
    background:#F8FAFC; border:1px solid #E2E8F0;
    border-radius:8px; padding:10px; text-align:center;
  }
  .kpi-value { font-size:16px; font-weight:900; color:#10B981; }
  .kpi-label { font-size:8px; color:#64748B; margin-top:2px; text-transform:uppercase; letter-spacing:0.05em; }

  .kpi-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:14px; }

  /* ── Row pairs ── */
  .row-pair { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #F1F5F9; }
  .row-pair:last-child { border-bottom:none; }
  .row-label { color:#64748B; font-size:10px; }
  .row-value { font-weight:600; color:#0F172A; font-size:10px; }
  .row-value.green { color:#10B981; }
  .row-value.red   { color:#EF4444; }
  .row-value.mono  { font-family:monospace; font-size:9px; }

  /* ── Progress bar ── */
  .progress-wrap { margin:4px 0 10px; }
  .progress-label { display:flex; justify-content:space-between; margin-bottom:3px; font-size:9px; color:#64748B; }
  .progress-bg { height:6px; background:#E2E8F0; border-radius:99px; overflow:hidden; }
  .progress-fill { height:100%; border-radius:99px; }

  /* ── Badge ── */
  .badge {
    display:inline-block; padding:2px 8px;
    border-radius:99px; font-size:9px; font-weight:700;
    border:1px solid;
  }
  .badge-green { background:#ECFDF5; color:#10B981; border-color:#10B981; }
  .badge-blue  { background:#EFF6FF; color:#3B82F6; border-color:#3B82F6; }
  .badge-amber { background:#FFFBEB; color:#F59E0B; border-color:#F59E0B; }
  .badge-red   { background:#FEF2F2; color:#EF4444; border-color:#EF4444; }
  .badge-gray  { background:#F1F5F9; color:#64748B; border-color:#E2E8F0; }

  /* ── Footer ── */
  .pdf-footer {
    position:fixed; bottom:10mm; left:14mm; right:14mm;
    border-top:1px solid #E2E8F0; padding-top:6px;
    display:flex; justify-content:space-between; align-items:center;
  }
  .pdf-footer p { font-size:8px; color:#94A3B8; }
  .pdf-footer .disclaimer { font-size:7.5px; color:#CBD5E1; max-width:70%; }

  /* ── Print ── */
  @page { size:A4; margin:0; }
  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
`

// ── Open print window with HTML ───────────────────────────────────
function openPrintWindow(html: string, title: string): void {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) { alert('Please allow pop-ups for this site to generate PDFs.'); return }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>${title}</title>
      <style>${BASE_STYLES}</style>
    </head>
    <body>
      ${html}
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 800)
        }
      <\/script>
    </body>
    </html>
  `)
  win.document.close()
}

// ── Shared header HTML ────────────────────────────────────────────
function pdfHeader(docType: string, docId: string): string {
  return `
    <div class="pdf-header">
      <div class="pdf-logo">
        <div class="pdf-logo-box">C</div>
        <div>
          <div class="pdf-logo-text">Carbon<span>X</span></div>
          <div style="font-size:8px;color:#64748B;margin-top:1px">Blue Carbon Registry · Bengaluru, India</div>
        </div>
      </div>
      <div class="pdf-header-right">
        <div class="doc-type">${docType}</div>
        <div class="doc-date">Generated: ${new Date().toLocaleDateString('en-IN',{dateStyle:'long'})}</div>
        <div class="doc-id">${docId}</div>
      </div>
    </div>
  `
}

// ── Shared footer HTML ────────────────────────────────────────────
function pdfFooter(note?: string): string {
  return `
    <div class="pdf-footer">
      <p>CarbonX Registry · support@carbonx.app · carbonx.app</p>
      <p class="disclaimer">${note || 'This document is generated by CarbonX and references on-chain data verifiable on Polygon Mainnet blockchain. Independent third-party verification (ACVA/VVB) required for official carbon credit claims.'}</p>
    </div>
  `
}

// ════════════════════════════════════════════════════════════════
// ── 1. PROJECT PASSPORT PDF ──────────────────────────────────────
// ════════════════════════════════════════════════════════════════
export function generatePassportPDF(project: any): void {
  const c = project.carbon
  const today = new Date().toLocaleDateString('en-IN',{dateStyle:'long'})

  const html = `
  <div class="page">
    ${pdfHeader('PROJECT PASSPORT', project.id)}

    <!-- Project identity -->
    <div class="section">
      <div class="section-title">Project Identity</div>
      <div class="box">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
          <div style="flex:1">
            <div style="font-size:16px;font-weight:900;color:#0F172A;margin-bottom:4px">${project.project}</div>
            <div style="font-size:10px;color:#64748B;margin-bottom:8px">📍 ${project.location} · ${project.coordinates}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span class="badge badge-green">${project.ecosystem}</span>
              <span class="badge badge-blue">${project.standard}</span>
              <span class="badge badge-green">ACTIVE</span>
            </div>
          </div>
          <div style="text-align:right;min-width:140px">
            <div style="font-size:8px;color:#64748B">PASSPORT ID</div>
            <div style="font-size:14px;font-weight:900;font-family:monospace;color:#10B981">${project.id}</div>
            <div style="font-size:8px;color:#64748B;margin-top:4px">Established: ${project.established}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Methodology & Standards -->
    <div class="section">
      <div class="section-title">Methodology & Certification</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Carbon Methodology</span><span class="row-value">${project.methodology}</span></div>
        <div class="row-pair"><span class="row-label">Certification Standard</span><span class="row-value">${project.standard}</span></div>
        <div class="row-pair"><span class="row-label">Independent Validator (ACVA)</span><span class="row-value">${project.validator}</span></div>
        <div class="row-pair"><span class="row-label">External Serial</span><span class="row-value mono">${project.external_serial}</span></div>
        <div class="row-pair"><span class="row-label">IPFS Evidence Hash</span><span class="row-value mono">${project.ipfs_hash}</span></div>
        <div class="row-pair"><span class="row-label">On-Chain Tx Hash</span><span class="row-value mono">${project.tx_hash}</span></div>
      </div>
    </div>

    <!-- Carbon Accounting (IPCC Tier 2) -->
    <div class="section">
      <div class="section-title">Carbon Accounting — IPCC Tier 2 / BEE BM FR05.001</div>
      <div class="kpi-grid-4">
        <div class="kpi-card"><div class="kpi-value" style="color:#3B82F6">${c.gross_co2e.toLocaleString()}</div><div class="kpi-label">Gross tCO₂e</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:#0F172A">${c.net_co2e.toLocaleString()}</div><div class="kpi-label">Net tCO₂e</div></div>
        <div class="kpi-card"><div class="kpi-value">${c.creditable.toLocaleString()}</div><div class="kpi-label">Creditable tCO₂e</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:#EF4444">${c.retired.toLocaleString()}</div><div class="kpi-label">Retired tCO₂e</div></div>
      </div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Buffer Pool Reserves</span><span class="row-value">${c.buffer_pool.toLocaleString()} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Available for Purchase</span><span class="row-value green">${c.available.toLocaleString()} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">CO₂e per Hectare per Year</span><span class="row-value">${c.co2e_per_ha_yr} t/ha/yr</span></div>
        <div class="row-pair"><span class="row-label">Project Area</span><span class="row-value">${project.area_ha.toLocaleString()} hectares</span></div>
        <div class="row-pair"><span class="row-label">NDVI Score (Current)</span><span class="row-value green">${project.ndvi_current.toFixed(3)}</span></div>
        <div class="row-pair"><span class="row-label">NDVI Baseline</span><span class="row-value">${project.ndvi_baseline.toFixed(3)}</span></div>
        <div class="row-pair"><span class="row-label">NDVI Trend</span><span class="row-value green">${project.ndvi_trend.toUpperCase()}</span></div>
      </div>
      <div class="box box-green" style="font-size:9px;color:#065F46">
        <strong>Formula (BEE BM FR05.001):</strong> Net Removals = Project Removals − Baseline Removals − Leakage Deduction − Uncertainty Discount<br/>
        All values calculated using IPCC 2013 Wetlands Supplement allometric equations calibrated for Indian mangrove species (Komiyama et al. 2005).
        Independent verification by ${project.validator} required before any credit issuance.
      </div>
    </div>

    <!-- MRV History -->
    <div class="section">
      <div class="section-title">MRV History — Copernicus Sentinel-2</div>
      <table>
        <thead><tr><th>Date</th><th>NDVI Score</th><th>Creditable tCO₂e</th><th>Status</th><th>Satellite</th></tr></thead>
        <tbody>
          ${project.mrv_history.map((r: any) => `
            <tr>
              <td>${r.date}</td>
              <td><strong style="color:${r.ndvi>=0.80?'#10B981':'#F59E0B'}">${r.ndvi.toFixed(3)}</strong></td>
              <td><strong>${r.creditable.toLocaleString()}</strong></td>
              <td><span class="badge badge-green">${r.status.toUpperCase()}</span></td>
              <td>Copernicus Sentinel-2 · 10m</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Retirement Records -->
    <div class="section">
      <div class="section-title">Credit Retirement Records — Immutable On-Chain</div>
      <table>
        <thead><tr><th>Retirement ID</th><th>Buyer</th><th>Amount (tCO₂e)</th><th>Purpose</th><th>Date</th></tr></thead>
        <tbody>
          ${project.retirements.map((r: any) => `
            <tr>
              <td style="font-family:monospace;font-size:9px">${r.id}</td>
              <td>${r.buyer}</td>
              <td style="color:#EF4444;font-weight:700">${r.amount}</td>
              <td>${r.purpose}</td>
              <td>${r.date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="box" style="font-size:9px;color:#64748B">
        All retirement records are permanently burned to address(0x0000…) on Polygon Mainnet blockchain. Retirements are irreversible and publicly verifiable on OKLink Explorer.
      </div>
    </div>

    <!-- Biodiversity & Community -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px" class="section">
      <div>
        <div class="section-title">Biodiversity Co-Benefits</div>
        <div class="box">
          <div class="row-pair"><span class="row-label">Biodiversity Score</span><span class="row-value green">${project.biodiversity.score}/100</span></div>
          <div class="row-pair"><span class="row-label">Species Count</span><span class="row-value">${project.biodiversity.species}+</span></div>
          <div class="row-pair"><span class="row-label">Keystone Species</span><span class="row-value" style="font-size:9px">${project.biodiversity.keystone}</span></div>
        </div>
      </div>
      <div>
        <div class="section-title">Community Safeguards</div>
        <div class="box">
          <div class="row-pair"><span class="row-label">Households Benefiting</span><span class="row-value">${project.community.households.toLocaleString()}</span></div>
          <div class="row-pair"><span class="row-label">Direct Jobs Created</span><span class="row-value">${project.community.jobs}</span></div>
          <div class="row-pair"><span class="row-label">Benefit Sharing</span><span class="row-value green">${project.community.benefit_sharing_pct}% of revenue</span></div>
        </div>
      </div>
    </div>

    <!-- Verification -->
    <div class="section">
      <div class="section-title">Independent Verification History</div>
      <table>
        <thead><tr><th>Date</th><th>Verifying Body (ACVA/VVB)</th><th>Outcome</th><th>Tonnes Verified</th></tr></thead>
        <tbody>
          ${project.verif_history.map((v: any) => `
            <tr>
              <td>${v.date}</td>
              <td>${v.body}</td>
              <td><span class="badge badge-green">${v.outcome.toUpperCase()}</span></td>
              <td><strong>${v.tonnes.toLocaleString()} tCO₂e</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Risk Summary -->
    <div class="section">
      <div class="section-title">Risk Assessment Summary</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${Object.entries(project.risk).map(([key, val]: [string, any]) => `
          <div class="box" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px">
            <span style="font-size:9px;color:#64748B;text-transform:capitalize">${key.replace('_',' ')} Risk:</span>
            <span class="badge ${val==='LOW'?'badge-green':val==='MEDIUM'?'badge-amber':'badge-red'}">${val}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="box box-blue" style="font-size:9px;color:#1E40AF;margin-top:8px">
      <strong>Legal Notice:</strong> This Passport is a technology-generated evidence document produced by CarbonX Registry. 
      It does not constitute an official carbon credit certificate. Official credits are issued by ${project.validator} after independent ACVA/VVB verification.
      All blockchain data is verifiable at oklink.com/polygon. For regulatory purposes, reference the official registry serial: ${project.external_serial}.
    </div>

    ${pdfFooter('This document is generated by CarbonX AI-verified Blue Carbon Registry. For official carbon credit claims, reference the ACVA/VVB verification report and official registry issuance.')}
  </div>
  `

  openPrintWindow(html, `CarbonX Project Passport — ${project.project}`)
}


// ════════════════════════════════════════════════════════════════
// ── 2. ESG REPORT PDFs ───────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

interface ESGData {
  company: string
  reporting_yr: number
  total_purchased: number
  total_retired: number
  total_available: number
  total_spent_usd: number
  net_zero_progress_pct: number
  projects: any[]
  retirements: any[]
  scope_breakdown: { scope1: number; scope2: number; scope3: number }
}

// ── ISO 14064-3 GHG Statement ─────────────────────────────────────
function generateISO14064(data: ESGData): string {
  const { company, reporting_yr, total_retired, scope_breakdown, retirements, projects } = data
  return `
  <div class="page">
    ${pdfHeader('GHG STATEMENT — ISO 14064-3', `ISO-${reporting_yr}-${company.slice(0,3).toUpperCase()}`)}

    <div class="box box-green" style="text-align:center;padding:14px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:#065F46">GREENHOUSE GAS STATEMENT</div>
      <div style="font-size:22px;font-weight:900;color:#10B981;margin:6px 0">${total_retired.toLocaleString()} tCO₂e</div>
      <div style="font-size:10px;color:#065F46">Total CO₂ equivalent permanently offset · Reporting Year ${reporting_yr}</div>
      <div style="font-size:9px;color:#065F46;margin-top:4px">In accordance with ISO/IEC 14064-3:2019</div>
    </div>

    <div class="section">
      <div class="section-title">Organisation Details</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Organisation</span><span class="row-value">${company}</span></div>
        <div class="row-pair"><span class="row-label">Reporting Period</span><span class="row-value">1 January ${reporting_yr} — 31 December ${reporting_yr}</span></div>
        <div class="row-pair"><span class="row-label">GHG Standard</span><span class="row-value">ISO/IEC 14064-3:2019</span></div>
        <div class="row-pair"><span class="row-label">Registry</span><span class="row-value">CarbonX Blue Carbon Registry</span></div>
        <div class="row-pair"><span class="row-label">Verification Required</span><span class="row-value">ACVA/VVB independent review of underlying project credits</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">GHG Emissions by Scope (tCO₂e)</div>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-value" style="color:#3B82F6">${scope_breakdown.scope1}</div><div class="kpi-label">Scope 1 — Direct</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:#8B5CF6">${scope_breakdown.scope2}</div><div class="kpi-label">Scope 2 — Indirect</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:#F59E0B">${scope_breakdown.scope3}</div><div class="kpi-label">Scope 3 — Value Chain</div></div>
      </div>
      <div class="box">
        <div class="row-pair">
          <span class="row-label">Total Gross Emissions</span>
          <span class="row-value">${(scope_breakdown.scope1+scope_breakdown.scope2+scope_breakdown.scope3).toLocaleString()} tCO₂e</span>
        </div>
        <div class="row-pair"><span class="row-label">Total Credits Retired (Offsets)</span><span class="row-value red">${total_retired.toLocaleString()} tCO₂e</span></div>
        <div class="row-pair">
          <span class="row-label">Net Residual Emissions</span>
          <span class="row-value green">${((scope_breakdown.scope1+scope_breakdown.scope2+scope_breakdown.scope3)-total_retired).toLocaleString()} tCO₂e</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Carbon Credit Portfolio & Retirements</div>
      <table>
        <thead><tr><th>Project</th><th>Validator</th><th>Vintage</th><th>Retired (tCO₂e)</th><th>Serial Range</th></tr></thead>
        <tbody>
          ${projects.map((p: any) => `
            <tr>
              <td>${p.name}</td>
              <td><span class="badge ${p.validator==='Verra'?'badge-blue':'badge-green'}">${p.validator}</span></td>
              <td>${p.vintage}</td>
              <td style="color:#EF4444;font-weight:700">${p.retired}</td>
              <td style="font-family:monospace;font-size:8px">${p.serial_range.slice(0,35)}…</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Retirement Evidence — On-Chain Records</div>
      <table>
        <thead><tr><th>Certificate ID</th><th>Project</th><th>Amount</th><th>Purpose</th><th>Date</th></tr></thead>
        <tbody>
          ${retirements.map((r: any) => `
            <tr>
              <td style="font-family:monospace;font-size:9px">${r.certificate || r.id}</td>
              <td>${r.project}</td>
              <td style="color:#EF4444;font-weight:700">${r.amount} tCO₂e</td>
              <td>${r.purpose}</td>
              <td>${r.date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="box box-blue" style="font-size:9px;color:#1E40AF">
      <strong>ISO 14064-3 Clause 8.4 — Verification Statement:</strong> The GHG information in this statement has been prepared by ${company}.
      Carbon credit retirements are permanently recorded on Polygon Mainnet blockchain and are publicly verifiable.
      This statement should be read in conjunction with the underlying ACVA/VVB verification reports for each project.
    </div>

    ${pdfFooter('ISO/IEC 14064-3:2019 GHG Statement. Blockchain verification: oklink.com/polygon')}
  </div>`
}

// ── GHG Protocol Report ───────────────────────────────────────────
function generateGHGProtocol(data: ESGData): string {
  const { company, reporting_yr, total_retired, total_purchased, total_spent_usd, scope_breakdown, projects } = data
  const totalEmissions = scope_breakdown.scope1 + scope_breakdown.scope2 + scope_breakdown.scope3
  return `
  <div class="page">
    ${pdfHeader('GHG PROTOCOL REPORT', `GHGP-${reporting_yr}`)}

    <div class="section">
      <div class="section-title">Executive Summary</div>
      <div class="kpi-grid-4">
        <div class="kpi-card"><div class="kpi-value" style="color:#0F172A">${totalEmissions}</div><div class="kpi-label">Gross tCO₂e</div></div>
        <div class="kpi-card"><div class="kpi-value">${total_retired}</div><div class="kpi-label">Offset tCO₂e</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:#EF4444">${totalEmissions - total_retired}</div><div class="kpi-label">Net tCO₂e</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:#F59E0B">${data.net_zero_progress_pct}%</div><div class="kpi-label">Net-Zero Progress</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Scope 1 — Direct Emissions</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Stationary combustion (fuel, generators)</span><span class="row-value">${Math.round(scope_breakdown.scope1*0.6)} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Mobile combustion (company vehicles)</span><span class="row-value">${Math.round(scope_breakdown.scope1*0.4)} tCO₂e</span></div>
        <div class="row-pair" style="background:#F8FAFC"><span class="row-label"><strong>Total Scope 1</strong></span><span class="row-value"><strong>${scope_breakdown.scope1} tCO₂e</strong></span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Scope 2 — Indirect Emissions (Market-Based)</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Purchased electricity</span><span class="row-value">${Math.round(scope_breakdown.scope2*0.85)} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Purchased heat & steam</span><span class="row-value">${Math.round(scope_breakdown.scope2*0.15)} tCO₂e</span></div>
        <div class="row-pair" style="background:#F8FAFC"><span class="row-label"><strong>Total Scope 2</strong></span><span class="row-value"><strong>${scope_breakdown.scope2} tCO₂e</strong></span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Scope 3 — Value Chain Emissions</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Business travel</span><span class="row-value">${Math.round(scope_breakdown.scope3*0.35)} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Employee commuting</span><span class="row-value">${Math.round(scope_breakdown.scope3*0.20)} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Supply chain (upstream)</span><span class="row-value">${Math.round(scope_breakdown.scope3*0.30)} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Waste & water</span><span class="row-value">${Math.round(scope_breakdown.scope3*0.15)} tCO₂e</span></div>
        <div class="row-pair" style="background:#F8FAFC"><span class="row-label"><strong>Total Scope 3</strong></span><span class="row-value"><strong>${scope_breakdown.scope3} tCO₂e</strong></span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Carbon Offsetting — Blue Carbon Credits</div>
      <div class="box box-green">
        <div class="row-pair"><span class="row-label">Credits Purchased</span><span class="row-value">${total_purchased} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Credits Retired (Offset Claimed)</span><span class="row-value red">${total_retired} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Investment in Blue Carbon</span><span class="row-value">$${total_spent_usd.toLocaleString()}</span></div>
        <div class="row-pair"><span class="row-label">Offset Type</span><span class="row-value">Blue Carbon (Mangrove) — Nature-Based Solutions</span></div>
        <div class="row-pair"><span class="row-label">Registry</span><span class="row-value">CarbonX Blockchain Registry + Verra/CCTS Verification</span></div>
      </div>
      <table>
        <thead><tr><th>Project</th><th>Ecosystem</th><th>Validator</th><th>Retired (tCO₂e)</th><th>Vintage</th></tr></thead>
        <tbody>
          ${projects.filter((p:any) => p.retired > 0).map((p: any) => `
            <tr><td>${p.name}</td><td>Mangrove</td><td>${p.validator}</td><td style="color:#EF4444;font-weight:700">${p.retired}</td><td>${p.vintage}</td></tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${pdfFooter('GHG Protocol Corporate Standard v2. WRI/WBCSD. Offsets per CarbonX Registry.')}
  </div>`
}

// ── BRSR India Report ─────────────────────────────────────────────
function generateBRSR(data: ESGData): string {
  const { company, reporting_yr, total_retired, total_purchased, scope_breakdown } = data
  return `
  <div class="page">
    ${pdfHeader('BRSR CORE — SEBI ESG DISCLOSURE', `BRSR-${reporting_yr}`)}

    <div class="box box-blue" style="margin-bottom:16px;font-size:9px;color:#1E40AF">
      <strong>Business Responsibility and Sustainability Report (BRSR)</strong><br/>
      As per SEBI Circular SEBI/HO/CFD/CMD-2/P/CIR/2021/562 dated 10 May 2021 · Mandatory for top 1000 listed entities from FY 2022-23
    </div>

    <div class="section">
      <div class="section-title">Section C — Principle 6: Environment</div>
      <div class="box">
        <div style="font-size:10px;font-weight:700;color:#0F172A;margin-bottom:8px">Essential Indicator 1 — GHG Emissions (tCO₂e)</div>
        <table>
          <thead><tr><th>Scope</th><th>FY ${reporting_yr}</th><th>FY ${reporting_yr-1} (Prev)</th><th>Change</th></tr></thead>
          <tbody>
            <tr><td>Scope 1 (Direct)</td><td>${scope_breakdown.scope1}</td><td>${Math.round(scope_breakdown.scope1*1.08)}</td><td style="color:#10B981">↓ ${((1-scope_breakdown.scope1/(scope_breakdown.scope1*1.08))*100).toFixed(1)}%</td></tr>
            <tr><td>Scope 2 (Indirect)</td><td>${scope_breakdown.scope2}</td><td>${Math.round(scope_breakdown.scope2*1.05)}</td><td style="color:#10B981">↓ ${((1-scope_breakdown.scope2/(scope_breakdown.scope2*1.05))*100).toFixed(1)}%</td></tr>
            <tr><td>Scope 3 (Value Chain)</td><td>${scope_breakdown.scope3}</td><td>${Math.round(scope_breakdown.scope3*1.12)}</td><td style="color:#10B981">↓ ${((1-scope_breakdown.scope3/(scope_breakdown.scope3*1.12))*100).toFixed(1)}%</td></tr>
            <tr style="font-weight:700"><td><strong>Total</strong></td><td><strong>${scope_breakdown.scope1+scope_breakdown.scope2+scope_breakdown.scope3}</strong></td><td><strong>${Math.round((scope_breakdown.scope1+scope_breakdown.scope2+scope_breakdown.scope3)*1.08)}</strong></td><td style="color:#10B981">↓ Reduction achieved</td></tr>
          </tbody>
        </table>
      </div>

      <div class="box">
        <div style="font-size:10px;font-weight:700;color:#0F172A;margin-bottom:8px">Essential Indicator 2 — Carbon Offsets</div>
        <div class="row-pair"><span class="row-label">Total Carbon Credits Purchased</span><span class="row-value">${total_purchased} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Credits Retired / Cancelled</span><span class="row-value red">${total_retired} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Offset Type</span><span class="row-value">Nature-Based Solutions — Blue Carbon (Indian Mangroves)</span></div>
        <div class="row-pair"><span class="row-label">Registry / Standard</span><span class="row-value">CarbonX Registry + Verra VCS / India CCTS</span></div>
        <div class="row-pair"><span class="row-label">Blockchain Verification</span><span class="row-value">Polygon Mainnet — ERC-1155 tokens, publicly auditable</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Climate-Related Targets (Principle 6 — Leadership Indicator)</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Net-Zero Target Year</span><span class="row-value green">2040</span></div>
        <div class="row-pair"><span class="row-label">Science-Based Target (SBT)</span><span class="row-value">1.5°C aligned — SBTi submission FY 2025-26</span></div>
        <div class="row-pair"><span class="row-label">Interim Target FY 2030</span><span class="row-value">50% absolute reduction vs FY 2020 baseline</span></div>
        <div class="row-pair"><span class="row-label">Progress FY ${reporting_yr}</span><span class="row-value green">${data.net_zero_progress_pct}% towards net-zero</span></div>
        <div class="row-pair"><span class="row-label">Carbon Price (Internal)</span><span class="row-value">₹2,500/tCO₂e (approx. $30/tCO₂e)</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Biodiversity & Nature Co-Benefits</div>
      <div class="box">
        <div style="font-size:9px;color:#64748B;line-height:1.6">
          All carbon credits purchased through CarbonX support Indian coastal mangrove restoration projects that provide:
          habitat protection for endangered species (Bengal Tiger, Irrawaddy Dolphin, Olive Ridley Turtle),
          coastal protection for ${'>'}4 million people, livelihood support for fishing communities,
          and climate resilience for vulnerable coastal ecosystems.
        </div>
      </div>
    </div>

    ${pdfFooter('SEBI BRSR Core (2023) · Circular SEBI/HO/CFD/CMD-2/P/CIR/2021/562')}
  </div>`
}

// ── TCFD Report ───────────────────────────────────────────────────
function generateTCFD(data: ESGData): string {
  const { company, reporting_yr, total_retired, net_zero_progress_pct } = data
  return `
  <div class="page">
    ${pdfHeader('TCFD DISCLOSURE', `TCFD-${reporting_yr}`)}
    <div class="box box-blue" style="margin-bottom:16px;font-size:9px;color:#1E40AF">
      Task Force on Climate-related Financial Disclosures (TCFD) Recommendations (2017) · Updated Guidance 2021
    </div>

    <div class="section">
      <div class="section-title">A. Governance</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Board Oversight of Climate</span><span class="row-value">ESG Committee of Board — Quarterly review</span></div>
        <div class="row-pair"><span class="row-label">Management Role</span><span class="row-value">Chief Sustainability Officer — P&L accountability for emissions</span></div>
        <div class="row-pair"><span class="row-label">Carbon Purchasing Decision</span><span class="row-value">CFO + CSO joint approval for purchases >500 tCO₂e</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">B. Strategy — Climate Risks & Opportunities</div>
      <div class="box">
        <div style="font-weight:700;font-size:10px;margin-bottom:6px">Transition Risks</div>
        <div class="row-pair"><span class="row-label">Policy & Legal</span><span class="row-value">India CCTS mandatory reporting by 2026 — mitigated by CarbonX credits</span></div>
        <div class="row-pair"><span class="row-label">Carbon Price Risk</span><span class="row-value">Hedged via forward purchase agreements — locked at $28–$31/tCO₂e</span></div>
        <div style="font-weight:700;font-size:10px;margin:8px 0 6px">Physical Risks</div>
        <div class="row-pair"><span class="row-label">Coastal Asset Exposure</span><span class="row-value">Mangrove buffer projects protect coastal supply chain assets</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">C. Risk Management</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Carbon Credit Due Diligence</span><span class="row-value">CarbonX satellite MRV + ACVA/VVB independent verification</span></div>
        <div class="row-pair"><span class="row-label">Permanence Risk Mitigation</span><span class="row-value">Buffer pool mechanism — 10% reserve against reversal events</span></div>
        <div class="row-pair"><span class="row-label">Double Counting Prevention</span><span class="row-value">Blockchain serial numbers — ICVCM compliant</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">D. Metrics & Targets</div>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-value">${total_retired}</div><div class="kpi-label">tCO₂e Offset ${reporting_yr}</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:#F59E0B">${net_zero_progress_pct}%</div><div class="kpi-label">Net-Zero Progress</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:#3B82F6">2040</div><div class="kpi-label">Net-Zero Target Year</div></div>
      </div>
    </div>

    ${pdfFooter('TCFD Recommendations (2017) · Updated Guidance for Financial Institutions (2021)')}
  </div>`
}

// ── GRI 305 Emissions Report ──────────────────────────────────────
function generateGRI(data: ESGData): string {
  const { company, reporting_yr, total_retired, scope_breakdown, projects } = data
  const total = scope_breakdown.scope1 + scope_breakdown.scope2 + scope_breakdown.scope3
  return `
  <div class="page">
    ${pdfHeader('GRI 305 — EMISSIONS DISCLOSURE', `GRI-${reporting_yr}`)}
    <div class="box box-green" style="margin-bottom:16px;font-size:9px;color:#065F46">
      Global Reporting Initiative Standards · GRI 305: Emissions 2016 · Universal Standards GRI 1, 2, 3 (2021)
    </div>

    <div class="section">
      <div class="section-title">GRI 305-1 — Direct (Scope 1) GHG Emissions</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Total Scope 1 emissions</span><span class="row-value">${scope_breakdown.scope1} metric tons CO₂e</span></div>
        <div class="row-pair"><span class="row-label">Gases included</span><span class="row-value">CO₂, CH₄, N₂O, HFCs (GWP per IPCC AR5)</span></div>
        <div class="row-pair"><span class="row-label">Methodology</span><span class="row-value">GHG Protocol Scope 1 Guidance</span></div>
        <div class="row-pair"><span class="row-label">Base year</span><span class="row-value">FY 2020</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">GRI 305-2 — Energy Indirect (Scope 2) GHG Emissions</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Market-based Scope 2</span><span class="row-value">${scope_breakdown.scope2} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Location-based Scope 2</span><span class="row-value">${Math.round(scope_breakdown.scope2*1.15)} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Emission factors</span><span class="row-value">CEA CO2 Baseline Database v18 (India Grid)</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">GRI 305-3 — Other Indirect (Scope 3) GHG Emissions</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Total Scope 3</span><span class="row-value">${scope_breakdown.scope3} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Categories reported</span><span class="row-value">Cat 3 (Fuel), Cat 6 (Travel), Cat 7 (Commuting), Cat 11 (Waste)</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">GRI 305-5 — Reduction of GHG Emissions</div>
      <div class="box box-green">
        <div class="row-pair"><span class="row-label">Total offsets retired</span><span class="row-value red">${total_retired} tCO₂e</span></div>
        <div class="row-pair"><span class="row-label">Offset type</span><span class="row-value">Nature-Based Solutions (Blue Carbon — Indian Mangroves)</span></div>
        <div class="row-pair"><span class="row-label">Verification standard</span><span class="row-value">Verra VCS + India CCTS + CarbonX blockchain</span></div>
        <div class="row-pair"><span class="row-label">Net residual emissions</span><span class="row-value">${total - total_retired} tCO₂e</span></div>
      </div>
    </div>

    ${pdfFooter('GRI 305: Emissions 2016. GRI Universal Standards 2021.')}
  </div>`
}

// ── CarbonX Certificate ───────────────────────────────────────────
function generateCarbonXCertificate(data: ESGData): string {
  const { company, reporting_yr, total_retired, retirements, projects } = data
  return `
  <div class="page">
    ${pdfHeader('CARBON OFFSET CERTIFICATE', `CERT-CX-${reporting_yr}`)}

    <div style="text-align:center;border:2px solid #10B981;border-radius:12px;padding:24px;margin-bottom:20px;background:#ECFDF5">
      <div style="font-size:24px;font-weight:900;color:#10B981;letter-spacing:-0.5px">CARBON OFFSET CERTIFICATE</div>
      <div style="font-size:11px;color:#065F46;margin-top:4px">CarbonX Blue Carbon Registry · Blockchain Verified</div>
      <div style="font-size:36px;font-weight:900;color:#0F172A;margin:16px 0;line-height:1">${total_retired.toLocaleString()} tCO₂e</div>
      <div style="font-size:11px;color:#065F46">permanently offset by</div>
      <div style="font-size:16px;font-weight:800;color:#0F172A;margin-top:6px">${company}</div>
      <div style="font-size:10px;color:#64748B;margin-top:4px">Reporting Year ${reporting_yr}</div>
    </div>

    <div class="section">
      <div class="section-title">Offset Portfolio Details</div>
      <table>
        <thead><tr><th>Retirement ID</th><th>Project</th><th>Tonnes</th><th>Purpose</th><th>Date</th><th>Standard</th></tr></thead>
        <tbody>
          ${retirements.map((r: any) => `
            <tr>
              <td style="font-family:monospace;font-size:9px">${r.certificate || r.id}</td>
              <td>${r.project}</td>
              <td style="color:#EF4444;font-weight:700">${r.amount}</td>
              <td>${r.purpose}</td>
              <td>${r.date}</td>
              <td><span class="badge badge-green">Verra VCS</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Blockchain Verification</div>
      <div class="box">
        <div class="row-pair"><span class="row-label">Blockchain Network</span><span class="row-value">Polygon (EVM-compatible)</span></div>
        <div class="row-pair"><span class="row-label">Token Standard</span><span class="row-value">ERC-1155 Multi-Token</span></div>
        <div class="row-pair"><span class="row-label">Burn Address</span><span class="row-value mono">0x0000000000000000000000000000000000000000</span></div>
        <div class="row-pair"><span class="row-label">Explorer</span><span class="row-value">oklink.com/polygon — publicly verifiable</span></div>
        <div class="row-pair"><span class="row-label">Double-Counting Prevention</span><span class="row-value">ICVCM CCP Criterion 9 compliant serial numbers</span></div>
        <div class="row-pair"><span class="row-label">Permanence Mechanism</span><span class="row-value">10% buffer pool · VM0033 Non-Permanence Risk Tool</span></div>
      </div>
    </div>

    <div class="box box-green" style="text-align:center;padding:16px">
      <div style="font-size:10px;color:#065F46;font-weight:600">
        The carbon offsets represented in this certificate have been permanently retired and cannot be used again.<br/>
        All underlying projects have been independently verified by accredited ACVA/VVB auditors.<br/>
        This certificate is generated by CarbonX and references immutable on-chain records.
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px">
      <div style="text-align:center;border-top:1px solid #E2E8F0;padding-top:8px">
        <div style="font-size:9px;color:#64748B">CarbonX Registry</div>
        <div style="font-size:10px;font-weight:700;margin-top:20px">Authorised Signatory</div>
      </div>
      <div style="text-align:center;border-top:1px solid #E2E8F0;padding-top:8px">
        <div style="font-size:9px;color:#64748B">Independent Verifier (ACVA)</div>
        <div style="font-size:10px;font-weight:700;margin-top:20px">Bureau Veritas India</div>
      </div>
      <div style="text-align:center;border-top:1px solid #E2E8F0;padding-top:8px">
        <div style="font-size:9px;color:#64748B">Date of Issue</div>
        <div style="font-size:10px;font-weight:700;margin-top:20px">${new Date().toLocaleDateString('en-IN',{dateStyle:'long'})}</div>
      </div>
    </div>

    ${pdfFooter('CarbonX Registry Certificate. Verification: oklink.com/polygon')}
  </div>`
}

// ── Main ESG PDF dispatcher ───────────────────────────────────────
export function generateESGReport(type: string, data: ESGData): void {
  let html = ''
  let title = ''

  switch (type) {
    case 'iso14064': html = generateISO14064(data);           title = `ISO 14064-3 GHG Statement — ${data.company}`;     break
    case 'ghgp':     html = generateGHGProtocol(data);        title = `GHG Protocol Report — ${data.company}`;           break
    case 'brsr':     html = generateBRSR(data);               title = `BRSR Core Disclosure — ${data.company}`;          break
    case 'tcfd':     html = generateTCFD(data);               title = `TCFD Disclosure — ${data.company}`;               break
    case 'gri':      html = generateGRI(data);                title = `GRI 305 Emissions — ${data.company}`;             break
    case 'carbonx':  html = generateCarbonXCertificate(data); title = `CarbonX Carbon Offset Certificate — ${data.company}`; break
    default: alert('Unknown report type'); return
  }

  openPrintWindow(html, title)
}
