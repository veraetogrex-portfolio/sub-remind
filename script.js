// VECTOR Renew · remind before the charge — zero dependencies.
// <section class="sr" data-assets="assets/"></section> becomes the whole app: overview and one subscription.
// The reminder is a bell on a 14-day strip above the paper charge tag. Picking "3 days before" lifts the bell
// off the charge day and carries it three days back; a bracket trails it: "3 days to decide". Save shows the push.
;(() => {
  'use strict';

  const svg = (d, o = {}) => `<svg width="${o.s || 18}" height="${o.s || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${o.w || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const P = {
    overview: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
    subs: '<path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4h-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    bills: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
    cards: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    family: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6M18 14c2 .6 3 2.8 3 6"/>',
    insights: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
  };
  const NAV = [['overview', 'Overview'], ['subs', 'Subscriptions'], ['calendar', 'Calendar'], ['bills', 'Bills'], ['cards', 'Cards'], ['family', 'Family'], ['insights', 'Insights'], ['settings', 'Settings']];
  // [photo, name, plan, next charge, price, reminder, reminder on]
  const SUBS = [
    ['climb', 'Harbor Climb', 'monthly pass', 'Tue, Dec 1', '$49.00', '1 day before', true],
    ['roastery', 'Roastery Club', '2 bags a month', 'Fri, Dec 4', '$22.00', 'No reminder', false],
    ['tulips', 'Tulip &amp; Twine', 'weekly flowers', 'Wed, Dec 9', '$34.00', '3 days before', true],
    ['nightreel', 'Nightreel', 'Premium 4K', 'Tue, Dec 15', '$15.99', 'On the day', false],
    ['groove', 'Groove', 'family music', 'Fri, Dec 18', '$10.99', 'No reminder', false],
    ['basil', 'Basil Box', '3 dinners a week', 'Tue, Dec 22', '$59.90', '1 week before', true],
  ];
  const CHARGE_DAYS = { 1: 'climb', 4: 'roastery', 9: 'tulips', 15: 'nightreel', 18: 'groove', 22: 'basil' };
  const STRIP = [[6, 'Sun'], [7, 'Mon'], [8, 'Tue'], [9, 'Wed'], [10, 'Thu'], [11, 'Fri'], [12, 'Sat'], [13, 'Sun'], [14, 'Mon'], [15, 'Tue'], [16, 'Wed'], [17, 'Thu'], [18, 'Fri'], [19, 'Sat']];
  const HISTORY = [['Sun, Nov 15', '$15.99'], ['Thu, Oct 15', '$15.99'], ['Tue, Sep 15', '$15.99'], ['Sat, Aug 15', '$15.99', true], ['Wed, Jul 15', '$13.99'], ['Mon, Jun 15', '$13.99']];
  // lead time in days → [option, date, notification title, bracket caption]
  const LEADS = {
    0: ['On the day', 'Tue, Dec 15', 'Nightreel renews today', ''],
    1: ['1 day before', 'Mon, Dec 14', 'Nightreel renews tomorrow', '1 day to decide'],
    3: ['3 days before', 'Sat, Dec 12', 'Nightreel renews in 3 days', '3 days to decide'],
    7: ['1 week before', 'Tue, Dec 8', 'Nightreel renews in a week', '1 week to decide'],
  };
  const CHARGE = 15, DAY_W = 56, SPAN_MAX = 372;

  class RenewApp {
    constructor(root) {
      this.root = root;
      const A = root.dataset.assets || 'assets/';
      const ph = (n, w, h, r, alt = '') => `<span class="sr-ph" style="width:${w}px;height:${h}px;border-radius:${r}"><img src="${A}${n}.jpg" alt="${alt}"></span>`;
      const cal = [''].concat(Array.from({ length: 31 }, (_, i) => i + 1)).map(d => `<span class="sr-cd">${d}${CHARGE_DAYS[d] ? `<span class="sr-t${d === CHARGE ? ' is-pick' : ''}"><img src="${A}${CHARGE_DAYS[d]}.jpg" alt=""></span>` : ''}</span>`).join('');
      root.innerHTML = `
<nav class="sr-side" aria-label="Main">
  <div class="sr-logo"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M21 13a8 8 0 1 1-3-6.2" fill="none" stroke="#EDEAE3" stroke-width="2" stroke-linecap="round"/><path d="M19 3v4.4h-4.4" fill="none" stroke="#EDEAE3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="13" r="3" fill="#F2A93B"/></svg><b>VECTOR</b><span>Renew</span></div>
  ${NAV.map(([k, t]) => `<a class="sr-nav" href="#" data-nav="${k}">${svg(P[k])}${t}${k === 'subs' ? '<span class="sr-count">6</span>' : ''}</a>`).join('')}
  <div class="sr-side-foot">
    <div class="sr-tile"><div class="sr-small">Reminders on</div><div style="font-size:14px;font-weight:600;margin-top:2px">4 of 6 subscriptions</div><div class="sr-bar"><span style="width:67%"></span></div></div>
    <div class="sr-me">${ph('nora', 34, 34, '50%')}<div><div style="font-size:13.5px;font-weight:600">Nora Lind</div><div style="font-size:12px;color:var(--sr-muted)">Family plan</div></div></div>
  </div>
</nav>
<div class="sr-col">
  <header class="sr-top">
    <label class="sr-search">${svg(P.search, { s: 16, w: 2 })}<span class="sr-sr">Search</span><input type="search" placeholder="Search subscriptions, charges, cards"></label>
    <div class="sr-top-r">
      <button class="sr-ghost" type="button">${svg(P.plus, { s: 16, w: 2 })}Add subscription</button>
      <button class="sr-ib" type="button" aria-label="Notifications, 2 new">${svg(P.bell, { s: 19 })}<span class="sr-dot">2</span></button>
      ${ph('nora', 34, 34, '50%', 'Nora Lind')}
    </div>
  </header>
  <div class="sr-views">

    <div class="sr-view sr-over" data-view="overview">
      <main class="sr-over-main">
        <div style="display:flex;align-items:flex-end;justify-content:space-between">
          <div><h1 class="sr-h1">Good evening, Nora</h1><p class="sr-sub">6 subscriptions renew in December · $191.88 in total</p></div>
          <div class="sr-tabs"><button type="button" aria-pressed="true">December</button><button type="button" aria-pressed="false">Year</button></div>
        </div>
        <div style="display:flex;gap:18px">
          <section class="sr-card" style="width:330px;flex:none;padding:16px 18px">
            <div class="sr-sec-h" style="margin-bottom:12px"><h2 class="sr-h2">December charges</h2><span class="sr-small">6 days</span></div>
            <div class="sr-cal sr-cal-h"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>
            <div class="sr-cal">${cal}</div>
          </section>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:18px">
            <section class="sr-card" style="padding:16px 18px">
              <div class="sr-sec-h"><h2 class="sr-h2">This month</h2><span class="sr-small">$4.20 more than November</span></div>
              <div class="sr-num" style="font-size:24px;font-weight:600;margin:10px 0 12px">$191.88</div>
              <div class="sr-split"><span style="width:31%;background:#8FB573"></span><span style="width:26%;background:#D98A5B"></span><span style="width:18%;background:#E4C79A"></span><span style="width:14%;background:#7FA6C9"></span><span style="width:11%;background:#B58BC4"></span></div>
              <div class="sr-legend"><span><i style="background:#8FB573"></i>Food $59.90</span><span><i style="background:#D98A5B"></i>Sport $49.00</span><span><i style="background:#E4C79A"></i>Home $34.00</span><span><i style="background:#7FA6C9"></i>Films and music $26.98</span><span><i style="background:#B58BC4"></i>Coffee $22.00</span></div>
            </section>
            <section class="sr-card" style="padding:14px 18px;display:flex;align-items:center;gap:14px">
              <div class="sr-hint-ic">${svg(P.bell, { s: 20 })}</div>
              <div style="flex:1"><div style="font-size:14px;font-weight:600" data-hint>Nightreel reminds you on the day it charges</div><div class="sr-small" style="margin-top:2px">Roastery Club and Groove have no reminder at all</div></div>
              <button class="sr-btn" type="button" data-review>Review</button>
            </section>
          </div>
        </div>
        <section class="sr-card" style="padding:0 0 4px;overflow:hidden">
          <div class="sr-sec-h" style="padding:14px 16px 12px"><h2 class="sr-h2">Your subscriptions</h2><a class="sr-link" href="#">Manage all</a></div>
          <div class="sr-row sr-row-h"><span></span><span>Service</span><span>Next charge</span><span style="text-align:right">Price</span><span>Reminder</span></div>
          ${SUBS.map(([p, n, plan, next, price, rem, on]) => {
            const open = p === 'nightreel';
            return `<${open ? 'a href="#" data-open' : 'div'} class="sr-row${open ? ' is-flag' : ''}">${ph(p, 36, 36, '9px')}<span><b>${n}</b> <span class="sr-muted">· ${plan}</span></span><span>${next}</span><span class="sr-num" style="text-align:right">${price}</span><span><span class="sr-rem${on ? ' is-on' : ''}"${open ? ' data-row-rem' : ''}>${rem}</span></span></${open ? 'a' : 'div'}>`;
          }).join('')}
        </section>
      </main>
      <aside class="sr-over-side" aria-label="Coming up and family">
        <section class="sr-card sr-box">
          <div class="sr-sec-h"><h2 class="sr-h2">Coming up</h2><span class="sr-small">next 30 days</span></div>
          <div class="sr-li">${ph('climb', 44, 44, '9px')}<div><div style="font-size:13.5px;font-weight:500">Harbor Climb</div><div style="font-size:12px;color:var(--sr-muted)">in 6 days · reminder Mon</div></div><span class="sr-num" style="font-size:13.5px">$49.00</span></div>
          <div class="sr-li">${ph('roastery', 44, 44, '9px')}<div><div style="font-size:13.5px;font-weight:500">Roastery Club</div><div style="font-size:12px;color:var(--sr-muted)">in 9 days · no reminder</div></div><span class="sr-num" style="font-size:13.5px">$22.00</span></div>
          <div class="sr-li">${ph('tulips', 44, 44, '9px')}<div><div style="font-size:13.5px;font-weight:500">Tulip &amp; Twine</div><div style="font-size:12px;color:var(--sr-muted)">in 14 days · reminder Sun</div></div><span class="sr-num" style="font-size:13.5px">$34.00</span></div>
        </section>
        <section class="sr-card sr-box" style="flex-direction:row;align-items:center">
          <div class="sr-card-chip"><span style="position:absolute;left:7px;top:8px;width:11px;height:9px;border-radius:2px;background:#C9A45C"></span><span style="position:absolute;right:6px;bottom:5px;font-size:9px;font-weight:700;color:#3A3428">4821</span></div>
          <div style="flex:1"><div style="font-size:14px;font-weight:600">Debit card ··4821</div><div class="sr-small" style="margin-top:2px">Pays for 5 subscriptions · expires 08/28</div></div>
        </section>
        <section class="sr-card sr-box">
          <div class="sr-sec-h"><h2 class="sr-h2">Family plan</h2><span class="sr-small">3 people</span></div>
          <div class="sr-feed">${ph('leo', 32, 32, '50%')}<span>Leo added Groove to the plan</span><span>2 d</span></div>
          <div class="sr-feed">${ph('ana', 32, 32, '50%')}<span>Ana watches Nightreel on 2 screens</span><span>5 d</span></div>
          <div class="sr-feed">${ph('nora', 32, 32, '50%')}<span>You paused Harbor Climb in July</span><span>4 mo</span></div>
        </section>
      </aside>
    </div>

    <div class="sr-view" data-view="sub">
      <main class="sr-sub-main">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="sr-crumbs"><a href="#" data-back>Subscriptions</a><span style="margin:0 8px">/</span>Nightreel</div>
          <div style="display:flex;gap:8px"><button class="sr-btn" type="button">Change plan</button><button class="sr-btn" type="button">Billing details</button></div>
        </div>
        <section class="sr-card" style="padding:14px;display:flex;gap:18px;align-items:center">
          ${ph('nightreel', 220, 124, '10px', 'Night coast road with a vintage car')}
          <div style="flex:1;min-width:0">
            <h1 style="font-size:24px;font-weight:700;letter-spacing:-.01em;line-height:1.2">Nightreel Premium</h1>
            <div style="font-size:13.5px;color:var(--sr-muted);margin-top:4px">Films and series · 4K · 4 screens at once</div>
            <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><span class="sr-chip"><i style="width:7px;height:7px;border-radius:50%;background:#8FB573"></i>Active since Mar 2025</span><span class="sr-chip">Debit ··4821</span><span class="sr-chip">Shared with Leo and Ana</span></div>
          </div>
          <div style="text-align:right;padding-right:8px">
            <div class="sr-num" style="font-size:22px;font-weight:600">$15.99<span style="font-size:13.5px;font-weight:500;color:var(--sr-muted)"> / month</span></div>
            <div style="font-size:13px;color:var(--sr-text-2);margin-top:4px">Renews Tue, Dec 15</div>
          </div>
        </section>
        <section class="sr-card" style="padding:16px 15px 18px" aria-label="December 2026">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h2 class="sr-h2">December 2026</h2>
            <div style="display:flex;gap:16px;font-size:12.5px;color:var(--sr-text-2)">
              <span style="display:flex;align-items:center;gap:6px;color:var(--sr-text-2)"><span style="color:var(--sr-bell);display:flex">${svg(P.bell, { s: 14, w: 2.2 })}</span>Reminder</span>
              <span style="display:flex;align-items:center;gap:6px"><i style="width:14px;height:10px;border-radius:3px;background:var(--sr-paper)"></i>Charge</span>
            </div>
          </div>
          <div class="sr-strip">
            <div class="sr-days">${STRIP.map(([d, w]) => `<span class="sr-day${w === 'Sat' || w === 'Sun' ? ' we' : ''}${d === CHARGE ? ' is-charge' : ''}" data-day="${d}"><span class="w">${w}</span><span class="n">${d}</span></span>`).join('')}</div>
            <div class="sr-span"></div><div class="sr-tick"></div>
            <div class="sr-span-t"><span data-span-t></span></div>
            <div class="sr-tag" aria-label="Charge $15.99 on Tue, Dec 15">$15.99</div>
            <div class="sr-bell" data-bell><i>${svg(P.bell, { s: 17, w: 2.2 })}</i></div>
          </div>
        </section>
        <div style="flex:1;min-height:0;display:flex;gap:16px">
          <section class="sr-card" style="flex:1;padding:16px 18px 8px">
            <div class="sr-sec-h" style="margin-bottom:8px"><h2 class="sr-h2">Billing history</h2><a class="sr-link" href="#">All 21</a></div>
            ${HISTORY.map(([d, s, up]) => `<div class="sr-hist"><span>${d}${up ? ' <span style="font-size:12px;color:var(--sr-bell-soft)">· price up</span>' : ''}</span><span class="sr-muted">Debit ··4821</span><span class="sr-num" style="text-align:right${s === '$13.99' ? ';color:var(--sr-muted)' : ''}">${s}</span></div>`).join('')}
            <div class="sr-hist" style="color:var(--sr-muted)"><span>Paid since March 2025</span><span></span><span class="sr-num" style="text-align:right;color:var(--sr-text)">$301.79</span></div>
          </section>
          <section class="sr-card" style="width:300px;flex:none;padding:16px 18px;display:flex;flex-direction:column;gap:13px">
            <div class="sr-sec-h"><h2 class="sr-h2">Watched in November</h2><span class="sr-small">31 h</span></div>
            ${[['ana', 'Ana', '17 h', 100], ['nora', 'Nora', '9 h', 53], ['leo', 'Leo', '5 h', 29]].map(([p, n, h, w]) => `<div class="sr-watch">${ph(p, 32, 32, '50%')}<div><div style="display:flex;justify-content:space-between;font-size:13px"><span>${n}</span><span class="sr-muted">${h}</span></div><div class="sr-bar" style="margin-top:6px"><span style="width:${w}%"></span></div></div></div>`).join('')}
            <div class="sr-small" style="border-top:1px solid var(--sr-line-2);padding-top:11px">Last watched Sun, Nov 22 on the living room TV</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:13px"><div style="display:flex;justify-content:space-between"><span class="sr-muted">Screens in use</span><span>3 of 4</span></div><div style="display:flex;justify-content:space-between"><span class="sr-muted">Cost per hour</span><span class="sr-num">$0.52</span></div></div>
          </section>
        </div>
      </main>
      <aside class="sr-rp" aria-label="Renewal reminder">
        <div><h2>Renewal reminder</h2><div style="font-size:13px;color:var(--sr-muted);margin-top:4px">Nightreel charges $15.99 on Tue, Dec 15</div></div>
        <fieldset><legend class="sr-label">Remind me</legend>
          <div class="sr-opts">${Object.entries(LEADS).map(([n, [t, d]]) => `<label class="sr-opt" data-lead="${n}"><input type="radio" name="sr-lead" value="${n}"><span><b>${t}</b><small>${d}</small></span></label>`).join('')}</div>
        </fieldset>
        <div><div class="sr-label">Notify me by</div>
          <div class="sr-segs"><button class="sr-seg" type="button" aria-pressed="true">Push</button><button class="sr-seg" type="button" aria-pressed="false">Email</button><button class="sr-seg" type="button" aria-pressed="false">Both</button></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:14px"><span>Time</span><span class="sr-time">9:00 AM<span style="color:var(--sr-muted);display:flex">${svg(P.down, { s: 12, w: 2.4 })}</span></span></div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13.5px">
          <div style="display:flex;align-items:center;justify-content:space-between"><span>Tell me if the price changes</span><button class="sr-sw" type="button" role="switch" aria-checked="true" aria-label="Tell me if the price changes"><i></i></button></div>
          <div style="display:flex;align-items:center;justify-content:space-between"><span>Tell me if the card is declined</span><button class="sr-sw" type="button" role="switch" aria-checked="true" aria-label="Tell me if the card is declined"><i></i></button></div>
        </div>
        <div class="sr-slot" aria-live="polite">
          <div class="sr-sum"><div><span class="sr-muted">Reminder</span><span class="sr-sum-r" data-sum></span></div><div><span class="sr-muted">Charge</span><span style="font-weight:600">Tue, Dec 15 · $15.99</span></div></div>
          <div class="sr-note">${ph('nightreel', 36, 36, '8px')}<div><div class="sr-note-h"><span>VECTOR Renew</span><span data-note-at></span></div><div class="sr-note-t" data-note-t></div><div class="sr-note-s">$15.99 on Tue, Dec 15 · debit ··4821</div></div></div>
        </div>
        <div class="sr-act">
          <button class="sr-save" type="button" data-save>${svg(P.check, { s: 18, w: 2.4 })}<span data-save-t>Save reminder</span></button>
          <div class="sr-foot" data-foot></div>
        </div>
      </aside>
    </div>

  </div>
</div>`;
      const q = s => root.querySelector(s);
      this.views = [...root.querySelectorAll('.sr-view')];
      this.navs = [...root.querySelectorAll('.sr-nav')];
      this.days = [...root.querySelectorAll('.sr-day')];
      this.radios = [...root.querySelectorAll('.sr-opt input')];
      this.bell = q('[data-bell]');
      this.el = { spanT: q('[data-span-t]'), spanBox: q('.sr-span-t'), sum: q('[data-sum]'), noteAt: q('[data-note-at]'), noteT: q('[data-note-t]'),
        save: q('[data-save]'), saveT: q('[data-save-t]'), foot: q('[data-foot]'), rowRem: q('[data-row-rem]'), hint: q('[data-hint]') };
      const nav = (sel, view) => q(sel).addEventListener('click', e => { e.preventDefault(); this.go(view); });
      nav('[data-open]', 'sub'); nav('[data-back]', 'overview'); nav('[data-nav="overview"]', 'overview'); nav('[data-nav="subs"]', 'sub');
      q('[data-review]').addEventListener('click', () => this.go('sub'));
      this.radios.forEach(r => r.addEventListener('change', () => this.setLead(+r.value)));
      // the demo cursor clicks the option card itself; a real click on the card reaches the radio through the label
      root.querySelectorAll('.sr-opt').forEach(l => l.addEventListener('click', () => this.setLead(+l.dataset.lead)));
      this.el.save.addEventListener('click', () => this.save());
      root.querySelectorAll('.sr-seg, .sr-tabs button').forEach(b => b.addEventListener('click', () => {
        b.parentElement.querySelectorAll('[aria-pressed]').forEach(x => x.setAttribute('aria-pressed', x === b));
      }));
      root.querySelectorAll('.sr-sw').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true')));
      this.reset();
    }

    quietly(fn) {
      this.root.classList.add('is-instant');
      fn();
      requestAnimationFrame(() => requestAnimationFrame(() => this.root.classList.remove('is-instant')));
    }

    go(view) {
      this.root.dataset.view = view;
      this.views.forEach(v => v.classList.toggle('is-on', v.dataset.view === view));
      this.navs.forEach(n => n.classList.toggle('is-on', n.dataset.nav === (view === 'sub' ? 'subs' : 'overview')));
    }

    // the bell leaves the charge day: one transform carries it `lead` days back, the bracket trails it,
    // the day it lands on lights up; the $15.99 tag stays on Tue, Dec 15
    setLead(lead) {
      if (!LEADS[lead] || lead === this.lead) return;
      const [, date, , caption] = LEADS[lead];
      this.lead = lead;
      this.root.dataset.lead = lead;
      this.radios.forEach(r => { r.checked = +r.value === lead; });
      this.root.style.setProperty('--lead', lead);
      this.root.style.setProperty('--span', lead ? (lead * DAY_W - 20) / SPAN_MAX : 0);
      this.bell.classList.remove('is-hop'); void this.bell.offsetWidth; this.bell.classList.add('is-hop');
      this.days.forEach(d => d.classList.toggle('is-remind', lead > 0 && +d.dataset.day === CHARGE - lead));
      this.el.spanT.textContent = caption;
      this.el.spanBox.style.left = `${540 - 28 * lead - 70}px`;   // centred between the bell and the charge tag
      this.el.sum.textContent = `${date} · 9:00 AM`;
      this.markSaved(this.confirmed && lead === this.savedLead);   // back on the saved choice: its confirmation and push come back
    }

    // Save: the button confirms, the summary gives way to the push Nora will get on the reminder day
    save() {
      if (this.lead === this.savedLead) return;
      this.savedLead = this.lead; this.confirmed = true;
      const [label, date, title] = LEADS[this.lead];
      this.el.noteAt.textContent = `${date} · 9:00`;
      this.el.noteT.textContent = title;
      this.el.rowRem.textContent = label;
      this.el.rowRem.classList.toggle('is-on', this.lead > 0);
      this.el.hint.textContent = `Nightreel reminds you on ${date}, before it charges`;
      this.markSaved(true);
    }

    markSaved(on) {
      this.root.dataset.saved = on;
      this.el.save.disabled = this.lead === this.savedLead && !on;
      this.el.saveT.textContent = on ? 'Reminder saved' : 'Save reminder';
      this.el.foot.textContent = on ? `Push on ${LEADS[this.lead][1]} · charge stays on Tue, Dec 15` : 'You can change or turn it off any time';
    }

    reset() {
      this.quietly(() => {
        this.lead = null; this.savedLead = 0; this.confirmed = false;
        this.el.rowRem.textContent = LEADS[0][0];
        this.el.rowRem.classList.remove('is-on');
        this.el.hint.textContent = 'Nightreel reminds you on the day it charges';
        this.setLead(0);
        this.bell.classList.remove('is-hop');
        this.go('overview');
      });
    }
  }

  document.querySelectorAll('.sr').forEach(el => { el.renewApp = new RenewApp(el); });
})();
