import { format, parseISO } from 'date-fns';
import * as Print from 'expo-print';
import { Platform } from 'react-native';

import { computeCyclePrediction } from '@/features/tracking/prediction';
import { analytics } from '@/lib/analytics';
import { shareLocalFile } from '@/lib/shareLocalFile';
import type { Cycle, DailyLog, RiskBand, ScreenerResult } from '@/types/database';

import { DISCLAIMER_LONG, DISCLAIMER_SHORT, RISK_BAND_LABEL } from './constants';

type ReportInput = {
  result: ScreenerResult;
  cycles: Cycle[];
  dailyLogs: DailyLog[];
};

const RECENT_LOG_LIMIT = 14;

function resolveBand(band: string): RiskBand {
  if (band === 'low' || band === 'moderate' || band === 'high') return band;
  return 'moderate';
}

function safeScore(value: number | string): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Minimal HTML escaping for any user-entered text that reaches the PDF. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeFmt(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMM yyyy');
  } catch {
    return format(new Date(), 'd MMM yyyy');
  }
}

/**
 * Build a doctor-ready HTML report from the screener result + the user's own logs.
 * Carries the "screening tool, not a diagnosis" disclaimer at the top AND bottom.
 */
export function buildReportHtml({ result, cycles, dailyLogs }: ReportInput): string {
  const prediction = computeCyclePrediction(cycles);
  const band = resolveBand(result.risk_band);
  const score = safeScore(result.score);
  const generatedOn = safeFmt(result.created_at);

  const cycleSummary =
    prediction.status === 'regular'
      ? `Average cycle length ~${prediction.avgLength} days (fairly regular, based on ${prediction.basis} cycles).`
      : prediction.status === 'irregular'
        ? `Average cycle length ~${prediction.avgLength} days, but cycles vary by ${prediction.spread} days (irregular).`
        : 'Not enough cycle data logged yet to summarise.';

  const cycleRows = cycles
    .slice(0, 12)
    .map(
      (c) =>
        `<tr><td>${safeFmt(c.start_date)}</td><td>${c.end_date ? safeFmt(c.end_date) : 'ongoing'}</td></tr>`,
    )
    .join('');

  const logRows = dailyLogs
    .slice(0, RECENT_LOG_LIMIT)
    .map((log: DailyLog) => {
      const flow = log.flow_level && log.flow_level !== 'none' ? log.flow_level : '—';
      const mood = log.mood != null ? `${log.mood}/5` : '—';
      const energy = log.energy != null ? `${log.energy}/5` : '—';
      return `<tr><td>${safeFmt(log.log_date)}</td><td>${flow}</td><td>${mood}</td><td>${energy}</td>${
        log.notes ? `<td>${esc(log.notes)}</td>` : '<td>—</td>'
      }</tr>`;
    })
    .join('');

  const disclaimerBanner = `
    <div class="disclaimer">
      <strong>${esc(DISCLAIMER_SHORT)}</strong><br/>
      ${esc(DISCLAIMER_LONG)}
    </div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #1A1320; padding: 24px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 24px 0 8px; }
    .muted { color: #6B6473; font-size: 12px; }
    .disclaimer { background: #FBEFE6; border: 1px solid #B26A00; border-radius: 8px;
                  padding: 12px; font-size: 12px; margin: 12px 0; }
    .band { font-size: 18px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #E8E2EE; }
    th { color: #6B6473; font-weight: 600; }
  </style>
</head>
<body>
  <h1>PCOS Screening Summary</h1>
  <div class="muted">Generated ${generatedOn} · for discussion with your clinician</div>

  ${disclaimerBanner}

  <h2>Screening result</h2>
  <div class="band">${esc(RISK_BAND_LABEL[band])}</div>
  <div class="muted">Weighted screening score: ${score}. This is a self-screening
    indication only, not a measure of disease.</div>

  <h2>Cycle summary</h2>
  <div>${esc(cycleSummary)}</div>
  ${cycleRows ? `<table><tr><th>Period start</th><th>Period end</th></tr>${cycleRows}</table>` : ''}

  <h2>Recent daily logs</h2>
  ${
    logRows
      ? `<table><tr><th>Date</th><th>Flow</th><th>Mood</th><th>Energy</th><th>Notes</th></tr>${logRows}</table>`
      : '<div class="muted">No recent logs.</div>'
  }

  ${disclaimerBanner}
</body>
</html>`;
}

/** Render the report to a PDF and open the share sheet. Returns false if sharing is unavailable. */
export async function generateAndShareReport(input: ReportInput): Promise<boolean> {
  const html = buildReportHtml(input);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  if (!uri) {
    throw new Error('PDF file was not created on this device.');
  }

  const shared = await shareLocalFile(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'PCOS screening summary',
    ...(Platform.OS === 'ios' ? { UTI: 'com.adobe.pdf' } : {}),
  });
  if (!shared) return false;

  analytics.track('doctor_report_generated');
  return true;
}
