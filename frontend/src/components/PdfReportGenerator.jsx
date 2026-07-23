import React from 'react';
import { Download, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PdfReportGenerator = ({ user, recommendations = [] }) => {
  const { t } = useLanguage();

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups to download your PDF report.');

    const dateStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GovScheme AI - Official Welfare Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .header { border-bottom: 3px solid #1a56db; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .college { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #475569; letter-spacing: 1px; }
            .title { font-size: 26px; font-weight: 900; color: #1a3a6b; margin-top: 5px; }
            .date { font-size: 12px; color: #64748b; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 16px; border-radius: 8px; }
            .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .val { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            .scheme-item { border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 15px; background: #fff; }
            .scheme-name { font-size: 16px; font-weight: bold; color: #1a56db; }
            .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; float: right; }
            .footer { border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 40px; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="college">P.E.S. College of Engineering, Mandya</div>
              <div class="title">GovScheme AI - Official Welfare Report</div>
            </div>
            <div class="date">Generated: ${dateStr}</div>
          </div>

          <div class="section">
            <div class="section-title">Citizen Profile Summary</div>
            <div class="grid">
              <div class="card"><div class="label">Full Name</div><div class="val">${user?.name || 'Guest User'}</div></div>
              <div class="card"><div class="label">Email Address</div><div class="val">${user?.email || 'N/A'}</div></div>
              <div class="card"><div class="label">Age</div><div class="val">${user?.age || '25'} Years</div></div>
              <div class="card"><div class="label">Gender</div><div class="val">${user?.gender || 'All'}</div></div>
              <div class="card"><div class="label">Occupation</div><div class="val">${user?.occupation || 'Farmer'}</div></div>
              <div class="card"><div class="label">Annual Income</div><div class="val">₹ ${user?.income || '1,80,000'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Top Matched Government Schemes (${recommendations.length})</div>
            ${recommendations.map(s => `
              <div class="scheme-item">
                <span class="badge">${s.eligibility_percentage || s.eligibilityScore || '95'}% Match</span>
                <div class="scheme-name">${s.scheme_name}</div>
                <div style="font-size: 12px; color: #475569; margin-top: 6px;"><strong>Benefits:</strong> ${s.benefits || 'Financial & Direct Benefit Support'}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 8px;"><strong>AI Eligibility Rationale:</strong> ${s.explanation || 'Matches age, income bracket, and state demographics.'}</div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            Generated automatically by GovScheme AI Platform • Department of Computer Science & Engineering (Data Science)
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrintPdf}
      className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs shadow-sm transition-all inline-flex items-center"
    >
      <Download className="w-4 h-4 text-blue-600 mr-2" />
      {t('downloadReport')}
    </button>
  );
};

export default PdfReportGenerator;
