/**
 * Harumasa pet — injected as a plain browser script by the Host half.
 *
 * It builds its own shadow root, so no app CSS can hide or move it and no app
 * element can sit above it: the sticker is a real draggable pet. A click opens a
 * small card with the DeepSeek balance (from /dsh-harumasa/balance.json) and one of
 * his lines, plus a little electric spark for the "电" agent he is.
 */
(function () {
  if (window.__dshHarumasaPetLoaded) return;
  window.__dshHarumasaPetLoaded = true;

  var STICKERS = [{"src": "data:image/webp;base64,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", "name": "悠真摸鱼"}, {"src": "data:image/webp;base64,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", "name": "悠真坏笑"}];
  var SIZE = 72;
  var POS_KEY = 'harumasa-pet:pos';
  var HINT_KEY = 'harumasa-pet:hint';
  var LINES = [
    '很高兴认识你，除非你是来叫我加班的。',
    '别看我这样，我其实很弱很弱的~',
    '不管是明枪还是暗箭，能让我早点下班的都是好孩子~',
    '我想要假期，要自由，要每天都开开心心——',
    '咳咳，感觉我的病情加剧了…',
    '副课长，真的不给我张病假条吗？',
    '好在我的箭还不算太慢。',
    '我可是要遗千年的。',
    '……放心，暂时死不了。'
  ];
  var REASONS = {
    'no-account-service': '宿主还没加载余额接口，重启一次 DSH',
    'signed-out': '还没登录 DeepSeek 账号',
    'not-ready': '账号服务未就绪',
    'no-wallets': '账号里没有余额钱包',
    error: '余额读取失败',
    http: '余额接口未就绪（重启 DSH 后可用）',
    network: '连不上宿主'
  };

  var CSS = [
    ':host{all:initial}',
    '.wrap{position:relative;width:' + SIZE + 'px;height:' + SIZE + 'px;',
    '  font-family:"PingFang SC","HarmonyOS Sans SC","Noto Sans SC","Microsoft YaHei",system-ui,sans-serif}',
    '.pet{display:block;width:' + SIZE + 'px;height:' + SIZE + 'px;cursor:grab;',
    '  filter:drop-shadow(0 6px 10px rgba(4,8,18,.55));',
    '  animation:float 4.6s ease-in-out infinite;',
    '  -webkit-user-drag:none;user-select:none;-webkit-user-select:none;touch-action:none}',
    '.pet:active{cursor:grabbing}',
    '.pet:hover{filter:drop-shadow(0 8px 14px rgba(4,8,18,.62)) brightness(1.07)}',
    '@keyframes float{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-5px) rotate(1.2deg)}}',
    '.spark{position:absolute;right:2px;top:0;font-size:15px;line-height:1;color:#5ff0d0;',
    '  opacity:0;pointer-events:none;text-shadow:0 0 9px rgba(95,240,208,.85)}',
    '.wrap.zap .spark{animation:zap .55s ease-out}',
    '@keyframes zap{0%{opacity:0;transform:translateY(6px) scale(.6)}',
    '  30%{opacity:1;transform:translateY(-4px) scale(1.15)}',
    '  100%{opacity:0;transform:translateY(-16px) scale(.9)}}',
    '.card{position:absolute;right:-4px;bottom:100%;margin-bottom:2px;width:212px;',
    '  padding:10px 12px 11px;border-radius:13px;background:#131b2e;border:2.5px solid #3a5480;',
    '  color:#e6edfb;font-size:11.5px;line-height:1.5;',
    '  box-shadow:0 14px 30px rgba(0,0,0,.5),0 0 0 1px rgba(78,225,193,.10),inset 0 0 22px rgba(78,225,193,.07);',
    '  opacity:0;pointer-events:none;transform-origin:100% 100%;',
    '  transform:scale(.86) translateY(6px);transition:opacity .18s ease,transform .18s cubic-bezier(.3,1.4,.5,1)}',
    '.card.on{opacity:1;transform:scale(1) translateY(0)}',
    '.card:before{content:"";position:absolute;left:11px;right:11px;top:-1px;height:2px;border-radius:2px;',
    '  background:linear-gradient(90deg,#3ee0bd,#ffd166 62%,rgba(255,209,102,0))}',
    '.card:after{content:"";position:absolute;right:22px;bottom:-8px;width:11px;height:11px;',
    '  background:#131b2e;border-right:2.5px solid #3a5480;border-bottom:2.5px solid #3a5480;',
    '  transform:rotate(45deg)}',
    '.card.flip{right:auto;left:-4px;transform-origin:0 100%}',
    '.card.flip:after{right:auto;left:22px}',
    '.card.below{bottom:auto;top:100%;margin-bottom:0;margin-top:2px}',
    '.card.below:after{bottom:auto;top:-8px;transform:rotate(225deg)}',
    '.head{display:flex;align-items:center;gap:5px;font-size:10.5px;color:#8ea3c8;letter-spacing:.04em}',
    '.dot{width:6px;height:6px;border-radius:50%;background:#3ee0bd;box-shadow:0 0 7px rgba(62,224,189,.9)}',
    '.dot.off{background:#e4776a;box-shadow:none}',
    '.money{margin-top:1px;font:700 21px/1.25 "Optima","Segoe UI",system-ui,sans-serif;color:#ffd166;',
    '  text-shadow:0 0 14px rgba(255,209,102,.22)}',
    '.sub{font-size:10.5px;color:#8ea3c8}',
    '.line{margin-top:7px;padding-top:7px;border-top:1px dashed rgba(126,160,214,.28);',
    '  font-size:12px;color:#cbd8f1;line-height:1.55}',
    '.hint{position:absolute;right:0;bottom:100%;margin-bottom:4px;padding:5px 9px;border-radius:9px;',
    '  white-space:nowrap;background:rgba(10,16,30,.94);color:#bfeee4;',
    '  border:1.5px solid rgba(95,240,208,.45);font-size:11px;pointer-events:none;',
    '  opacity:0;transition:opacity .3s ease}',
    '.hint.on{opacity:1}'
  ].join('');

  function clamp(n, lo, hi) {
    return Math.min(Math.max(n, lo), hi);
  }

  function readPos() {
    try {
      var raw = localStorage.getItem(POS_KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (p && typeof p.x === 'number' && typeof p.y === 'number') return p;
    } catch (e) {}
    return null;
  }

  function mount() {
    if (!document.body) {
      setTimeout(mount, 50);
      return;
    }
    if (document.getElementById('dsh-harumasa-pet')) return;

    var host = document.createElement('div');
    host.id = 'dsh-harumasa-pet';
    host.style.cssText =
      'position:fixed;z-index:2147483000;width:' + SIZE + 'px;height:' + SIZE + 'px;' +
      'right:24px;bottom:96px;pointer-events:auto;';

    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    root.innerHTML =
      '<style>' + CSS + '</style>' +
      '<div class="wrap">' +
      '<div class="card"><div class="head"><span class="dot"></span>悠真 · DeepSeek 余额</div>' +
      '<div class="money">—</div><div class="sub"></div><div class="line"></div></div>' +
      '<div class="hint">拖动我 · 点一下看余额</div>' +
      '<div class="spark">⚡</div>' +
      '<img class="pet" alt="" draggable="false">' +
      '</div>';

    document.body.appendChild(host);

    var wrap = root.querySelector('.wrap');
    var img = root.querySelector('.pet');
    var card = root.querySelector('.card');
    var dot = root.querySelector('.dot');
    var money = root.querySelector('.money');
    var sub = root.querySelector('.sub');
    var line = root.querySelector('.line');
    var hint = root.querySelector('.hint');

    var idx = Math.floor(Math.random() * STICKERS.length);
    var balance = null;
    var balanceAt = 0;
    var cardTimer = 0;
    var zapTimer = 0;
    var drag = null;

    function paintSticker() {
      var s = STICKERS[idx];
      img.src = s.src;
      img.alt = s.name;
      img.title = '浅羽悠真 · ' + s.name;
    }

    function paintCard() {
      dot.className = 'dot';
      if (balance && balance.ok) {
        money.textContent = (balance.currency === 'USD' ? '$' : '¥') + balance.total;
        var t = new Date(balance.at);
        sub.textContent = '赠金 ' + (balance.currency === 'USD' ? '$' : '¥') + balance.bonus +
          ' · ' + ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2);
      } else if (balance) {
        dot.className = 'dot off';
        money.textContent = '—';
        sub.textContent = REASONS[balance.reason] || REASONS.error;
      } else {
        money.textContent = '—';
        sub.textContent = '读取中…';
      }
    }

    function loadBalance() {
      paintCard();
      fetch('/dsh-harumasa/balance.json', { credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) return { ok: false, reason: 'http' };
          return r.json();
        })
        .then(function (body) {
          balance = body && typeof body === 'object' ? body : { ok: false, reason: 'error' };
          balanceAt = Date.now();
          paintCard();
        })
        .catch(function () {
          balance = { ok: false, reason: 'network' };
          paintCard();
        });
    }

    function placeCard() {
      var rect = host.getBoundingClientRect();
      var cw = card.offsetWidth;
      var ch = card.offsetHeight;
      var spaceLeft = rect.left;
      var spaceRight = window.innerWidth - (rect.left + SIZE);
      if (spaceLeft < cw + 10 && spaceRight > spaceLeft) card.classList.add('flip');
      else card.classList.remove('flip');
      if (rect.top < ch + 10) card.classList.add('below');
      else card.classList.remove('below');
    }

    function zap() {
      wrap.classList.remove('zap');
      /* force a reflow so the animation can replay on a fast second click */
      void wrap.offsetWidth;
      wrap.classList.add('zap');
      clearTimeout(zapTimer);
      zapTimer = setTimeout(function () {
        wrap.classList.remove('zap');
      }, 600);
    }

    function openCard() {
      idx = (idx + 1) % STICKERS.length;
      paintSticker();
      zap();
      hint.classList.remove('on');
      line.textContent = '「' + LINES[Math.floor(Math.random() * LINES.length)] + '」';
      placeCard();
      card.classList.add('on');
      paintCard();
      if (!balance || Date.now() - balanceAt > 60000) loadBalance();
      clearTimeout(cardTimer);
      cardTimer = setTimeout(function () {
        card.classList.remove('on');
      }, 9000);
    }

    function savePos() {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify({
          x: parseInt(host.style.left, 10),
          y: parseInt(host.style.top, 10)
        }));
      } catch (e) {}
    }

    function place(x, y) {
      host.style.left = clamp(x, 0, Math.max(0, window.innerWidth - SIZE)) + 'px';
      host.style.top = clamp(y, 0, Math.max(0, window.innerHeight - SIZE)) + 'px';
      host.style.right = 'auto';
      host.style.bottom = 'auto';
    }

    img.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      var rect = host.getBoundingClientRect();
      drag = { sx: e.clientX, sy: e.clientY, x0: rect.left, y0: rect.top, moved: false };
      if (img.setPointerCapture) {
        try { img.setPointerCapture(e.pointerId); } catch (err) {}
      }
    });

    img.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.sx;
      var dy = e.clientY - drag.sy;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
      if (drag.moved) place(drag.x0 + dx, drag.y0 + dy);
    });

    function endDrag() {
      if (!drag) return;
      var moved = drag.moved;
      drag = null;
      if (moved) savePos();
      else openCard();
    }

    img.addEventListener('pointerup', endDrag);
    img.addEventListener('pointercancel', endDrag);
    img.addEventListener('click', function (e) { e.preventDefault(); });

    var stored = readPos();
    if (stored) place(stored.x, stored.y);

    window.addEventListener('resize', function () {
      var rect = host.getBoundingClientRect();
      if (host.style.left) place(rect.left, rect.top);
      if (card.classList.contains('on')) placeCard();
    });

    paintSticker();
    paintCard();

    var seen = false;
    try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch (e) { seen = true; }
    if (!seen) {
      hint.classList.add('on');
      setTimeout(function () {
        hint.classList.remove('on');
        try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {}
      }, 5200);
    }

    window.__dshHarumasaPet = {
      open: openCard,
      refresh: loadBalance,
      remove: function () {
        host.remove();
        window.__dshHarumasaPetLoaded = false;
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
