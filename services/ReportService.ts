import { printToFileAsync } from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';
import { ChildData, FeedData, SleepData, DiaperData, ActivityData, MilestoneData, WeightData } from '@/services/ChildService';

export type SelectedTrendKey = 'sleep' | 'feed' | 'diaper' | 'activity' | 'milestone' | 'weight';

export interface ReportPayload {
  child: ChildData & { parentFirstName?: string; parentLastName?: string; parentEmail?: string };
  rangeDays: number;
  selectedTypes: SelectedTrendKey[];
  insightsMarkdown?: string;
  modelName?: string;
  data: Partial<{
    sleep: SleepData[];
    feed: FeedData[];
    diaper: DiaperData[];
    activity: ActivityData[];
    milestone: MilestoneData[];
    weight: WeightData[];
  }>;
}

function formatDate(dt: Date | string): string {
  const d = typeof dt === 'string' ? new Date(dt) : dt;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function escapeHtml(value: unknown): string {
  const s = String(value ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
  };

  const renderText = (text: string): string => escapeHtml(text);

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Headings
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^###\s+(.+)$/))) {
      flushList();
      htmlParts.push(`<h3>${renderText(m[1])}</h3>`);
      continue;
    }
    if ((m = line.match(/^##\s+(.+)$/))) {
      flushList();
      htmlParts.push(`<h2>${renderText(m[1])}</h2>`);
      continue;
    }

    // Unordered list items
    if ((m = line.match(/^[-*]\s+(.+)$/))) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${renderText(m[1])}</li>`);
      continue;
    }

    // Paragraph
    flushList();
    htmlParts.push(`<p>${renderText(line)}</p>`);
  }

  flushList();
  return htmlParts.join('');
}

function buildTableSection<T extends Record<string, any>>(title: string, rows: T[], columns: Array<{ key: keyof T; label: string; formatter?: (v: any) => string }>): string {
  if (!rows || rows.length === 0) {
    return '';
  }
  const header = columns.map(c => `<th>${escapeHtml(c.label)}</th>`).join('');
  const body = rows
    .map(r => {
      const tds = columns
        .map(c => {
          const raw = r[c.key as string];
          const formatted = c.formatter ? c.formatter(raw) : raw;
          return `<td>${escapeHtml(formatted)}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');
  return `
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead><tr>${header}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function formatWeightAxisLabel(totalOunces: number): string {
  const pounds = Math.floor(totalOunces / 16);
  const ounces = totalOunces % 16;
  if (pounds === 0) return `${ounces}oz`;
  if (ounces === 0) return `${pounds}lbs`;
  return `${pounds}lbs ${ounces}oz`;
}

function buildSimpleChartSvg(values: number[], width = 600, height = 220, xLabels?: string[], useWeightAxis = false): string {
  if (!values.length) return '';
  // Domain and ticks
  let max = Math.max(...values);
  let min = Math.min(...values);
  let range = Math.max(1, max - min);
  if (useWeightAxis) {
    const padding = Math.max(range * 0.1, 16); // at least 1 lb
    min = Math.max(0, min - padding);
    max = max + padding;
    range = Math.max(1, max - min);
  }
  const paddingLeft = 44; // leave room for y-axis labels
  const paddingBottom = 28; // leave room for x-axis labels
  const paddingTop = 12;
  const paddingRight = 12;
  const innerW = width - paddingLeft - paddingRight;
  const innerH = height - paddingTop - paddingBottom;
  const stepX = innerW / Math.max(1, values.length - 1);
  const toX = (i: number) => paddingLeft + i * stepX;
  const toY = (v: number) => paddingTop + innerH - ((v - min) / range) * innerH;

  const points = values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  // y-axis ticks
  let tickEls = '';
  if (useWeightAxis) {
    // tick every 1 lb (16 oz)
    const startLb = Math.floor(min / 16);
    const endLb = Math.ceil(max / 16);
    for (let p = startLb; p <= endLb; p++) {
      const ounces = p * 16;
      const y = toY(ounces);
      tickEls += `
        <line x1="${paddingLeft}" y1="${y}" x2="${paddingLeft + innerW}" y2="${y}" stroke="#E5E7EB" stroke-width="1" />
        <text x="${paddingLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6B7280">${formatWeightAxisLabel(ounces)}</text>
      `;
    }
    // dashed half-pound (8 oz) lines
    const startHalf = Math.ceil(min / 8) * 8;
    const endHalf = Math.floor(max / 8) * 8;
    for (let oz = startHalf; oz <= endHalf; oz += 8) {
      if (oz % 16 === 0) continue; // skip whole pounds
      const y = toY(oz);
      tickEls += `
        <line x1="${paddingLeft}" y1="${y}" x2="${paddingLeft + innerW}" y2="${y}" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4,4" stroke-opacity="0.6" />
      `;
    }
  } else {
    const ticks = 5;
    tickEls = Array.from({ length: ticks + 1 }).map((_, i) => {
      const val = min + (range * i) / ticks;
      const y = paddingTop + innerH - (innerH * i) / ticks;
      return `
        <line x1="${paddingLeft}" y1="${y}" x2="${paddingLeft + innerW}" y2="${y}" stroke="#E5E7EB" stroke-width="1" />
        <text x="${paddingLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6B7280">${val.toFixed(1)}</text>
      `;
    }).join('');
  }

  // x-axis labels (sparse to avoid overlap)
  let xLabelEls = '';
  if (xLabels && xLabels.length === values.length) {
    const every = Math.max(1, Math.ceil(values.length / 6));
    xLabelEls = xLabels.map((lbl, i) => {
      if (i % every !== 0 && i !== values.length - 1) return '';
      const x = toX(i);
      return `<text x="${x}" y="${paddingTop + innerH + 16}" text-anchor="middle" font-size="10" fill="#6B7280">${escapeHtml(lbl)}</text>`;
    }).join('');
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${paddingTop + innerH}" stroke="#9CA3AF" stroke-width="1.5" />
      <line x1="${paddingLeft}" y1="${paddingTop + innerH}" x2="${paddingLeft + innerW}" y2="${paddingTop + innerH}" stroke="#9CA3AF" stroke-width="1.5" />
      ${tickEls}
      <polyline fill="none" stroke="#4F46E5" stroke-width="3" stroke-opacity="0.85" points="${points}" />
      ${values.map((v, i) => `<circle cx="${toX(i)}" cy="${toY(v)}" r="4" fill="#4F46E5" fill-opacity="0.8" />`).join('')}
      ${xLabelEls}
    </svg>
  `;
}

function buildHtml(payload: ReportPayload): string {
  const now = new Date();
  const generatedAt = formatDate(now);
  const { child, selectedTypes, rangeDays, data } = payload;
  const insightsRaw = payload.insightsMarkdown;
  // Guard against excessively long insights inflating PDF and causing mail failures
  const INSIGHTS_CHAR_LIMIT = 12000; // ~12KB text
  const insights = insightsRaw
    ? (insightsRaw.length > INSIGHTS_CHAR_LIMIT
        ? `${insightsRaw.slice(0, INSIGHTS_CHAR_LIMIT)}\n\n...[truncated]`
        : insightsRaw)
    : undefined;
  const model = payload.modelName || (Constants.expoConfig?.extra as any)?.AI_MODEL || 'the model';

  // Build weight series to match app visualization (carry forward last known per-day)
  const buildWeightSeries = (weights: WeightData[] = [], days: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() - days + 1);
    const seriesDates: Date[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      seriesDates.push(d);
    }
    const byDay = new Map<string, WeightData[]>();
    weights.forEach(w => {
      const key = `${w.dateTime.getFullYear()}-${(w.dateTime.getMonth() + 1).toString().padStart(2, '0')}-${w.dateTime.getDate().toString().padStart(2, '0')}`;
      const arr = byDay.get(key) || [];
      arr.push(w);
      byDay.set(key, arr);
    });
    let last: WeightData | null = null;
    const valuesOz: number[] = [];
    const labels: string[] = [];
    seriesDates.forEach(d => {
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      const todays = (byDay.get(key) || []).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
      if (todays.length) {
        const latest = todays[todays.length - 1];
        last = latest;
      }
      if (last) {
        const oz = (last.pounds || 0) * 16 + (last.ounces || 0);
        valuesOz.push(oz);
      } else {
        valuesOz.push(NaN); // no value yet; will be filtered out
      }
      labels.push(d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }));
    });
    // Remove leading NaNs until first real value, then fill NaNs with previous
    const firstIdx = valuesOz.findIndex(v => !Number.isNaN(v));
    const cleanValues: number[] = [];
    for (let i = 0; i < valuesOz.length; i++) {
      if (i < firstIdx) continue;
      if (Number.isNaN(valuesOz[i])) cleanValues.push(cleanValues[cleanValues.length - 1]); else cleanValues.push(valuesOz[i]);
    }
    const cleanLabels = labels.slice(firstIdx >= 0 ? firstIdx : 0);
    return { valuesOz: cleanValues, labels: cleanLabels };
  };

  // No chart visualization in PDF; tables only

  const sections: string[] = [];
  if (selectedTypes.includes('feed') && data.feed) {
    const sorted = [...data.feed].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    sections.push(
      buildTableSection('Feed', sorted, [
        { key: 'dateTime', label: 'Date/Time', formatter: (v) => formatDate(new Date(v)) },
        { key: 'type', label: 'Type' },
        { key: 'amount', label: 'Amount' },
        { key: 'duration', label: 'Duration (min)' },
        { key: 'description', label: 'Description' },
        { key: 'notes', label: 'Notes' },
      ])
    );
  }
  if (selectedTypes.includes('sleep') && data.sleep) {
    const sorted = [...data.sleep].sort((a, b) => {
      const aDate = a.end ? new Date(a.end).getTime() : new Date(a.start).getTime();
      const bDate = b.end ? new Date(b.end).getTime() : new Date(b.start).getTime();
      return bDate - aDate;
    });
    sections.push(
      buildTableSection('Sleep', sorted, [
        { key: 'start', label: 'Start', formatter: (v) => formatDate(new Date(v)) },
        { key: 'end', label: 'End', formatter: (v) => formatDate(new Date(v)) },
        { key: 'quality', label: 'Quality' },
      ])
    );
  }
  if (selectedTypes.includes('diaper') && data.diaper) {
    const sorted = [...data.diaper].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    sections.push(
      buildTableSection('Diaper', sorted, [
        { key: 'dateTime', label: 'Date/Time', formatter: (v) => formatDate(new Date(v)) },
        { key: 'type', label: 'Type' },
        { key: 'peeAmount', label: 'Pee Amount' },
        { key: 'pooAmount', label: 'Poo Amount' },
        { key: 'pooColor', label: 'Poo Color' },
        { key: 'pooConsistency', label: 'Poo Consistency' },
        { key: 'hasRash', label: 'Has Rash' },
      ])
    );
  }
  if (selectedTypes.includes('activity') && data.activity) {
    const sorted = [...data.activity].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    sections.push(
      buildTableSection('Activity', sorted, [
        { key: 'dateTime', label: 'Date/Time', formatter: (v) => formatDate(new Date(v)) },
        { key: 'type', label: 'Type' },
      ])
    );
  }
  if (selectedTypes.includes('milestone') && data.milestone) {
    const sorted = [...data.milestone].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    sections.push(
      buildTableSection('Milestone', sorted, [
        { key: 'dateTime', label: 'Date/Time', formatter: (v) => formatDate(new Date(v)) },
        { key: 'type', label: 'Type' },
      ])
    );
  }
  if (selectedTypes.includes('weight') && data.weight) {
    const sorted = [...data.weight].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    sections.push(
      buildTableSection('Weight', sorted, [
        { key: 'dateTime', label: 'Date/Time', formatter: (v) => formatDate(new Date(v)) },
        { key: 'pounds', label: 'Pounds' },
        { key: 'ounces', label: 'Ounces' },
      ])
    );
  }

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px; color: #111827; }
        h1 { font-size: 24px; margin: 0 0 4px; }
        h2 { font-size: 18px; margin: 24px 0 8px; }
        h3 { font-size: 16px; margin: 16px 0 8px; }
        p { margin: 4px 0; }
        .muted { color: #6B7280; }
        .section { margin-top: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #E5E7EB; padding: 6px 8px; font-size: 12px; }
        th { background: #F3F4F6; text-align: left; }
        .charts { margin-top: 16px; }
      </style>
    </head>
    <body>
      <h1>Child Report</h1>
      <p class="muted">Generated at ${escapeHtml(generatedAt)}</p>
      <div class="section">
        <p><strong>Child:</strong> ${escapeHtml(child.first_name)} ${escapeHtml(child.last_name)} (${escapeHtml(child.sex)})</p>
        <p><strong>DOB:</strong> ${escapeHtml(child.dob)}</p>
        <p><strong>Time Range:</strong> Last ${escapeHtml(rangeDays)} days</p>
        <p><strong>Selected Trends:</strong> ${escapeHtml(selectedTypes.join(', '))}</p>
        ${child.parentFirstName || child.parentLastName ? `<p><strong>Parent:</strong> ${escapeHtml(child.parentFirstName || '')} ${escapeHtml(child.parentLastName || '')}</p>` : ''}
      </div>
      ${insights ? `
      <div class="section">
        <h2>AI Insights</h2>
        <p class="muted">This section is LLM-generated using ${escapeHtml(model)} and may contain errors.</p>
        <div style="padding:12px;border:1px solid #E5E7EB;border-radius:8px;background:#FFFFFF;word-break:break-word;">
          ${markdownToHtml(insights)}
        </div>
      </div>
      ` : ''}
      
      ${sections.join('')}
    </body>
  </html>`;
  return html;
}

function toSafeFilePart(value: string | undefined): string {
  const base = (value || '').trim();
  if (!base) return 'report';
  return base
    .replace(/[^a-zA-Z0-9\-\_\s]/g, '')
    .replace(/\s+/g, '-');
}

export async function generatePdfFile(payload: ReportPayload): Promise<string> {
  const html = buildHtml(payload);
  const first = toSafeFilePart(payload.child.first_name);
  const last = toSafeFilePart(payload.child.last_name);
  const fileName = `${first}-${last}-report.pdf`;
  const { uri } = await printToFileAsync({ html, base64: false });
  const target = `${FileSystem.cacheDirectory}${fileName}`;
  try {
    await FileSystem.moveAsync({ from: uri, to: target });
  } catch {
    // ignore move failure, will validate below
  }
  // Validate file and fallback to base64 write if empty or missing
  try {
    const info = await FileSystem.getInfoAsync(target);
    if (!info.exists || (info.size ?? 0) === 0) {
      const base64 = (await printToFileAsync({ html, base64: true })).base64;
      await FileSystem.writeAsStringAsync(target, base64 || '', { encoding: FileSystem.EncodingType.Base64 });
    }
  } catch {}
  return target;
}

export async function emailPdf(fileUri: string, toEmail: string, subject: string, body: string): Promise<MailComposer.MailComposerResult> {
  // Try to email with attachment first
  try {
    const result = await MailComposer.composeAsync({
      recipients: [toEmail],
      subject,
      body,
      attachments: [fileUri],
    });
    return result;
  } catch (error) {
    // If the file URI approach fails (FileUriExposedException), 
    // we'll try without attachments and let the user know they need to attach manually
    console.warn('[ReportService] File URI attachment failed, trying without attachment:', error);
    
    const result = await MailComposer.composeAsync({
      recipients: [toEmail],
      subject: `${subject} - Please attach the PDF manually`,
      body: `${body}\n\nNote: The PDF file could not be automatically attached due to Android security restrictions. Please manually attach the PDF file from: ${fileUri}`,
    });
    return result;
  }
}

export async function sharePdf(fileUri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }
  
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share PDF Report'
  });
}

export async function generateAndEmailReport(payload: ReportPayload): Promise<{ uri: string }>{
  const uri = await generatePdfFile(payload);
  const to = payload.child.parentEmail || '';
  if (to) {
    const subject = `Child Report: ${payload.child.first_name} ${payload.child.last_name}`;
    const body = 'Attached is your requested report.';
    try {
      const res = await emailPdf(uri, to, subject, body);
      // small delay to allow mail client to read the attachment fully on some platforms
      await new Promise(resolve => setTimeout(resolve, 300));
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
          console.log('[ReportService] PDF temp file cleared from cache:', uri, '| mail status:', res.status);
        }
      } catch (cleanupErr) {
        console.warn('[ReportService] Failed to cleanup temp PDF:', cleanupErr);
      }
    } catch (err) {
      // If email open fails, still attempt cleanup
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
          console.log('[ReportService] PDF temp file cleared from cache after error:', uri);
        }
      } catch {}
      throw err;
    }
  }
  return { uri };
}


