// ---------- STATE (shared, embedded in the page) ----------
const STATE = JSON.parse(document.getElementById("state").textContent);

// ---------- FIXED CONFIG ----------
const TERM_START = new Date(2026, 8, 15);   // 15 Sep 2026
const TERM_END   = new Date(2026, 11, 15);  // 15 Dec 2026
const GRID_START = new Date(2026, 8, 14);   // Mon 14 Sep, week 1
const WEEKS = 14;                            // Mon 14 Sep to Sun 20 Dec
const dayMs = 86400000;

const LABEL = {done:"Done", active:"In progress", due:"Due this week", wait:"Waiting on client", up:"Upcoming", approved:"Approved by client", solved:"Solved by client"};
const DELIVERABLE_STATUSES = ["up","due","active","wait","done","approved"];
const CLIENT_STATUSES = ["wait","active","solved"];

const DATES = [
  {d:"Tue 15 Sep", w:"Agreement effective. Services start.", who:"Both"},
  {d:"Thu 17 Sep", w:"Recording topic list to Dr. Dada", who:"Brave New"},
  {d:"Fri 18 Sep · 7:00 AM PT", w:"Editing Direction Discussion (Zoom)", who:"Anne, Shannon, Prashmi"},
  {d:"after the audit", w:"YouTube ads start only after the technical audit: spend goes on the current assets or on the new recordings, decided together. Focus until then: channel makeover.", who:"Brave New, client card"},
  {d:"22 to 25 Sep", w:"Batch recording days, 8 to 10 long-form pieces", who:"Dr. Dada, Prashmi; Anne directs remotely"},
  {d:"Fri 25 Sep · 7:00 AM PT (proposed)", w:"Week 2 review and first weekly catch-up", who:"Both"},
  {d:"26 Sep to 12 Oct", w:"Dr. Dada away. Build phase, no filming.", who:"Brave New builds; Prashmi edits and publishes"},
  {d:"13 to 16 Oct", w:"Handover session 1, new channel look live, monthly review 1", who:"Both"},
  {d:"19 to 30 Oct", w:"Second recording block", who:"Dr. Dada, Prashmi; Anne directs"},
  {d:"2 to 13 Nov", w:"Handover session 2: recipe book, playbook, publishing kit", who:"Both"},
  {d:"Fri 13 Nov", w:"Strategy sign-off. Commercial scenarios batch 1 delivered.", who:"Both"},
  {d:"Mon 16 Nov", w:"Mid-term review. Batch 1 recording week begins.", who:"Both"},
  {d:"Tue 15 Dec", w:"End of Term. Monthly review 2, plan for January onward.", who:"Both"},
];
const ROWS = [
  {lbl:"Month 1 · Foundation", sub:"15 Sep to 15 Oct", cls:"phase", s:[8,15], e:[9,15], txt:"Audit, topics, scripts, identity, thumbnails"},
  {lbl:"Month 2 · Growth plan and handover", sub:"15 Oct to 15 Nov", cls:"phase", s:[9,15], e:[10,15], txt:"Handovers, sign-off, batch 1 scenarios"},
  {lbl:"Month 3 · Commercial production", sub:"15 Nov to 15 Dec", cls:"phase", s:[10,15], e:[11,15], txt:"Batch 1 directed and published, batch 2 scenarios"},
  {lbl:"YouTube advertising", sub:"weekly optimisation", cls:"ads", s:[8,22], e:[11,15], txt:"Starts after the audit: current assets or new recordings, USD 500 per month on the client card"},
  {lbl:"Recording blocks", sub:"Dr. Dada on camera", cls:"rec", multi:[[[8,22],[8,25],"Block 1 · 22 to 25 Sep"],[[9,19],[9,30],"Block 2 · 19 to 30 Oct"],[[10,16],[10,20],"Batch 1 · w/o 16 Nov"]]},
  {lbl:"Dr. Dada away", sub:"no filming", cls:"away", s:[8,26], e:[9,12], txt:"Build phase"},
];
const MARKS = [
  {d:[8,22], t:"Ads decision, after the audit", review:false},
  {d:[8,25], t:"Week 2 review", review:true},
  {d:[9,14], t:"Handover 1, monthly review 1", review:true},
  {d:[10,13], t:"Strategy sign-off, batch 1 scenarios", review:false},
  {d:[10,16], t:"Mid-term review", review:true},
  {d:[11,15], t:"End of Term, monthly review 2", review:true},
];
const TEAM = [
  {n:"Dr. Arinola Dada", r:"CEO, Overlake Arthritis · on camera", w:"Confirms topics, records, medical review of every script, title and description before publishing."},
  {n:"Shannon", r:"Overlake Arthritis · management", w:"Decisions on scope and budget, receives the monthly review with Dr. Dada."},
  {n:"Jonamel (Jona) Macaling", r:"Executive Coordinator · client coordination", w:"Scheduling, meeting invites, access and setup items, single point of contact for logistics."},
  {n:"Craig", r:"Director of Operations · contract matters", w:"Copied on agreement, invoicing and any change in writing."},
  {n:"Prashmi", r:"Video editor and social media manager · client", w:"Films with Dr. Dada, edits to the editing directions, publishes, pulls stills for thumbnails."},
  {n:"Anne Becheru", r:"Brave New · lead strategist", w:"Strategy, growth plan, channel identity, direction, ad management, weekly catch-up and monthly review."},
  {n:"Cristian", r:"Brave New · project manager and video strategist", w:"Runs the roadmap and deadlines, scripts and editing directions, recording-day direction, format and Shorts strategy."},
  {n:"Approver", r:"To be named by the client", w:"Approves scripts, titles, thumbnails, channel design and community posts. One person, clause 4.2."},
];
const MONTHS = [
  {n:"Foundation", dates:"15 Sep to 15 Oct 2026"},
  {n:"Growth plan, handover, sign-off", dates:"15 Oct to 15 Nov 2026"},
  {n:"Commercial production starts", dates:"15 Nov to 15 Dec 2026"},
];

// ---------- HELPERS ----------
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const toDate = ([m,d]) => new Date(2026,m,d);
let EDITABLE = false;
const chip = (s, id, kind) => `<span class="chip s-${s}${EDITABLE && id ? " editable" : ""}"${EDITABLE && id ? ` role="button" tabindex="0" data-id="${id}" data-kind="${kind}"` : ""}>${LABEL[s] || s}</span>`;

// ---------- RENDER ----------
function render(){
  const today = new Date(); today.setHours(0,0,0,0);

  $("#asof").textContent = STATE.asof;
  $("#asofBy").textContent = "Updated by " + (STATE.asofBy || "Brave New");

  const totalDays = Math.round((TERM_END - TERM_START)/dayMs);
  let dayN = Math.round((today - TERM_START)/dayMs) + 1;
  dayN = Math.max(0, Math.min(totalDays, dayN));
  $("#dayCount").textContent = `Day ${dayN} of ${totalDays}`;
  $("#dayBar").style.width = `${Math.max(1, Math.round(dayN/totalDays*100))}%`;
  const m1 = new Date(2026,9,15), m2 = new Date(2026,10,15);
  $("#phaseNow").textContent = today < m1 ? "Month 1 · Foundation" : today < m2 ? "Month 2 · Growth plan and handover" : today <= TERM_END ? "Month 3 · Commercial production" : "Term complete";

  const items = STATE.items;
  const count = s => items.filter(i=>i.s===s).length;
  const finished = count("done") + count("approved");
  $("#doneCount").textContent = `${finished} / ${items.length}`;
  $("#doneSub").textContent = `done or approved · ${count("active")} in progress · ${count("due")} due this week`;
  $("#waitCount").textContent = STATE.checklist.filter(c=>c.s==="wait").length;

  // this week
  $("#weekList").innerHTML = items.filter(i => i.s==="active" || i.s==="due").map(i => `
    <li><span class="when">${esc(i.d)}</span><div class="what"><strong>${esc(i.t)}</strong><div class="meta">${chip(i.s, i.id, "item")}<span>${esc(i.o)}</span>${i.note?`<span>· ${esc(i.note)}</span>`:""}</div></div></li>`).join("")
    || `<li><span class="when"></span><div class="what">Nothing in progress. Next items are in the month lists below.</div></li>`;
  $("#weekClient").innerHTML = STATE.clientWeek.map(c => `
    <li><span class="when">${esc(c.w)}</span><div class="what">${c.t}<div class="meta">${chip(c.s, c.id, "client")}${c.h?`<span>${esc(c.h)}</span>`:""}</div></div></li>`).join("");

  // timeline
  const tl = $("#tl");
  const LABEL_W = 150;
  const gridEnd = new Date(GRID_START.getTime() + WEEKS*7*dayMs);
  const pct = date => Math.min(1, Math.max(0, (date - GRID_START)/(gridEnd - GRID_START)));
  const leftCss = f => `calc(${LABEL_W}px + (100% - ${LABEL_W}px) * ${f.toFixed(4)})`;
  const widthCss = f => `calc((100% - ${LABEL_W}px) * ${f.toFixed(4)} - 2px)`;
  let head = `<div class="tl-head" style="grid-template-columns:${LABEL_W}px repeat(${WEEKS},1fr)"><div></div>`;
  for (let w=0; w<WEEKS; w++){
    const d = new Date(GRID_START.getTime() + w*7*dayMs);
    const mon = d.toLocaleDateString("en-GB",{month:"short"});
    head += `<div class="m">${w===0||d.getDate()<=7?mon:"&nbsp;"}<span>${d.getDate()}</span></div>`;
  }
  head += `</div>`;
  let rows = "";
  for (const r of ROWS){
    rows += `<div class="tl-row"><div class="lbl">${r.lbl}<small>${r.sub}</small></div>`;
    const spans = r.multi ? r.multi.map(([s,e,t])=>({s,e,t})) : [{s:r.s,e:r.e,t:r.txt}];
    for (const sp of spans){
      const a = pct(toDate(sp.s)), b = pct(new Date(toDate(sp.e).getTime()+dayMs));
      rows += r.cls==="rec" ? `<div class="span ${r.cls}" style="left:${leftCss(a)};width:${widthCss(b-a)}" title="${esc(sp.t)}"><span>${esc(sp.t)}</span></div>` : `<div class="span ${r.cls}" style="left:${leftCss(a)};width:${widthCss(b-a)}" title="${esc(sp.t)}">${esc(sp.t)}</div>`;
    }
    rows += `</div>`;
  }
  rows += `<div class="tl-row"><div class="lbl">Fixed dates<small>see below</small></div>`;
  for (const mk of MARKS){
    rows += `<div class="mark ${mk.review?"review":""}" style="left:${leftCss(pct(toDate(mk.d)))}" title="${esc(mk.t)}"></div>`;
  }
  rows += `</div>`;
  tl.innerHTML = head + rows;
  if (today >= GRID_START && today <= gridEnd){
    const line = document.createElement("div");
    line.className = "today-line";
    line.style.left = leftCss(pct(today));
    tl.appendChild(line);
  }
  $("#milestones").innerHTML = MARKS.map(m => `<div><span class="d">${toDate(m.d).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span><span>${esc(m.t)}</span></div>`).join("");

  // months
  $("#months").innerHTML = MONTHS.map((mo,i)=>{
    const its = items.filter(x=>x.m===i+1);
    const fin = its.filter(x=>x.s==="done"||x.s==="approved").length;
    return `<article class="month"><header><span class="n">Month ${i+1}</span><h3>${esc(mo.n)}</h3><span class="dates">${esc(mo.dates)}</span><span class="count">${fin} of ${its.length} done</span></header>
    <ul class="items">${its.map(x=>`<li><div><div class="t">${esc(x.t)}<span class="owner">${esc(x.o)}</span></div><div class="d">${esc(x.d)}${x.note?` · ${esc(x.note)}`:""}</div></div>${chip(x.s, x.id, "item")}</li>`).join("")}</ul></article>`;
  }).join("");

  // team
  $("#team").innerHTML = TEAM.map(t=>`<div><b>${esc(t.n)}</b><span class="eyebrow" style="display:block;margin:2px 0 6px;text-transform:none;letter-spacing:0">${esc(t.r)}</span><span>${esc(t.w)}</span></div>`).join("");

  // checklist
  $("#checklist").innerHTML = STATE.checklist.map(c=>`<li><div><div class="t">${esc(c.t)}</div>${c.h?`<div class="how">${esc(c.h)}</div>`:""}</div>${chip(c.s, c.id, "check")}</li>`).join("");

  // dates
  $("#dates").innerHTML = DATES.map(d=>`<tr><td class="d">${esc(d.d)}</td><td>${esc(d.w)}</td><td style="color:var(--muted)">${esc(d.who)}</td></tr>`).join("");

  // next fixed date
  const fixed = [[8,17,"Recording topic list to Dr. Dada"],[8,18,"Editing Direction Discussion, 7:00 AM PT"],[8,22,"Recording days begin, ads decision after the audit"],[8,25,"Week 2 review"],[9,13,"Handover session 1"],[9,19,"Second recording block"],[10,2,"Handover session 2"],[10,13,"Strategy sign-off"],[10,16,"Mid-term review"],[11,15,"End of Term"]];
  const nx = fixed.map(([m,d,t])=>({date:new Date(2026,m,d),t})).find(f=>f.date>=today);
  if (nx){ $("#nextDate").textContent = nx.date.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}); $("#nextWhat").textContent = nx.t; }
  else { $("#nextDate").textContent = "Term complete"; $("#nextWhat").textContent = "15 Dec 2026"; }

  // log
  if ($("#log")) $("#log").innerHTML = (STATE.log || []).slice(0,20).map(l=>`<li><span class="d">${esc(l.d)}</span><span>${esc(l.what)}<span class="who">${esc(l.who)}</span></span></li>`).join("")
    || `<li><span class="d"></span><span>No changes yet.</span></li>`;

  $("#editnote").hidden = !EDITABLE;
}

// ---------- SELF-PUBLISH ----------
function buildDoc(state){
  const [HEAD, TAIL] = window.__SRC;
  const stateBlock = `<script id="state" type="application/json">${JSON.stringify(state).replace(/<\//g,"<\\/")}<\/script>`;
  const src = `<script>window.__SRC=${JSON.stringify([HEAD, TAIL]).replace(/<\//g,"<\\/")};<\/script>`;
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n${HEAD}${stateBlock}\n${TAIL}\n${src}\n</body></html>`;
}

let ART = null, ROLE = "Brave New";
function toast(msg, ms){
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t);
  if (ms) setTimeout(()=>t.remove(), ms);
  return t;
}
function todayLabel(){ return new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"}); }
function shortDate(){ return new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }

async function setStatus(kind, id, s){
  const list = kind==="item" ? STATE.items : kind==="client" ? STATE.clientWeek : STATE.checklist;
  const row = list.find(x=>x.id===id);
  if (!row || row.s===s) return;
  const title = kind==="client" ? row.t.replace(/<[^>]+>/g,"") : row.t;
  const next = JSON.parse(JSON.stringify(STATE));
  const nlist = kind==="item" ? next.items : kind==="client" ? next.clientWeek : next.checklist;
  nlist.find(x=>x.id===id).s = s;
  next.asof = todayLabel();
  next.asofBy = ROLE;
  next.log = [{d: shortDate(), who: ROLE, what: `${title}: ${LABEL[s]}`}, ...(next.log||[])].slice(0,20);
  const t = toast("Saving…");
  try {
    await ART.publish(buildDoc(next));
    // the view reloads to the new version
  } catch (e) {
    t.remove();
    const code = e && e.code;
    if (code === "conflict") return; // reload delivers the new truth
    if (code === "not_writer" || code === "not_granted" || code === "not_declared" || code === "consent_required"){
      EDITABLE = false; render(); toast("This view is read-only.", 3000); return;
    }
    if (code === "rate_limited"){ toast("Too many changes at once. Wait a moment and try again.", 4000); return; }
    toast("Could not save. Try again in a moment.", 4000);
  }
}

function closePop(){ document.querySelectorAll(".pop").forEach(p=>p.remove()); }
function openPop(el){
  closePop();
  const kind = el.dataset.kind, id = el.dataset.id;
  const opts = kind==="item" ? DELIVERABLE_STATUSES : CLIENT_STATUSES;
  const pop = document.createElement("div"); pop.className = "pop";
  pop.innerHTML = `<div class="hd">Set status</div>` + opts.map(s=>`<button type="button" data-s="${s}">${chip(s)}</button>`).join("");
  document.body.appendChild(pop);
  const r = el.getBoundingClientRect();
  const top = r.bottom + window.scrollY + 6;
  let left = r.left + window.scrollX;
  const w = pop.offsetWidth || 200;
  if (left + w > window.innerWidth - 12) left = Math.max(12, window.innerWidth - w - 12);
  pop.style.top = top + "px"; pop.style.left = left + "px";
  pop.querySelectorAll("button").forEach(b=>b.addEventListener("click", ()=>{ closePop(); setStatus(kind, id, b.dataset.s); }));
  pop.querySelector("button").focus();
}
document.addEventListener("click", e => {
  const c = e.target.closest(".chip.editable");
  if (c){ e.preventDefault(); openPop(c); return; }
  if (!e.target.closest(".pop")) closePop();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closePop();
  if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("editable")){ e.preventDefault(); openPop(e.target); }
});

// ---------- BOOT ----------
render();
(async () => {
  if (!window.claude || !window.claude.use) return;
  const [art, user] = await Promise.all([claude.use("artifact"), claude.use("user")]);
  if (!art) return;
  let can = true;
  if (user){
    const me = await user.me();
    can = me.canEdit || me.isOwner;
    ROLE = me.isOwner ? "Brave New" : "Client team";
  }
  if (!can) return;
  ART = art; EDITABLE = true; render();
})();
