// Plan morning-digest § 1. The contract every part of § 2 starts against: readers return
// these, views and routes only render them.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One line of runs/<night>.jsonl, after parsing.
export type RunLine = {
  at: string;
  job: string;
  status: RunStatus;
  owner: string | null;
  error?: string;
};

// One row per job for the night. Times keep the log's offset; owner null renders as `—`.
export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  firstAt: string;
  lastAt: string;
};

export type Night = {
  night: string;
  rows: DigestRow[]; // sorted by job
  badLines: number; // lines that didn't parse: counted, never thrown
  counts: Record<RunStatus, number>; // log lines per status
};

// null when runs/<night>.jsonl doesn't exist (the routes answer 404). An empty file is a
// Night with no rows.
export type ReadNight = (runsDir: string, night: string) => Night | null;
