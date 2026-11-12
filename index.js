/**
 * Host half of the Harumasa pet.
 *
 * Serves the pet script and the balance route, and injects the script into the page.
 * The pet lives in its own shadow root appended to `document.body`, so it can be
 * dragged and clicked no matter what the app's overlay layers do.
 *
 * Routes:
 *   GET /dsh-harumasa/pet.js        the pet script
 *   GET /dsh-harumasa/balance.json  DeepSeek wallet totals (never a credential)
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PET_PATH = join(HERE, 'pet.js');

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);

/** The desktop shell never reads index.html through the Host, so push a row. */
const BOOT_TEXT =
  '(function(){try{var d=document.body||document.documentElement;if(!d)return;' +
  'if(document.getElementById("dsh-harumasa-pet-script"))return;' +
  'var s=document.createElement("script");s.id="dsh-harumasa-pet-script";' +
  's.src="/dsh-harumasa/pet.js";s.onerror=function(){};d.appendChild(s)}catch(e){}})()';

function isLoopbackHost(host) {
  if (!host) return false;
  const name = String(host).split(':')[0].toLowerCase();
  return LOOPBACK.has(name);
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

export function apply(root) {
  let petSource = null;
  const readPet = () => {
    if (petSource === null) {
      try {
        petSource = readFileSync(PET_PATH, 'utf8');
      } catch {
        petSource = '';
      }
    }
    return petSource;
  };

  // The injection row must be registered before any service wait: the desktop shell
  // collects this table once during startup.
  root.effect(() =>
    root.on('webserver/index-inject', (table) => {
      try {
        if (!Array.isArray(table)) return;
        for (const row of table) {
          if (!row) continue;
          if (row.kind === 'script' && typeof row.text === 'string' && row.text.indexOf('/dsh-harumasa/pet.js') >= 0) return;
          if (row.kind === 'script-src' && row.src === '/dsh-harumasa/pet.js') return;
        }
        table.push({ kind: 'script', placement: 'body', text: BOOT_TEXT });
      } catch {
        /* never break the boot table */
      }
    }),
  );

  root.inject(['webServer'], (ctx) => {
    ctx.effect(() =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/dsh-harumasa/pet.js',
        handler: (req, res) => {
          const body = readPet();
          if (!body) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('pet.js missing');
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-store',
          });
          res.end(body);
        },
      }),
    );

    ctx.effect(() =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/dsh-harumasa/balance.json',
        handler: async (req, res) => {
          try {
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              sendJson(res, 405, { ok: false, reason: 'method' });
              return;
            }
            if (!isLoopbackHost(req.headers.host)) {
              sendJson(res, 403, { ok: false, reason: 'host' });
              return;
            }

            let account = null;
            try {
              account = typeof ctx.get === 'function' ? ctx.get('deepseekAccount') : null;
            } catch {
              account = null;
            }
            if (!account || typeof account.getBalance !== 'function') {
              sendJson(res, 200, { ok: false, reason: 'no-account-service' });
              return;
            }

            let result = null;
            try {
              result = await account.getBalance({
                version: '1.0.0',
                locale: String(process.env.DSH_LOCALE || 'zh_CN'),
                timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
              });
            } catch (error) {
              sendJson(res, 200, {
                ok: false,
                reason: 'error',
                detail: String((error && error.message) || error).slice(0, 160),
              });
              return;
            }

            if (!result) {
              sendJson(res, 200, { ok: false, reason: 'signed-out' });
              return;
            }
            if (result.status !== 'ready') {
              sendJson(res, 200, { ok: false, reason: 'not-ready' });
              return;
            }

            const usable = (list) =>
              (Array.isArray(list) ? list : []).filter((w) => w && Number.isFinite(Number(w.balance)));
            const recharge = usable(result.value);
            const bonus = usable(result.bonusWallets);
            const all = recharge.concat(bonus);
            if (all.length === 0) {
              sendJson(res, 200, { ok: false, reason: 'no-wallets' });
              return;
            }

            const currencyOf = (w) => String((w && w.currency) || 'CNY').toUpperCase();
            const picked = all.find((w) => currencyOf(w) === 'CNY') || all[0];
            const currency = currencyOf(picked);
            const sumOf = (list) =>
              list.filter((w) => currencyOf(w) === currency).reduce((total, w) => total + Number(w.balance), 0);

            sendJson(res, 200, {
              ok: true,
              currency,
              total: sumOf(all).toFixed(2),
              recharge: sumOf(recharge).toFixed(2),
              bonus: sumOf(bonus).toFixed(2),
              at: Date.now(),
            });
          } catch (error) {
            sendJson(res, 200, {
              ok: false,
              reason: 'error',
              detail: String((error && error.message) || error).slice(0, 160),
            });
          }
        },
      }),
    );

    // Browser form (dsh web): the index response does pass through renderIndex.
    ctx.effect(() =>
      ctx.webServer.tapIndex((html) => {
        if (html.indexOf('/dsh-harumasa/pet.js') !== -1) return html;
        const tag = '<script defer src="/dsh-harumasa/pet.js"></script>';
        if (html.indexOf('</body>') !== -1) return html.replace('</body>', tag + '</body>');
        return html + tag;
      }),
    );
  });
}
