import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { RigConfig } from '../src/config.js';

const REAL_NIGHT = '2026-10-28';
const EMPTY_NIGHT = '2026-10-30';
const BAD_NIGHT = '2026-10-31';
const MISSING_NIGHT = '2099-01-01';

let runsDir: string;
let config: RigConfig;

beforeAll(() => {
  // Temp runs dir only. runs/ is read-only: the real night is copied, never written in place.
  runsDir = mkdtempSync(join(tmpdir(), 'rig-'));
  copyFileSync(join('runs', `${REAL_NIGHT}.jsonl`), join(runsDir, `${REAL_NIGHT}.jsonl`));
  writeFileSync(join(runsDir, `${EMPTY_NIGHT}.jsonl`), '');
  writeFileSync(
    join(runsDir, `${BAD_NIGHT}.jsonl`),
    [
      '{"at":"2026-10-31T01:00:00+01:00","job":"lane/sync","status":"ok","owner":"rook"}',
      'this is not json',
      '',
    ].join('\n'),
  );
  config = { adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir };
});

afterAll(() => {
  rmSync(runsDir, { recursive: true, force: true });
});

const jobsInHtml = (html: string): string[] => {
  const body = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'));
  return [...body.matchAll(/<tr>\s*<td>([^<]*)<\/td>/g)].map((m) => m[1]!);
};

describe('GET /digest/:night (HTML)', () => {
  it('200 for a night with a run log', async () => {
    const res = await createApp(config).request(`/digest/${REAL_NIGHT}`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain(`digest · ${REAL_NIGHT}`);
    expect(html).toContain('<table>');
  });

  it('404 for a night with no file', async () => {
    const res = await createApp(config).request(`/digest/${MISSING_NIGHT}`);
    const html = await res.text();
    expect(res.status).toBe(404);
    expect(html).toContain('no run log');
  });

  it('shows "nothing ran" for an empty night', async () => {
    const res = await createApp(config).request(`/digest/${EMPTY_NIGHT}`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('nothing ran');
    expect(html).not.toContain('<table>');
  });

  it('says a line did not parse for a night with a bad line', async () => {
    const res = await createApp(config).request(`/digest/${BAD_NIGHT}`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toMatch(/line in the log didn(&#39;|')t parse/);
  });
});

describe('GET /api/digest/:night (JSON)', () => {
  it('200 with rows for a night with a run log', async () => {
    const res = await createApp(config).request(`/api/digest/${REAL_NIGHT}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { night: string; rows: unknown[]; badLines: number };
    expect(body.night).toBe(REAL_NIGHT);
    expect(body.rows.length).toBeGreaterThan(0);
  });

  it('404 for a night with no file', async () => {
    const res = await createApp(config).request(`/api/digest/${MISSING_NIGHT}`);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'no run log', night: MISSING_NIGHT });
  });

  it('empty night: rows []', async () => {
    const res = await createApp(config).request(`/api/digest/${EMPTY_NIGHT}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rows: unknown[]; badLines: number };
    expect(body.rows).toEqual([]);
    expect(body.badLines).toBe(0);
  });

  it('bad-line night: badLines 1', async () => {
    const res = await createApp(config).request(`/api/digest/${BAD_NIGHT}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rows: unknown[]; badLines: number };
    expect(body.badLines).toBe(1);
    expect(body.rows).toHaveLength(1);
  });
});

describe('page and JSON agree', () => {
  it('job names in the JSON rows appear in the HTML in the same order', async () => {
    const app = createApp(config);
    const json = (await (await app.request(`/api/digest/${REAL_NIGHT}`)).json()) as {
      rows: { job: string }[];
    };
    const html = await (await app.request(`/digest/${REAL_NIGHT}`)).text();

    const jobs = json.rows.map((r) => r.job);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobsInHtml(html)).toEqual(jobs);
  });
});
