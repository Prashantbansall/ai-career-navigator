// backend/services/pdfReportService.js

import puppeteer from "puppeteer";

/**
 * Escapes unsafe text before injecting it into the HTML report.
 *
 * This prevents special characters in resume names, skills, or AI output
 * from breaking the generated PDF HTML.
 */
const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

/**
 * Converts an array of skills into small badge-style HTML elements.
 */
const renderSkillBadges = (skills = []) => {
  if (!skills.length) {
    return `<p class="muted">No skills available.</p>`;
  }

  return skills
    .map((skill) => `<span class="badge">${escapeHtml(skill)}</span>`)
    .join("");
};

/**
 * Converts AI recommendations into clean card-like rows.
 */
const renderRecommendations = (recommendations = []) => {
  if (!recommendations.length) {
    return `<p class="muted">No recommendations available.</p>`;
  }

  return recommendations
    .map(
      (item, index) => `
        <div class="recommendation">
          <strong>${index + 1}.</strong> ${escapeHtml(item)}
        </div>
      `,
    )
    .join("");
};

/**
 * Converts roadmap items into a PDF-friendly table.
 */
const renderRoadmapRows = (roadmap = []) => {
  if (!roadmap.length) {
    return `
      <tr>
        <td colspan="4" class="muted">No roadmap available.</td>
      </tr>
    `;
  }

  return roadmap
    .map(
      (item, index) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.week || `Week ${index + 1}`)}</strong>
          </td>

          <td>
            <strong>${escapeHtml(item.skill || "Not available")}</strong>
            <p>${escapeHtml(item.learn || "Not available")}</p>
            ${
              item.difficulty
                ? `<p class="small">Difficulty: ${escapeHtml(
                    item.difficulty,
                  )}</p>`
                : ""
            }
            ${
              item.timeEstimate
                ? `<p class="small">Time: ${escapeHtml(item.timeEstimate)}</p>`
                : ""
            }
          </td>

          <td>
            <p>${escapeHtml(item.howToLearn || "Not available")}</p>
            ${
              item.resource
                ? `<p class="small">Resource: ${escapeHtml(item.resource)}</p>`
                : ""
            }
          </td>

          <td>
            ${escapeHtml(item.project || "Not available")}
          </td>
        </tr>
      `,
    )
    .join("");
};

/**
 * Builds the complete printable HTML report.
 */
const buildReportHtml = (analysis) => {
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const roadmap = analysis.aiRoadmap?.length
    ? analysis.aiRoadmap
    : analysis.roadmap || [];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>AI Career Navigator Report</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #ffffff;
          }

          h1 {
            margin: 0;
            font-size: 30px;
            font-weight: 800;
          }

          h2 {
            margin: 28px 0 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #d1d5db;
            font-size: 18px;
          }

          p {
            margin: 6px 0;
            line-height: 1.6;
            font-size: 13px;
          }

          .subtitle {
            color: #6b7280;
            margin-top: 8px;
          }

          .header {
            border-bottom: 3px solid #111827;
            padding-bottom: 18px;
            margin-bottom: 26px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px 32px;
          }

          .label {
            font-size: 13px;
            font-weight: 700;
            color: #4b5563;
          }

          .value {
            font-size: 13px;
            color: #111827;
          }

          .score-card {
            border: 1px solid #d1d5db;
            background: #f9fafb;
            border-radius: 8px;
            padding: 16px;
          }

          .score {
            font-size: 36px;
            font-weight: 800;
            margin-bottom: 8px;
          }

          .badge {
            display: inline-block;
            margin: 4px 5px 4px 0;
            padding: 5px 10px;
            border-radius: 999px;
            border: 1px solid #d1d5db;
            background: #f3f4f6;
            font-size: 11px;
            font-weight: 600;
          }

          .recommendation {
            border: 1px solid #d1d5db;
            background: #f9fafb;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
            font-size: 13px;
            line-height: 1.6;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 10px;
            vertical-align: top;
          }

          th {
            background: #f3f4f6;
            text-align: left;
            font-size: 13px;
          }

          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .small {
            font-size: 11px;
            color: #6b7280;
            margin-top: 8px;
          }

          .muted {
            color: #6b7280;
          }

          .metadata {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #d1d5db;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h1>AI Career Navigator Report</h1>
          <p class="subtitle">
            Personalized career readiness and learning roadmap report
          </p>
        </div>

        <h2>Candidate Overview</h2>
        <div class="grid">
          <div>
            <div class="label">Resume Name</div>
            <div class="value">${escapeHtml(analysis.resumeName)}</div>
          </div>

          <div>
            <div class="label">Target Role</div>
            <div class="value">${escapeHtml(analysis.targetRole)}</div>
          </div>

          <div>
            <div class="label">Role Title</div>
            <div class="value">${escapeHtml(analysis.roleTitle)}</div>
          </div>

          <div>
            <div class="label">Generated Date</div>
            <div class="value">${generatedDate}</div>
          </div>
        </div>

        <h2>Job Readiness Score</h2>
        <div class="score-card">
          <div class="score">${analysis.jobReadiness || 0}%</div>
          <p>${escapeHtml(analysis.readinessReason)}</p>
        </div>

        <h2>Extracted Skills</h2>
        ${renderSkillBadges(analysis.extractedSkills)}

        <h2>Matched Skills</h2>
        ${renderSkillBadges(analysis.matchedSkills)}

        <h2>Missing Skills</h2>
        ${renderSkillBadges(analysis.missingSkills)}

        <h2>AI Career Summary</h2>
        <p>${escapeHtml(analysis.aiSummary || "No AI summary available.")}</p>

        <h2>AI Recommendations</h2>
        ${renderRecommendations(analysis.aiRecommendations)}

        <h2>Week-by-Week Roadmap</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 12%;">Week</th>
              <th style="width: 34%;">What to Learn</th>
              <th style="width: 29%;">How to Learn</th>
              <th style="width: 25%;">Mini Project</th>
            </tr>
          </thead>

          <tbody>
            ${renderRoadmapRows(roadmap)}
          </tbody>
        </table>

        <h2>AI Provider Metadata</h2>
        <div class="metadata">
          <div>
            <div class="label">AI Provider</div>
            <div class="value">${escapeHtml(
              analysis.aiProviderUsed || "Not available",
            )}</div>
          </div>

          <div>
            <div class="label">Model Used</div>
            <div class="value">${escapeHtml(
              analysis.aiModelUsed || "Not available",
            )}</div>
          </div>

          <div>
            <div class="label">Prompt Version</div>
            <div class="value">${escapeHtml(
              analysis.promptVersion || "Not available",
            )}</div>
          </div>
        </div>

        <div class="footer">
          Generated by AI Career Navigator
        </div>
      </body>
    </html>
  `;
};

/**
 * Generates a PDF buffer from a saved analysis object.
 */
export const generateAnalysisPdfBuffer = async (analysis) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(buildReportHtml(analysis), {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "16mm",
        right: "12mm",
        bottom: "18mm",
        left: "12mm",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};
