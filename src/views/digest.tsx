import type { DigestRow, Night } from '../digest/types.js';

const dash = '—';

// Plan § 2a: retries of 3 or more, and any fail, are marked — in text (survives copy) and by class.
const manyRetries = (r: DigestRow) => r.retries >= 3;
const failed = (r: DigestRow) => r.lastStatus === 'fail';

export function DigestPage({ night }: { night: Night }) {
  return (
    <>
      <h1>digest · {night.night}</h1>
      {night.rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th>
              <th>owner</th>
              <th>runs</th>
              <th>retries</th>
              <th>last status</th>
              <th>last error</th>
              <th>first</th>
              <th>last</th>
            </tr>
          </thead>
          <tbody>
            {night.rows.map((r) => (
              <tr>
                <td>{r.job}</td>
                <td>{r.owner ?? dash}</td>
                <td>{r.runs}</td>
                <td class={manyRetries(r) ? 'warn' : undefined}>{manyRetries(r) ? `⚠ ${r.retries}` : r.retries}</td>
                <td class={failed(r) ? 'warn' : undefined}>{failed(r) ? `⚠ ${r.lastStatus}` : r.lastStatus}</td>
                <td>{r.lastError ?? dash}</td>
                <td>{r.firstAt}</td>
                <td>{r.lastAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {night.badLines > 0 && (
        <p class="mute">
          {night.badLines} {night.badLines === 1 ? "line in the log didn't" : "lines in the log didn't"} parse
        </p>
      )}
    </>
  );
}
