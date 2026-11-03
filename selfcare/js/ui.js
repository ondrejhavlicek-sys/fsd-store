/* copied from fsd-selfcare @ f2a58c7 (js/ui.js), do not edit upstream here; re-run selfcare/tools/sync.py to update */
/* Shared UI helpers: escaping, icons, alerts, dialogs/sheets, toast, form fields. */
window.UI = (function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const P = {
    company: 'M3 21V7l9-4 9 4v14M9 21v-6h6v6M7 10h2m6 0h2M7 13h2m6 0h2',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    pin: 'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
    card: 'M2 6h20v12H2zM2 10h20M6 15h4',
    credit: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4',
    box: 'M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
    plus: 'M12 5v14M5 12h14',
    close: 'M18 6L6 18M6 6l12 12',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16v-5M12 8h.01',
    ok: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6',
    warn: 'M12 3l10 18H2L12 3zM12 10v5M12 18h.01',
    err: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 9l-6 6M9 9l6 6',
    lock: 'M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5z',
    refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
    cart: 'M3 4h2l2.5 11h11L21 7H6M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    menu: 'M4 7h16M4 12h16M4 17h16',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.500 2.700 3.800 5.700 3.800 9s-1.300 6.300-3.800 9c-2.500-2.700-3.800-5.700-3.800-9S9.500 5.700 12 3z'
  };
  const icon = (n, cls) => n === 'company'
    ? `<img class="${cls || ''}" src="assets/icons/building-outline.svg" width="24" height="24" alt="">`
    : `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n] || ''}"/></svg>`;

  const alertBox = (type, title, text, extra) =>
    `<div class="alert ${type}" role="${type === 'err' ? 'alert' : 'status'}">${icon(type === 'ok' ? 'ok' : type === 'err' ? 'err' : type === 'warn' ? 'warn' : 'info')}<div><b>${esc(title)}</b>${text ? esc(text) : ''}${extra || ''}</div></div>`;
  const loadingBox = () => `<div class="loading" role="status" aria-label="Načítání"><i></i><i></i><i></i></div>`;
  const emptyState = (title, text, btn) => `<div class="empty"><h2>${esc(title)}</h2><p>${esc(text)}</p>${btn || ''}</div>`;

  /* ---- toast ---- */
  let toastT;
  function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = window.I18N ? I18N.t(msg) : msg;
    document.body.appendChild(t);
    clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3200);
  }

  /* ---- form fields ---- */
  const field = (label, name, val, o) => {
    o = o || {};
    return `<div class="fld" data-f="${name}"><label for="f-${name}">${esc(label)}${o.req ? ' <span class="muted">(povinné)</span>' : ''}</label>
      <input id="f-${name}" name="${name}" type="${o.type || 'text'}" value="${esc(val)}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} ${o.req ? 'required' : ''} autocomplete="off"><div class="err" hidden></div></div>`;
  };

  /* ---- dialog / bottom sheet ---- */
  let lastFocus = null;
  function closeDialog() {
    const o = document.querySelector('.ov'); if (!o) return;
    o.remove(); document.removeEventListener('keydown', onKey);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  function onKey(e) { if (e.key === 'Escape') closeDialog(); }

  /* opts: title, sub, body, submit, danger, wide, onSubmit(data, form) -> error string | falsy to close, onOpen(el) */
  function dialog(o) {
    closeDialog();
    lastFocus = document.activeElement;
    const ov = document.createElement('div');
    ov.className = 'ov';
    ov.innerHTML = `<form class="dlg ${o.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dlg-t" novalidate>
      <div class="grab"></div>
      <div class="dlg-h"><div><h2 id="dlg-t">${esc(o.title)}</h2>${o.sub ? `<p class="muted">${esc(o.sub)}</p>` : ''}</div>
        <button type="button" class="x" data-close aria-label="Zavřít">${icon('close')}</button></div>
      <div class="dlg-body">${o.body || ''}</div>
      <div class="dlg-f">${o.submit === null ? '' : `<button class="btn ${o.danger ? 'danger' : ''}" type="submit">${esc(o.submit || 'Uložit')}</button>`}<button type="button" class="link" data-close>${esc(o.cancel || 'Zrušit')}</button></div></form>`;
    document.body.appendChild(ov);
    if (window.I18N) I18N.apply(ov);
    document.addEventListener('keydown', onKey);
    const form = ov.querySelector('form');
    ov.addEventListener('mousedown', e => { if (e.target === ov) closeDialog(); });
    ov.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeDialog));
    // swipe-to-dismiss on mobile (drag the handle down)
    const grab = ov.querySelector('.grab'); let y0 = null;
    grab.addEventListener('pointerdown', e => { y0 = e.clientY; grab.setPointerCapture(e.pointerId); });
    grab.addEventListener('pointermove', e => { if (y0 != null) form.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)`; });
    grab.addEventListener('pointerup', e => { if (y0 != null && e.clientY - y0 > 80) closeDialog(); else form.style.transform = ''; y0 = null; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      form.querySelectorAll('.fld').forEach(f => { f.classList.remove('bad'); const er = f.querySelector('.err'); if (er) er.hidden = true; });
      const fd = new FormData(form); const data = {};
      for (const k of new Set(fd.keys())) { const all = fd.getAll(k); data[k] = all.length > 1 ? all : all[0]; }
      form.querySelectorAll('input[type=checkbox]').forEach(c => { if (!c.name) return; if (!(c.name in data)) data[c.name] = []; else if (!Array.isArray(data[c.name])) data[c.name] = [data[c.name]]; });
      const err = o.onSubmit ? o.onSubmit(data, form) : null;
      if (err) {
        if (typeof err === 'object') { const f = form.querySelector(`[data-f="${err.field}"]`); if (f) { f.classList.add('bad'); const er = f.querySelector('.err'); er.textContent = window.I18N ? I18N.t(err.msg) : err.msg; er.hidden = false; f.querySelector('input,select')?.focus(); } }
        return;
      }
      closeDialog();
    });
    if (o.onOpen) o.onOpen(ov);
    const first = form.querySelector('input:not([type=hidden]),select,textarea'); (first || form.querySelector('button')).focus();
    return ov;
  }

  function confirmDialog(title, text, label, onYes, danger) {
    dialog({ title, sub: text, submit: label, danger: danger !== false, onSubmit: () => { onYes(); return null; } });
  }

  return { esc, icon, alertBox, loadingBox, emptyState, toast, field, dialog, confirmDialog, closeDialog };
})();
