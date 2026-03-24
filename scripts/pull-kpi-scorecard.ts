import fs from 'node:fs/promises';
import path from 'node:path';
import { supabaseAdmin } from '@/lib/supabase-client';

type Row = Record<string, string>;

const TEMPLATE_PATH = path.join(process.cwd(), 'docs', 'kpi-scorecard-template.csv');

function parseArgs() {
    const args = process.argv.slice(2);
    const getArg = (key: string) => args.find((a) => a.startsWith(`${key}=`))?.split('=')[1];
    return {
        weekStart: getArg('--week-start'),
        output: getArg('--output'),
    };
}

function toDate(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
}

function toIsoDate(value: Date) {
    return value.toISOString().split('T')[0];
}

function mondayOfCurrentWeek() {
    const now = new Date();
    const day = now.getUTCDay(); // Sun=0
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff));
    return monday;
}

function addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 86_400_000);
}

function parseCsv(content: string): { headers: string[]; rows: Row[] } {
    const lines = content.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map((line) => {
        const cells = line.split(',');
        const row: Row = {};
        headers.forEach((h, i) => {
            row[h] = (cells[i] ?? '').trim();
        });
        return row;
    });
    return { headers, rows };
}

function toCsv(headers: string[], rows: Row[]) {
    const lines = [
        headers.join(','),
        ...rows.map((row) => headers.map((h) => row[h] ?? '').join(',')),
    ];
    return `${lines.join('\n')}\n`;
}

function pct(numerator: number, denominator: number) {
    if (!denominator) return null;
    return (numerator / denominator) * 100;
}

function fmtPercent(value: number | null, digits = 2) {
    if (value === null || !Number.isFinite(value)) return 'N/A';
    return `${value.toFixed(digits)}%`;
}

function fmtNumber(value: number | null, digits = 2) {
    if (value === null || !Number.isFinite(value)) return 'N/A';
    return value.toFixed(digits);
}

function parseNumeric(value: string): number | null {
    if (!value) return null;
    if (value === 'N/A' || value.startsWith('TBD')) return null;
    const normalized = value.replace('%', '').replace('/10m', '').trim();
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
}

function setRow(row: Row, baseline: string, current: string, target: string, note?: string) {
    row.baseline_value = baseline;
    row.current_value = current;
    row.target_value = target || row.target_value;
    const b = parseNumeric(baseline);
    const c = parseNumeric(current);
    row.delta_vs_baseline = b !== null && c !== null ? fmtNumber(c - b) : '';
    row.notes = note ? `${row.notes ? `${row.notes} | ` : ''}${note}` : row.notes;
    row.status = current === 'N/A' ? 'blocked' : 'updated';
}

async function countRows(
    table: string,
    createdAtStartIso: string,
    createdAtEndIso: string,
    extra?: (q: any) => any
) {
    let query = supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', createdAtStartIso)
        .lte('created_at', createdAtEndIso);
    if (extra) {
        query = extra(query);
    }
    const { count, error } = await query;
    if (error) return null;
    return count ?? 0;
}

async function run() {
    const { weekStart, output } = parseArgs();
    const weekStartDate = weekStart ? toDate(weekStart) : mondayOfCurrentWeek();
    const weekEndDate = addDays(weekStartDate, 6);
    const baselineStartDate = addDays(weekStartDate, -14);
    const baselineEndDate = addDays(weekStartDate, -1);

    const weekStartIso = toIsoDate(weekStartDate);
    const weekEndIso = toIsoDate(weekEndDate);
    const baselineStartIso = toIsoDate(baselineStartDate);
    const baselineEndIso = toIsoDate(baselineEndDate);

    const template = await fs.readFile(TEMPLATE_PATH, 'utf8');
    const { headers, rows } = parseCsv(template);

    const paidConvPeriod = async (start: string, end: string) => {
        const totalParents = await countRows('profiles', start, end, (q) => q.in('role', ['parent', 'teacher', 'caregiver', 'grandparent']));
        const paidParents = await countRows('profiles', start, end, (q) =>
            q.not('subscription_tier', 'eq', 'free').in('subscription_status', ['active', 'trialing'])
        );
        if (totalParents === null || paidParents === null) return null;
        return pct(paidParents, totalParents);
    };

    const storiesFailPeriod = async (start: string, end: string) =>
        countRows('events', start, end, (q) => q.eq('event_name', 'portal_stories_load_failed'));
    const lessonsFailPeriod = async (start: string, end: string) =>
        countRows('events', start, end, (q) => q.eq('event_name', 'portal_lessons_load_failed'));
    const authRetryPeriod = async (start: string, end: string) =>
        countRows('events', start, end, (q) => q.eq('event_name', 'portal_auth_retry_clicked'));

    const controlsSavePeriod = async (start: string, end: string) => {
        const attempts = await countRows('events', start, end, (q) => q.eq('event_name', 'parental_controls_save_attempt'));
        const success = await countRows('events', start, end, (q) => q.eq('event_name', 'parental_controls_save_success'));
        if (attempts === null || success === null || attempts === 0) return null;
        return pct(success, attempts);
    };

    const craftCompletionRate = async (start: string, end: string) => {
        const missionRows = await countRows('activities', start, end, (q) => q.eq('activity_type', 'mission'));
        const sessions = await countRows('activities', start, end);
        if (missionRows === null || sessions === null) return null;
        return pct(missionRows, sessions);
    };

    const gamesRepeatRate = async (start: string, end: string) => {
        const { data, error } = await supabaseAdmin
            .from('activities')
            .select('child_id')
            .eq('activity_type', 'game')
            .gte('created_at', start)
            .lte('created_at', end);
        if (error || !data) return null;
        const counts = new Map<string, number>();
        data.forEach((r: any) => counts.set(r.child_id, (counts.get(r.child_id) || 0) + 1));
        const players = counts.size;
        if (!players) return null;
        const repeaters = Array.from(counts.values()).filter((n) => n >= 2).length;
        return pct(repeaters, players);
    };

    const buddyReturnRate = async (start: string, end: string) => {
        const { data, error } = await supabaseAdmin
            .from('child_character_sessions')
            .select('child_id')
            .eq('role', 'user')
            .gte('created_at', start)
            .lte('created_at', end);
        if (error || !data) return null;
        const counts = new Map<string, number>();
        data.forEach((r: any) => counts.set(r.child_id, (counts.get(r.child_id) || 0) + 1));
        const users = counts.size;
        if (!users) return null;
        const returning = Array.from(counts.values()).filter((n) => n >= 2).length;
        return pct(returning, users);
    };

    const radioStartRate = async (start: string, end: string) => {
        const starts = await countRows('events', start, end, (q) => q.eq('event_name', 'radio_play_start'));
        const portalSessions = await countRows('events', start, end, (q) => q.eq('event_name', 'portal_session_start'));
        if (starts === null || portalSessions === null) return null;
        return pct(starts, portalSessions);
    };

    const supportPer1k = async (start: string, end: string) => {
        const tickets = await countRows('support_messages', start, end);
        const sessions = await countRows('events', start, end, (q) => q.eq('event_name', 'portal_session_start'));
        if (tickets === null || sessions === null || sessions === 0) return null;
        return (tickets / sessions) * 1000;
    };

    const mttrMinutes = async (start: string, end: string) => {
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('metadata')
            .eq('event_name', 'incident_resolved')
            .gte('created_at', start)
            .lte('created_at', end);
        if (error || !data || data.length === 0) return null;
        const values: number[] = data
            .map((d: any) => Number(d?.metadata?.mttr_minutes))
            .filter((n: number) => Number.isFinite(n));
        if (!values.length) return null;
        return values.reduce((a, b) => a + b, 0) / values.length;
    };

    for (const row of rows) {
        row.week_start = weekStartIso;
        row.week_end = weekEndIso;
        const name = row.kpi_name;
        if (name === 'Paid Conversion Rate') {
            const b = await paidConvPeriod(baselineStartIso, baselineEndIso);
            const c = await paidConvPeriod(weekStartIso, weekEndIso);
            setRow(row, fmtPercent(b), fmtPercent(c), row.target_value);
        } else if (name === 'Portal Interactive Success Rate') {
            setRow(row, 'N/A', 'N/A', row.target_value, 'Requires portal interactive event contract');
        } else if (name === 'Stories Failure Rate') {
            const bFail = await storiesFailPeriod(baselineStartIso, baselineEndIso);
            const cFail = await storiesFailPeriod(weekStartIso, weekEndIso);
            setRow(row, bFail === null ? 'N/A' : String(bFail), cFail === null ? 'N/A' : String(cFail), row.target_value, 'Absolute failure count pending denominator');
        } else if (name === 'Lessons Failure Rate') {
            const bFail = await lessonsFailPeriod(baselineStartIso, baselineEndIso);
            const cFail = await lessonsFailPeriod(weekStartIso, weekEndIso);
            setRow(row, bFail === null ? 'N/A' : String(bFail), cFail === null ? 'N/A' : String(cFail), row.target_value, 'Absolute failure count pending denominator');
        } else if (name === 'Auth Retry Clicks (per 10m)') {
            const b = await authRetryPeriod(baselineStartIso, baselineEndIso);
            const c = await authRetryPeriod(weekStartIso, weekEndIso);
            setRow(row, b === null ? 'N/A' : String(b), c === null ? 'N/A' : String(c), row.target_value);
        } else if (name === 'Parent Controls Save Success') {
            const b = await controlsSavePeriod(baselineStartIso, baselineEndIso);
            const c = await controlsSavePeriod(weekStartIso, weekEndIso);
            setRow(row, fmtPercent(b), fmtPercent(c), row.target_value, b === null || c === null ? 'Requires save attempt/success instrumentation' : undefined);
        } else if (name === 'Craft Completion Rate') {
            const b = await craftCompletionRate(baselineStartIso, baselineEndIso);
            const c = await craftCompletionRate(weekStartIso, weekEndIso);
            setRow(row, fmtPercent(b), fmtPercent(c), row.target_value);
        } else if (name === 'Games Repeat Play Rate') {
            const b = await gamesRepeatRate(baselineStartIso, baselineEndIso);
            const c = await gamesRepeatRate(weekStartIso, weekEndIso);
            setRow(row, fmtPercent(b), fmtPercent(c), row.target_value);
        } else if (name === 'Buddy Chat Return Rate') {
            const b = await buddyReturnRate(baselineStartIso, baselineEndIso);
            const c = await buddyReturnRate(weekStartIso, weekEndIso);
            setRow(row, fmtPercent(b), fmtPercent(c), row.target_value);
        } else if (name === 'Radio Start Rate') {
            const b = await radioStartRate(baselineStartIso, baselineEndIso);
            const c = await radioStartRate(weekStartIso, weekEndIso);
            setRow(row, fmtPercent(b), fmtPercent(c), row.target_value, b === null || c === null ? 'Requires radio/portal session events' : undefined);
        } else if (name === 'Support Tickets per 1000 Sessions') {
            const b = await supportPer1k(baselineStartIso, baselineEndIso);
            const c = await supportPer1k(weekStartIso, weekEndIso);
            setRow(row, fmtNumber(b), fmtNumber(c), row.target_value, b === null || c === null ? 'Requires portal_session_start event' : undefined);
        } else if (name === 'Incident MTTR (minutes)') {
            const b = await mttrMinutes(baselineStartIso, baselineEndIso);
            const c = await mttrMinutes(weekStartIso, weekEndIso);
            setRow(row, fmtNumber(b), fmtNumber(c), row.target_value, b === null || c === null ? 'Requires incident_resolved events with mttr_minutes' : undefined);
        } else if (name === 'P0 Incident Count') {
            const b = await countRows('events', baselineStartIso, baselineEndIso, (q) => q.eq('event_name', 'incident_p0'));
            const c = await countRows('events', weekStartIso, weekEndIso, (q) => q.eq('event_name', 'incident_p0'));
            setRow(row, b === null ? 'N/A' : String(b), c === null ? 'N/A' : String(c), row.target_value);
        } else if (name === 'P1 Incident Count') {
            const b = await countRows('events', baselineStartIso, baselineEndIso, (q) => q.eq('event_name', 'incident_p1'));
            const c = await countRows('events', weekStartIso, weekEndIso, (q) => q.eq('event_name', 'incident_p1'));
            setRow(row, b === null ? 'N/A' : String(b), c === null ? 'N/A' : String(c), row.target_value);
        } else {
            row.status = row.status || 'manual';
        }
    }

    const defaultOutput = path.join(process.cwd(), 'docs', `kpi-scorecard-weekly-${weekStartIso}.csv`);
    const outputPath = output ? path.resolve(output) : defaultOutput;
    await fs.writeFile(outputPath, toCsv(headers, rows), 'utf8');

    console.log(`KPI scorecard generated: ${outputPath}`);
    console.log(`Week: ${weekStartIso} -> ${weekEndIso}`);
    console.log(`Baseline window: ${baselineStartIso} -> ${baselineEndIso}`);
}

run().catch((err) => {
    console.error('Failed to generate KPI scorecard:', err);
    process.exit(1);
});

