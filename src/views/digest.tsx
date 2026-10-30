import type { DigestRow, Night } from '../digest/types.js';

const dash = '—';

// Retries of 3 or more with a failing last status: marked in text (survives copy) and by class.
const isWarn = (r: DigestRow) => r.retries >= 3 && r.lastStatus === 'fail';

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
                <td class={isWarn(r) ? 'warn' : undefined}>{isWarn(r) ? `⚠ ${r.retries}` : r.retries}</td>
                <td class={isWarn(r) ? 'warn' : undefined}>{isWarn(r) ? `⚠ ${r.lastStatus}` : r.lastStatus}</td>
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
