import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { Building2, CreditCard, Gauge, HandHeart, History, Lock, RotateCcw, Search, Settings, UserCog, Users, Zap } from "lucide-react";

/*
 * YMAU VI registration desk (Secretariat side), rebuilt from the real desk:
 * app/(platform)/desk, desk.css and platform.css tokens, lib/desk-key.ts chip
 * words, lib/capacity.ts (the capacity lock) and lib/rubric.ts. Every person,
 * school, count and amount below is invented.
 */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// platform.css tokens
const C = {
  ground: "#f6f7f9", surface: "#ffffff", border: "#e4e7ec", border2: "#d0d5dd", navy: "#061a37",
  ink900: "#101828", ink700: "#344054", ink600: "#475467", ink500: "#667085", ink400: "#98a2b3",
  wine: "#611116", gold: "#cf854c", cobalt: "#1d4fd7",
};
const FONT = "Poppins, Inter, system-ui, sans-serif";
const WORDMARK = "Anton, Impact, 'Arial Narrow', sans-serif";

const TONES = {
  neutral: ["#eef1f5", "#475467"], blue: ["#e8efff", "#1d4fd7"], amber: ["#fff4e6", "#b54708"],
  green: ["#e0f5ea", "#067647"], violet: ["#f1ebfe", "#6941c6"], gold: ["#fff3c4", "#745400"], wine: ["#fdebec", "#8c1823"],
};
const GHOST = { neutral: "rgba(63,74,92,.32)", violet: "rgba(105,65,198,.32)", gold: "rgba(116,84,0,.38)", wine: "rgba(122,28,34,.32)" };

// lib/desk-key.ts: label, tone, ghost, pause
const REG = { draft: ["Not submitted", "neutral", true], submitted: ["Submitted", "blue"], complete: ["Registered", "green"] };
const AID = { under_review: ["Under review", "amber"], secondary_review: ["Second review", "violet"], awarded: ["Awarded", "green"] };
const FEE = {
  due: ["Unpaid", "amber"], paid: ["Paid", "green"], manual: ["Paid offline", "green"],
  waived: ["Waived", "violet", true], on_hold: ["Waiting on aid", "neutral", false, true],
};
const FEE_WORD = { due: "unpaid", paid: "paid", manual: "paid offline", waived: "waived", on_hold: "waiting on aid" };

/* ---------- invented data ---------- */

const ME = { name: "Amara Osei", role: "officer", email: "amara@ymau.example" };
const PAYER = "n.okonkwo@mail.example";
const GROUP = ["d1", "d2", "d3"]; // one delegation paying together in one Stripe checkout

const DELEGATES = [
  { id: "d1", name: "Nadia Okonkwo", ref: "YMAU-2027-4821", email: PAYER, age: 17, country: "Nigeria", city: "Enugu", group: "Harmattan College", status: "submitted", aid: null, fee: "due", cents: 8500, docs: [], when: "2h ago" },
  { id: "d2", name: "Tobi Adeyemi", ref: "YMAU-2027-6390", email: "tobi.a@mail.example", age: 18, country: "Nigeria", city: "Ibadan", group: "Harmattan College", status: "submitted", aid: null, fee: "due", cents: 8500, docs: [], when: "3h ago" },
  { id: "d3", name: "Ifeoma Chukwu", ref: "YMAU-2027-2157", email: "ife.c@mail.example", age: 17, country: "Nigeria", city: "Enugu", group: "Harmattan College", status: "submitted", aid: null, fee: "due", cents: 8500, docs: [], when: "3h ago" },
  { id: "d4", name: "Wanjiru Kamau", ref: "YMAU-2027-7012", email: "wanjiru.k@mail.example", age: 20, country: "Kenya", city: "Nakuru", group: "Ridgeview Academy", status: "submitted", aid: "under_review", fee: "on_hold", cents: 8500, docs: [], when: "5h ago" },
  { id: "d5", name: "Lindiwe Mthembu", ref: "YMAU-2027-3348", email: "lindiwe.m@mail.example", age: 21, country: "South Africa", city: "Durban", group: null, status: "submitted", aid: null, fee: "due", cents: 8500, docs: [], when: "Yesterday", attempt: "Tried on 24 Oct · card declined by the bank" },
  { id: "d6", name: "Yohannes Girma", ref: "YMAU-2027-9904", email: "yohannes.g@mail.example", age: 22, country: "Ethiopia", city: "Adama", group: null, status: "complete", aid: null, fee: "paid", cents: 7000, docs: [], when: "Yesterday" },
  { id: "d7", name: "Aline Uwase", ref: "YMAU-2027-1586", email: "aline.u@mail.example", age: 16, country: "Rwanda", city: "Huye", group: "Kigali Hills School", status: "submitted", aid: null, fee: "due", cents: 8500, docs: ["Parental consent form"], when: "Yesterday" },
  { id: "d8", name: "Karim Benali", ref: "YMAU-2027-5263", email: "karim.b@mail.example", age: 23, country: "Morocco", city: "Fes", group: null, status: "complete", aid: null, fee: "manual", cents: 7000, docs: [], when: "21 Oct", note: "Bank transfer received" },
  { id: "d9", name: "Mamadou Diallo", ref: "YMAU-2027-8475", email: "mamadou.d@mail.example", age: 19, country: "Senegal", city: "Thiès", group: null, status: "draft", aid: null, fee: null, cents: null, docs: [], when: "20 Oct" },
];

const DELEGATIONS = [
  { id: "g1", name: "Harmattan College", code: "HC-7QK", advisor: "Chidi Eze", mail: "c.eze@harmattan.example", joined: 3, expected: 4, submitted: 3, created: "12 Oct", members: ["d1", "d2", "d3"] },
  { id: "g2", name: "Ridgeview Academy", code: "RA-M2P", advisor: "Grace Njeri", mail: "g.njeri@ridgeview.example", joined: 11, expected: 12, submitted: 8, created: "9 Oct", members: ["d4"] },
  { id: "g3", name: "Kigali Hills School", code: "KHS-4TD", advisor: "Eric Habimana", mail: "e.habimana@kigalihills.example", joined: 9, expected: 10, submitted: 6, created: "8 Oct", members: ["d7"] },
  { id: "g4", name: "Atlas Lycée", code: "AL-9XV", advisor: "Salma Idrissi", mail: "s.idrissi@atlas.example", joined: 8, expected: 8, submitted: 8, created: "6 Oct" },
  { id: "g5", name: "Sahel Scholars Network", code: "SSN-3HW", advisor: "Ousmane Faye", mail: "o.faye@sahel.example", joined: 7, expected: 15, submitted: 4, created: "15 Oct" },
  { id: "g6", name: "Cape Lakes Debating Union", code: "CLD-6RB", advisor: "Thandeka Zulu", mail: "t.zulu@capelakes.example", joined: 6, expected: 6, submitted: 5, created: "2 Oct" },
  { id: "g7", name: "Nile Valley Model AU Club", code: "NVM-8CJ", advisor: "Hany Mostafa", mail: "h.mostafa@nilevalley.example", joined: 5, expected: 9, submitted: 2, created: "17 Oct" },
];

const AID_QUEUE = [
  { id: "a1", name: "Achieng Otieno", inst: "Lakeside Girls High", country: "Kenya", req: "Full package", sub: "Priority window · sent 2d ago · region East Africa", rev: "1 of 2 scored", who: "Assigned: amara, kwame", status: "under_review" },
  { id: "a2", name: "Fatou Sarr", inst: "Sahel Scholars Network", country: "Senegal", req: "Accommodation", sub: "Priority window · sent 3d ago · region West Africa", rev: "0 of 2 scored", who: "Assigned: amara, zola", status: "under_review" },
  { id: "a3", name: "Bereket Alemu", inst: "Individual", country: "Ethiopia", req: "Fee waiver", sub: "Priority window · sent 4d ago · region Addis-based", rev: "1 of 2 scored", who: "Assigned: amara", status: "under_review" },
  { id: "a4", name: "Kudzai Moyo", inst: "Cape Lakes Debating Union", country: "Zimbabwe", req: "Full package", sub: "Priority window · sent 5d ago · region Central / South Africa", rev: "2 of 2 scored", who: "Assigned: kwame, zola", status: "secondary_review" },
  { id: "a5", name: "Youssef Amrani", inst: "Atlas Lycée", country: "Morocco", req: "Accommodation", sub: "Priority window · sent 6d ago · region North Africa", rev: "0 of 2 scored", who: "No one assigned", status: "under_review" },
];

// lib/rubric.ts: the full-package rubric (scored /100)
const RUBRIC = [
  { key: "fn", label: "Financial need", points: 40, low: "Low documented need", high: "High documented need" },
  { key: "em", label: "Engagement & merit", points: 25, low: "Low engagement/merit signal", high: "High engagement/merit signal" },
  { key: "rc", label: "Regional cost-efficiency", points: 15, low: "Low cost-efficiency", high: "High cost-efficiency" },
  { key: "cf", label: "Completeness & feasibility", points: 20, low: "Low completeness/feasibility", high: "High completeness/feasibility" },
];
const SCRIPTED = { fn: 5, em: 4, rc: 4, cf: 4 };
const OTHER = { reviewer: "kwame@ymau.example", total: 82, notes: "Strong statement; school letter confirms no sponsorship." };
const total = (s) => (RUBRIC.every((c) => s[c.key]) ? Math.round(RUBRIC.reduce((t, c) => t + (s[c.key] / 5) * c.points, 0) * 10) / 10 : null);

// Audit lines use the desk's own sentences (settings/audit/page.tsx).
const SEED_AUDIT = [
  { who: "kwame@ymau.example", what: "assigned Achieng Otieno’s aid application to amara@ymau.example", when: "2h ago" },
  { who: "stripe", what: "capacity · checkout paid", when: "3h ago" },
  { who: "amara@ymau.example", what: "changed Karim Benali’s fee from unpaid to paid offline: “Bank transfer received”", when: "Yesterday" },
  { who: "zola@ymau.example", what: "signed off Tendai Moyo’s aid decision: awarded (fee waiver)", when: "Yesterday" },
  { who: "amara@ymau.example", what: "flagged Kudzai Moyo for a second review", when: "Yesterday" },
  { who: "stripe", what: "capacity · checkout expired", when: "22 Oct" },
  { who: "zola@ymau.example", what: "changed kwame@ymau.example’s role from viewer to officer", when: "22 Oct" },
  { who: "kwame@ymau.example", what: "assigned every open application from East Africa to amara@ymau.example (14 added)", when: "21 Oct" },
];

const money = (cents) => `$${(cents / 100).toLocaleString("en-US")}`;
const fmt = (n) => n.toLocaleString("en-US");

// A delegate row as the desk shows it right now: the shared checkout and any
// offline overrides are layered over the invented base row.
function rowOf(d, s) {
  const r = { ...d };
  if (GROUP.includes(d.id)) {
    if (s.paid) Object.assign(r, { status: "complete", fee: "paid", when: "just now" });
    else if (s.reserved) Object.assign(r, { attempt: "Opened the payment page, did not finish", when: "just now" });
  }
  const o = s.fees[d.id];
  if (o) Object.assign(r, { fee: o, status: o === "due" ? "submitted" : "complete", when: "just now", note: o === "manual" ? "Bank transfer received" : o === "waived" ? "Sponsor covered the fee" : null });
  return r;
}

/* ---------- small desk parts ---------- */

function Chip({ tone = "neutral", ghost, pause, dot, children }) {
  const [bg, fg] = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-[6px] whitespace-nowrap rounded-[4px] px-[9px] py-[1px] text-[11.5px] font-medium leading-[1.6]"
      style={ghost ? { color: fg, border: `1px solid ${GHOST[tone] ?? fg}` } : { background: bg, color: fg }}
    >
      {pause && <i className="h-[6px] w-[6px] rounded-full" style={{ border: "1.5px solid currentColor" }} />}
      {dot && <i className="h-[6px] w-[6px] rounded-full bg-current" />}
      {children}
    </span>
  );
}
const Dash = () => <span style={{ color: C.ink500 }}>–</span>;
function Keyed({ map, k }) {
  if (!k || !map[k]) return <Dash />;
  const [label, tone, ghost, pause] = map[k];
  return <Chip tone={tone} ghost={ghost} pause={pause}>{label}</Chip>;
}

const AV = [TONES.wine, TONES.blue, TONES.amber, TONES.violet, TONES.green];
function Avatar({ name, size = 26 }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const [bg, fg] = AV[h % 5];
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="grid flex-none place-items-center rounded-full font-semibold" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.42 }}>
      {initials}
    </span>
  );
}

function Who({ name, sub, hot }) {
  return (
    <span className="flex min-w-0 items-center gap-[10px]">
      <Avatar name={name} />
      <span className="min-w-0">
        <b className="block truncate font-medium leading-[1.3]" style={{ color: hot ? C.wine : C.navy, textDecoration: hot ? "underline" : "none", textUnderlineOffset: 3 }}>{name}</b>
        <small className="block truncate text-[11.5px]" style={{ color: C.ink500 }}>{sub}</small>
      </span>
    </span>
  );
}

function FeeCell({ r }) {
  const chip = <Keyed map={FEE} k={r.fee} />;
  if (r.fee !== "due" || !r.attempt) return chip;
  return (
    <span className="grid gap-[1px] leading-[1.35]">
      <span className="justify-self-start">{chip}</span>
      <small className="truncate text-[10.5px]" style={{ color: C.ink500 }}>{r.attempt}</small>
    </span>
  );
}

function Card({ title, aside, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-[6px] border ${className}`} style={{ background: C.surface, borderColor: C.border }}>
      {title && (
        <div className="flex items-baseline justify-between border-b px-[16px] py-[11px]" style={{ borderColor: C.border }}>
          <h2 className="m-0 text-[14px] font-semibold" style={{ color: C.navy }}>{title}</h2>
          {aside && <small className="text-[11.5px]" style={{ color: C.ink400 }}>{aside}</small>}
        </div>
      )}
      {children}
    </section>
  );
}

function PageHead({ title, sub, right }) {
  return (
    <header className="flex items-end justify-between gap-[16px] pb-[14px]">
      <div className="min-w-0">
        <h1 className="m-0 text-[18px] font-semibold leading-[1.2]" style={{ color: C.navy }}>{title}</h1>
        <p className="m-0 mt-[3px] text-[12px]" style={{ color: C.ink500 }}>{sub}</p>
      </div>
      {right}
    </header>
  );
}

function Views({ items, current }) {
  return (
    <nav className="mb-[10px] flex flex-wrap items-center gap-[2px]">
      {items.map(([label, ct]) => {
        const on = label === current;
        return (
          <span
            key={label}
            className="inline-flex h-[30px] items-center gap-[5px] whitespace-nowrap rounded-[4px] border px-[8px] text-[12px]"
            style={on ? { background: C.surface, borderColor: C.border2, color: C.navy, fontWeight: 600 } : { borderColor: "transparent", color: C.ink600, fontWeight: 500 }}
          >
            {label} {ct !== undefined && <span className="text-[11px]" style={{ color: C.ink400 }}>{ct}</span>}
          </span>
        );
      })}
    </nav>
  );
}

function SearchBox({ placeholder, hint }) {
  return (
    <div className="relative mb-[10px] flex h-[32px] items-center rounded-[6px] border pl-[32px] pr-[12px] text-[12.5px]" style={{ background: C.surface, borderColor: C.border2, color: C.ink400 }}>
      <Search size={14} className="absolute left-[10px]" />
      <span className="truncate">{placeholder}</span>
      {hint && <span className="ml-auto whitespace-nowrap pl-[12px] text-[11.5px]">{hint}</span>}
    </div>
  );
}

const TH = "whitespace-nowrap border-b px-[12px] py-[8px] text-left text-[11.5px] font-semibold";
const TD = "border-b px-[12px] py-[7px] align-middle";

function Btn({ children, sec, onClick, disabled, small }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-[6px] whitespace-nowrap rounded-[6px] border ${small ? "h-[28px] px-[10px] text-[12px]" : "h-[34px] px-[14px] text-[12.5px]"} ${disabled ? "cursor-default opacity-50" : "cursor-pointer"}`}
      style={sec ? { background: C.surface, color: C.navy, borderColor: C.border2, fontWeight: 500 } : { background: C.wine, color: "#fff", borderColor: "transparent", fontWeight: 600 }}
    >
      {children}
    </button>
  );
}

// The crest: a wine roundel of woven triangles with Africa in white.
function Crest({ size }) {
  const tri = [];
  const cols = ["#cf854c", "#d9562b", "#cbc8d4", "#8c1823", "#e6a04f"];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const x = 50 + Math.cos(a) * 34, y = 50 + Math.sin(a) * 34;
    const b = a + 0.9;
    tri.push(<polygon key={i} points={`${x},${y} ${50 + Math.cos(b) * 60},${50 + Math.sin(b) * 60} ${50 + Math.cos(a - 0.4) * 62},${50 + Math.sin(a - 0.4) * 62}`} fill={cols[i % 5]} opacity="0.85" />);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs><clipPath id="ymau-crest"><circle cx="50" cy="50" r="46" /></clipPath></defs>
      <g clipPath="url(#ymau-crest)">
        <rect width="100" height="100" fill="#611116" />
        {tri}
      </g>
      <path d="M38 22 L50 19 L57 23 L64 22 L68 29 L74 36 L82 39 L78 47 L72 53 L70 61 L64 70 L60 79 L54 84 L49 81 L47 72 L45 63 L41 57 L34 55 L26 50 L21 42 L24 33 L30 26 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="0.8" />
      <ellipse cx="73" cy="71" rx="2.2" ry="5" fill="#fff" transform="rotate(20 73 71)" />
    </svg>
  );
}

/* ---------- sidebar (layout.tsx + desk-nav.tsx) ---------- */

function Sidebar({ page, onNav, compact, aidCount }) {
  const nav = [
    ["overview", "Overview", Gauge],
    ["delegates", "Delegates", Users, "4,618"],
    ["delegations", "Delegations", Building2, "116"],
    ["aid", "Financial aid", HandHeart, aidCount],
    ["payments", "Payments", CreditCard],
  ];
  const settings = [
    ["fees", "Fees & deadlines", Settings],
    ["capacity", "Capacity & waitlist", Users],
    ["team", "Team & roles", UserCog],
    ["audit", "Audit log", History],
  ];
  const live = onNav ? new Set(["delegates", "delegations", "aid", "payments", "capacity", "audit"]) : new Set();
  const item = (entry) => {
    const [key, label, Icon, ct] = entry;
    const on = page === key;
    const can = live.has(key);
    return (
      <button
        key={key}
        type="button"
        disabled={!can}
        onClick={can ? () => onNav(key) : undefined}
        title={onNav && !can ? "Not part of this demo" : undefined}
        className={`flex w-full items-center rounded-[6px] text-left ${compact ? "h-[26px] gap-[6px] px-[6px] text-[10.5px]" : "h-[33px] gap-[8px] px-[9px] text-[12.5px]"} ${can ? "cursor-pointer hover:bg-white/[0.08]" : "cursor-default"}`}
        style={{ background: on ? "rgba(255,255,255,.14)" : undefined, color: on ? "#fff" : "rgba(255,255,255,.72)", fontWeight: on ? 600 : 500 }}
      >
        <Icon size={compact ? 14 : 17} strokeWidth={1.75} className="flex-none" />
        <span className="truncate">{label}</span>
        {ct && (
          <span className="ml-auto inline-grid h-[16px] min-w-[16px] place-items-center rounded-[10px] px-[5px] text-[10.5px] font-semibold" style={on ? { background: "#fff", color: C.navy } : { background: "rgba(255,255,255,.16)", color: "#fff" }}>
            {ct}
          </span>
        )}
      </button>
    );
  };
  return (
    <aside className="flex h-full flex-col" style={{ background: C.navy, padding: compact ? "14px 8px 10px" : "18px 10px 14px", borderRight: "1px solid rgba(255,255,255,.08)" }}>
      <div className="mb-[10px] border-b text-center" style={{ borderColor: "rgba(255,255,255,.12)", paddingBottom: compact ? 10 : 14 }}>
        <div className="flex justify-center"><Crest size={compact ? 34 : 46} /></div>
        <b className="mt-[6px] block uppercase tracking-[0.05em] text-white" style={{ fontFamily: WORDMARK, fontWeight: 400, fontSize: compact ? 13 : 15 }}>YMAU VI</b>
        <small className="mt-[3px] block font-semibold uppercase" style={{ color: C.gold, letterSpacing: "0.14em", fontSize: compact ? 8.5 : 10 }}>Addis Ababa · 2027</small>
        <span className="mt-[3px] block" style={{ color: "rgba(255,255,255,.55)", fontSize: compact ? 9 : 10.5 }}>Registration desk</span>
      </div>
      <nav className="flex flex-col gap-[2px]">
        {nav.map(item)}
        <div className="px-[9px] pb-[4px] font-semibold uppercase" style={{ color: "rgba(255,255,255,.45)", letterSpacing: "0.06em", fontSize: compact ? 9 : 10.5, paddingTop: compact ? 9 : 14 }}>Settings</div>
        {settings.map(item)}
      </nav>
      <div className="mt-auto flex items-center gap-[9px] border-t px-[6px] pt-[10px]" style={{ borderColor: "rgba(255,255,255,.12)" }}>
        <i className="grid flex-none place-items-center rounded-full font-semibold not-italic text-white" style={{ width: compact ? 24 : 30, height: compact ? 24 : 30, background: "rgba(255,255,255,.16)", fontSize: compact ? 10 : 12 }}>A</i>
        <span className="min-w-0">
          <b className="block truncate font-medium text-white" style={{ fontSize: compact ? 10.5 : 12 }}>{ME.name}</b>
          <em className="block not-italic capitalize" style={{ color: "rgba(255,255,255,.55)", fontSize: compact ? 9.5 : 11 }}>{ME.role}</em>
        </span>
      </div>
    </aside>
  );
}

/* ---------- pages ---------- */

function DelegatesPage({ rows, s, compact, onOpen }) {
  const counts = [["All", "4,618"], ["Registered", fmt(2187 + (s.paid ? 3 : 0))], ["Submitted, fee not settled", fmt(800 - (s.paid ? 3 : 0))], ["Not submitted", "1,631"], ["Missing documents", "214"], ["Under 18", "1,092"], ["Outside 16-25", "23"]];
  return (
    <>
      <PageHead title="Delegates" sub="4,618 shown · latest activity first" right={!compact && <Btn sec small>Export CSV</Btn>} />
      <Views items={compact ? counts.slice(0, 4) : counts} current="All" />
      <SearchBox placeholder="Search name, email, school, country or reference…" hint={compact ? null : "↑↓ move · space select · enter open"} />
      <Card>
        <table className="w-full table-fixed border-collapse text-[12px]" style={{ color: C.ink700 }}>
          <colgroup>
            {!compact && <col style={{ width: 34 }} />}
            <col />
            <col style={{ width: 100 }} />
            {!compact && <col style={{ width: 100 }} />}
            <col style={{ width: compact ? 150 : 166 }} />
            {!compact && <col style={{ width: 140 }} />}
            <col style={{ width: 90 }} />
          </colgroup>
          <thead style={{ color: C.ink600 }}>
            <tr style={{ borderColor: C.border }}>
              {!compact && <th className={TH} style={{ borderColor: C.border }}><span className="block h-[13px] w-[13px] rounded-[3px] border" style={{ borderColor: C.border2 }} /></th>}
              <th className={TH} style={{ borderColor: C.border }}>Delegate</th>
              <th className={TH} style={{ borderColor: C.border }}>Registration</th>
              {!compact && <th className={TH} style={{ borderColor: C.border }}>Financial aid</th>}
              <th className={TH} style={{ borderColor: C.border }}>Fee</th>
              {!compact && <th className={TH} style={{ borderColor: C.border }}>Missing documents</th>}
              <th className={`${TH} text-right`} style={{ borderColor: C.border }}>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const glow = s.flash && GROUP.includes(r.id);
              return (
                <tr
                  key={r.id}
                  onClick={onOpen ? () => onOpen(r.id) : undefined}
                  className={onOpen ? "cursor-pointer hover:bg-[#f6f7f9]" : ""}
                  style={{ background: glow ? "#eefaf3" : s.open === r.id ? "#f6f7f9" : undefined, transition: "background .5s" }}
                >
                  {!compact && <td className={TD} style={{ borderColor: C.ground }}><span className="block h-[13px] w-[13px] rounded-[3px] border" style={{ borderColor: C.border2 }} /></td>}
                  <td className={TD} style={{ borderColor: C.ground, height: 42 }}>
                    <Who name={r.name} hot={s.hover === r.id} sub={[`age ${r.age}`, r.country, r.group ? `${r.group} delegation` : "Individual"].join(" · ")} />
                  </td>
                  <td className={TD} style={{ borderColor: C.ground }}><Keyed map={REG} k={r.status} /></td>
                  {!compact && <td className={TD} style={{ borderColor: C.ground }}><Keyed map={AID} k={r.aid} /></td>}
                  <td className={`${TD} overflow-hidden`} style={{ borderColor: C.ground }}><FeeCell r={r} /></td>
                  {!compact && (
                    <td className={TD} style={{ borderColor: C.ground }}>
                      {r.docs.length ? <span className="text-[11.5px] font-medium" style={{ color: TONES.wine[1] }}>{r.docs[0]}</span> : <Dash />}
                    </td>
                  )}
                  <td className={`${TD} text-right text-[11.5px]`} style={{ borderColor: C.ground, color: r.when === "just now" ? C.navy : C.ink500, fontWeight: r.when === "just now" ? 500 : 400 }}>{r.when}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!compact && <div className="border-t px-[16px] py-[9px] text-[12px] font-medium" style={{ borderColor: C.border, color: C.ink600 }}>What the statuses mean</div>}
      </Card>
    </>
  );
}

// Capacity & waitlist (settings/capacity + fees/capacity-panel.tsx)
function CapacityPage({ s, compact }) {
  const held = s.reserved && !s.paid ? 3 : 0;
  const paid = 2046 + (s.paid ? 3 : 0);
  const reserved = 2 + held;
  const rows = [
    ...(held ? GROUP.map((id) => DELEGATES.find((d) => d.id === id)) : []),
    { id: "x1", name: "Samuel Boateng", ref: "YMAU-2027-3071", group: null },
    { id: "x2", name: "Hawa Kamara", ref: "YMAU-2027-6614", group: "Sahel Scholars Network" },
  ];
  const kpi = (label, value, when, hot) => (
    <div className="min-w-0 rounded-[6px] border px-[12px] py-[10px]" style={{ borderColor: hot ? "#b9c8f3" : C.border, background: hot ? "#f7f9ff" : C.surface, transition: "all .4s" }}>
      <small className="block text-[10px] font-medium uppercase leading-[1.3] tracking-[0.05em]" style={{ color: C.ink500 }}>{label}</small>
      <b className="my-[3px] block text-[22px] font-semibold leading-[1.2]" style={{ color: C.navy }}>{value}</b>
      {when && <span className="block truncate text-[11px]" style={{ color: C.ink500 }}>{when}</span>}
    </div>
  );
  return (
    <>
      <PageHead title="Capacity & Waitlist" sub="Paid-delegate places and registration waitlist" />
      <div className="grid gap-[12px]">
        <Card>
          <div className="flex items-baseline justify-between border-b px-[16px] py-[11px]" style={{ borderColor: C.border }}>
            <h2 className="m-0 text-[14px] font-semibold" style={{ color: C.navy }}>Paid-place capacity</h2>
            <Chip tone="green" dot>Registration open</Chip>
          </div>
          {!compact && (
            <p className="m-0 px-[16px] pb-[2px] pt-[10px] text-[12px]" style={{ color: C.ink500 }}>
              Paid registrations include online and offline payments. Fee waivers do not use paid places; applicants are added to the waitlist automatically when the cap is reached.
            </p>
          )}
          <div className={`grid gap-[10px] p-[14px] ${compact ? "grid-cols-4" : "grid-cols-5"}`}>
            {kpi("Paid delegates", fmt(paid), null, s.flash)}
            {kpi("Reserved places", reserved, `${reserved} in checkout · 0 offered`, held > 0)}
            {kpi("Available places", fmt(2600 - paid - reserved), null, held > 0)}
            {!compact && kpi("Waiting", 0)}
            {kpi("Paid-delegate cap", "2,600")}
          </div>
        </Card>
        <Card title="Registration waitlist & reservations" aside={`0 waiting · ${reserved} reserved`}>
          <table className="w-full border-collapse text-[12px]" style={{ color: C.ink700 }}>
            <thead style={{ color: C.ink600 }}>
              <tr>
                <th className={TH} style={{ borderColor: C.border }}>Delegate</th>
                <th className={TH} style={{ borderColor: C.border }}>Delegation</th>
                {!compact && <th className={TH} style={{ borderColor: C.border }}>Joined (EAT)</th>}
                <th className={TH} style={{ borderColor: C.border }}>Status</th>
                <th className={TH} style={{ borderColor: C.border }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ background: held && GROUP.includes(r.id) ? "#f7f9ff" : undefined }}>
                  <td className={TD} style={{ borderColor: C.ground, height: 40 }}>
                    <b className="block font-medium" style={{ color: C.navy }}>{r.name}</b>
                    <small className="block text-[11px]" style={{ color: C.ink500 }}>{r.ref}</small>
                  </td>
                  <td className={TD} style={{ borderColor: C.ground }}>{r.group ?? "Individual"}</td>
                  {!compact && <td className={TD} style={{ borderColor: C.ground }}>{GROUP.includes(r.id) ? "26 Oct 2026, 14:02" : "26 Oct 2026, 13:41"}</td>}
                  <td className={TD} style={{ borderColor: C.ground }}><Chip tone="blue">Checkout in progress</Chip></td>
                  <td className={TD} style={{ borderColor: C.ground }}><Dash /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {!compact && (
          <p className="m-0 text-[11.5px] leading-[1.55]" style={{ color: C.ink500 }}>
            Every checkout, payment and aid decision takes one capacity lock first, so two people can never be sold the last place. A place held for a checkout is released only on Stripe&rsquo;s word, never on our clock.
          </p>
        )}
      </div>
    </>
  );
}

function DelegationsPage({ s, act }) {
  const rows = DELEGATES.reduce((m, d) => m.set(d.id, rowOf(d, s)), new Map());
  return (
    <>
      <PageHead title="Delegations" sub="Each school or group registering together: how many delegates it expects, how many have joined with its code, and how many have submitted. Click a delegation to see its members." />
      <Card>
        <table className="w-full border-collapse text-[12px]" style={{ color: C.ink700 }}>
          <thead style={{ color: C.ink600 }}>
            <tr>
              {["Institution", "Code", "Advisor"].map((h) => <th key={h} className={TH} style={{ borderColor: C.border }}>{h}</th>)}
              {["Joined", "Submitted", "Created"].map((h) => <th key={h} className={`${TH} text-right`} style={{ borderColor: C.border }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {DELEGATIONS.flatMap((g) => {
              const open = s.expanded === g.id;
              const out = [
                <tr key={g.id} onClick={() => act({ type: "expand", id: open ? null : g.id })} className="cursor-pointer hover:bg-[#f6f7f9]" style={{ background: open ? "#f6f7f9" : undefined }}>
                  <td className={TD} style={{ borderColor: C.ground, height: 42 }}>
                    <b className="block font-medium" style={{ color: C.navy }}>{g.name}</b>
                    <small className="block text-[11px]" style={{ color: C.ink500 }}>{open ? "Hide members" : `Show ${g.joined} members`}</small>
                  </td>
                  <td className={TD} style={{ borderColor: C.ground, letterSpacing: "0.04em" }}>{g.code}</td>
                  <td className={TD} style={{ borderColor: C.ground }}>
                    {g.advisor}
                    <span className="block text-[11px]" style={{ color: C.wine }}>{g.mail}</span>
                  </td>
                  <td className={`${TD} text-right`} style={{ borderColor: C.ground }}>
                    <b className="font-semibold" style={{ color: C.navy }}>{g.joined}</b> <span className="text-[11px]" style={{ color: C.ink500 }}>of {g.expected} expected</span>
                  </td>
                  <td className={`${TD} text-right`} style={{ borderColor: C.ground }}>{g.submitted}</td>
                  <td className={`${TD} text-right text-[11.5px]`} style={{ borderColor: C.ground, color: C.ink500 }}>{g.created}</td>
                </tr>,
              ];
              if (open) {
                const people = (g.members ?? []).map((id) => rows.get(id));
                out.push(
                  <tr key={`${g.id}-m`}>
                    <td colSpan={6} className="pb-[8px] pl-[26px] pr-0" style={{ background: "#f6f7f9" }}>
                      <div className="overflow-hidden rounded-[6px] border" style={{ background: C.surface, borderColor: C.border }}>
                        {people.length ? people.map((p) => (
                          <div key={p.id} onClick={() => act({ type: "open", id: p.id })} className="grid cursor-pointer grid-cols-[1fr_110px_150px_80px] items-center gap-[10px] border-b px-[12px] py-[6px] last:border-b-0 hover:bg-[#f6f7f9]" style={{ borderColor: C.ground }}>
                            <Who name={p.name} sub={`age ${p.age} · ${p.country}`} />
                            <Keyed map={REG} k={p.status} />
                            <Keyed map={FEE} k={p.fee} />
                            <span className="text-right text-[11.5px]" style={{ color: C.ink500 }}>{p.when}</span>
                          </div>
                        )) : <p className="m-0 px-[12px] py-[10px] text-[12px]" style={{ color: C.ink500 }}>Members are listed here in the real desk; this demo keeps a few delegations short.</p>}
                      </div>
                    </td>
                  </tr>,
                );
              }
              return out;
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function PaymentsPage({ s, act, rows }) {
  const ledger = rows.filter((r) => r.fee);
  return (
    <>
      <PageHead title="Payments" sub="Every registration fee: who has paid, who owes, and who is waiting on an aid decision." />
      <dl className="m-0 mb-[12px] grid grid-cols-4 overflow-hidden rounded-[6px] border" style={{ background: C.surface, borderColor: C.border }}>
        {[
          ["Collected", s.paid ? "$154,125" : "$153,870"],
          ["Outstanding", s.paid ? "$40,705" : "$40,960", `${s.paid ? 509 : 512} unpaid · 61 tried and failed · ${s.paid ? 94 : 97} opened the page · 354 not tried`],
          ["Waiting on aid", "288", "Fee paused until aid is decided"],
          ["Waived", "141"],
        ].map(([k, v, sm], i) => (
          <div key={k} className="min-w-0 px-[14px] py-[10px]" style={{ borderLeft: i ? `1px solid ${C.ground}` : 0 }}>
            <dt className="text-[11.5px]" style={{ color: C.ink500 }}>{k}</dt>
            <dd className="m-0 mt-[1px] text-[19px] font-semibold" style={{ color: C.navy }}>{v}</dd>
            {sm && <small className="block text-[10.5px] leading-[1.4]" style={{ color: C.ink500 }}>{sm}</small>}
          </div>
        ))}
      </dl>
      <Views items={[["All", "2,987"], ["Needs a look", "3"], ["Unpaid", s.paid ? "509" : "512"], ["Tried, failed", "61"], ["Not tried", "354"], ["Waiting on aid", "288"], ["Paid", s.paid ? "2,049" : "2,046"], ["Waived", "141"]]} current="All" />
      <Card>
        <table className="w-full border-collapse text-[12px]" style={{ color: C.ink700 }}>
          <thead style={{ color: C.ink600 }}>
            <tr>
              <th className={TH} style={{ borderColor: C.border }}>Delegate</th>
              <th className={`${TH} text-right`} style={{ borderColor: C.border }}>Amount</th>
              <th className={TH} style={{ borderColor: C.border }}>Fee</th>
              <th className={TH} style={{ borderColor: C.border }}>Note</th>
              <th className={TH} style={{ borderColor: C.border }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((r) => {
              const prompt = s.payPrompt?.id === r.id ? s.payPrompt.mode : null;
              const undo = s.undo[r.id];
              const stripePaid = r.fee === "paid";
              return (
                <tr key={r.id} onClick={() => act({ type: "open", id: r.id })} className="cursor-pointer hover:bg-[#f6f7f9]">
                  <td className={TD} style={{ borderColor: C.ground, height: 44, width: 200 }}><Who name={r.name} sub={r.ref} /></td>
                  <td className={`${TD} text-right`} style={{ borderColor: C.ground }}>{money(r.cents)}</td>
                  <td className={TD} style={{ borderColor: C.ground }}><FeeCell r={r} /></td>
                  <td className={`${TD} text-[11.5px]`} style={{ borderColor: C.ground, maxWidth: 150 }}>
                    {r.note ? <span className="grid leading-[1.35]">{r.note}<small style={{ color: C.ink500 }}>{s.fees[r.id] ? ME.email : "amara@ymau.example"}</small></span> : <Dash />}
                  </td>
                  <td className={TD} style={{ borderColor: C.ground, cursor: "default" }} onClick={(e) => e.stopPropagation()}>
                    <span className="inline-flex flex-wrap items-center gap-[6px]">
                      {prompt ? (
                        <>
                          <span className="text-[12px]" style={{ color: C.ink600 }}>{prompt === "manual" ? "Paid offline · why?" : "Waive this fee · why?"}</span>
                          <span className="inline-flex h-[28px] w-[140px] items-center truncate rounded-[6px] border px-[8px] text-[11.5px]" style={{ borderColor: C.border2, color: C.ink900 }}>
                            {prompt === "manual" ? "Bank transfer received" : "Sponsor covered the fee"}
                          </span>
                          <Btn small onClick={() => act({ type: "payConfirm" })}>Confirm</Btn>
                          <Btn small sec onClick={() => act({ type: "payPrompt", id: null })}>Cancel</Btn>
                        </>
                      ) : stripePaid ? (
                        <span className="text-[11.5px]" style={{ color: C.ink500 }}>Paid through Stripe</span>
                      ) : (
                        <>
                          {undo && (
                            <>
                              <span className="text-[12px]" style={{ color: C.ink600 }}>{undo.did === "manual" ? "Marked paid" : "Waived"} just now ·</span>
                              <Btn small sec onClick={() => act({ type: "payUndo", id: r.id })}>Undo</Btn>
                            </>
                          )}
                          {!undo && r.fee !== "manual" && <Btn small sec onClick={() => act({ type: "payPrompt", id: r.id, mode: "manual" })}>Mark paid</Btn>}
                          {!undo && r.fee !== "waived" && r.fee !== "manual" && <Btn small sec onClick={() => act({ type: "payPrompt", id: r.id, mode: "waived" })}>Waive</Btn>}
                          {!undo && r.fee === "manual" && <span className="text-[11.5px]" style={{ color: C.ink500 }}>Offline payment on file</span>}
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function AidQueuePage({ act }) {
  return (
    <>
      <PageHead
        title="Financial aid"
        sub="Applications waiting for your score. Open one to read it, score it on the rubric, and move to the next."
        right={<Btn small>Assign reviewers</Btn>}
      />
      <Views items={[["To score", 41], ["Scored by me", 18], ["Second review", 6], ["AI concerns", 2], ["Awaiting sign-off", 9], ["Decided", 154], ["Rankings", 230]]} current="To score" />
      <p className="m-0 mb-[10px] text-[12px]" style={{ color: C.ink600 }}>
        7 open applications have no reviewer assigned. <span className="font-medium" style={{ color: C.wine }}>Assign reviewers</span>
      </p>
      <Card>
        <table className="w-full border-collapse text-[12px]" style={{ color: C.ink700 }}>
          <thead style={{ color: C.ink600 }}>
            <tr>{["Applicant", "Requested", "Reviewers", "Status"].map((h) => <th key={h} className={TH} style={{ borderColor: C.border }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {AID_QUEUE.map((r) => (
              <tr key={r.id} onClick={r.id === "a1" ? () => act({ type: "openReview" }) : undefined} className={r.id === "a1" ? "cursor-pointer hover:bg-[#f6f7f9]" : ""} title={r.id === "a1" ? undefined : "Open the first one in this demo"}>
                <td className={TD} style={{ borderColor: C.ground, height: 44 }}><Who name={r.name} sub={`${r.inst} · ${r.country}`} /></td>
                <td className={TD} style={{ borderColor: C.ground }}>
                  <span className="grid leading-[1.35]">{r.req}<small className="text-[10.5px]" style={{ color: C.ink500 }}>{r.sub}</small></span>
                </td>
                <td className={TD} style={{ borderColor: C.ground }}>
                  <span className="grid leading-[1.35]">{r.rev}<small className="text-[10.5px]" style={{ color: C.ink500 }}>{r.who}</small></span>
                </td>
                <td className={TD} style={{ borderColor: C.ground }}><Keyed map={AID} k={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// Rubric card (aid/[id]/rubric-panel.tsx): other reviewers' numbers exist for
// you only once your own score is saved.
function Rubric({ s, act, compact }) {
  const mine = total(s.scores);
  const pod = s.saved && mine !== null ? Math.round(((mine + OTHER.total) / 2) * 10) / 10 : null;
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] ${compact ? "gap-[6px] px-[12px] py-[10px]" : "gap-[9px] px-[14px] py-[12px]"}`}>
      {RUBRIC.map((c, i) => {
        const focused = !s.saved && RUBRIC.findIndex((x) => !s.scores[x.key]) === i && Object.keys(s.scores).length > 0;
        return (
          <div key={c.key} className={`rounded-[6px] border ${compact ? "grid grid-cols-[104px_1fr] items-center gap-[8px] px-[6px] py-[3px]" : "grid grid-cols-[minmax(0,1fr)] gap-[4px] px-[8px] py-[5px]"}`} style={focused ? { borderColor: C.cobalt, background: "#f7f9ff" } : { borderColor: "transparent" }}>
            <span className={`flex font-medium ${compact ? "flex-col text-[11px] leading-[1.25]" : "justify-between text-[12px]"}`} style={{ color: C.ink900 }}>
              {c.label} <small className="font-normal" style={{ color: C.ink400 }}>{c.points} pts</small>
            </span>
            <span className="flex gap-[5px]">
              {[1, 2, 3, 4, 5].map((n) => {
                const on = s.scores[c.key] === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={act ? () => act({ type: "score", key: c.key, n }) : undefined}
                    className={`flex-1 rounded-[4px] border text-[12px] font-medium ${act ? "cursor-pointer" : "cursor-default"} ${compact ? "h-[24px]" : "h-[28px]"}`}
                    style={on ? { background: C.navy, borderColor: C.navy, color: "#fff" } : { background: C.surface, borderColor: C.border2, color: C.ink700 }}
                  >
                    {n}
                  </button>
                );
              })}
            </span>
            {!compact && (
              <span className="flex justify-between gap-[10px] text-[10.5px]" style={{ color: C.ink500 }}>
                <em className="min-w-0 truncate not-italic">1 · {c.low}</em>
                <em className="min-w-0 truncate text-right not-italic">5 · {c.high}</em>
              </span>
            )}
          </div>
        );
      })}
      <div className={`border-t pt-[8px] text-[12px] ${compact ? "flex items-baseline gap-[8px]" : "grid gap-[2px]"}`} style={{ borderColor: C.border, color: C.ink600 }}>
        <span>Composite</span>
        <b className={`${compact ? "text-[18px]" : "text-[20px]"} leading-[1.2]`} style={{ color: C.navy }}>
          {mine ?? "–"} <em className="text-[13px] font-normal not-italic" style={{ color: C.ink400 }}>/ 100</em>
        </b>
        <span className="text-[11px]">
          {compact ? (pod !== null ? "pod average " : "") : "Full-package request · regional criterion counts"}
          {pod !== null && <>{compact ? "" : " · pod average "}<b style={{ color: C.navy }}>{pod}</b></>}
        </span>
      </div>
      {!compact && (
        <label className="grid gap-[3px] text-[11.5px] font-semibold" style={{ color: C.ink900 }}>
          Notes · internal
          <span className="block min-h-[38px] rounded-[6px] border px-[9px] py-[6px] text-[11.5px] font-normal" style={{ borderColor: C.border2, color: Object.keys(s.scores).length > 2 ? C.ink700 : C.ink400 }}>
            {Object.keys(s.scores).length > 2 ? "Costs check out for Kisumu to Addis." : "What the numbers can’t say."}
          </span>
        </label>
      )}
      <div className="flex items-center gap-[10px]">
        <Btn small={compact} disabled={mine === null || s.saved} onClick={act ? () => act({ type: "save" }) : undefined}>{s.saved ? "Saved" : "Save and next"}</Btn>
        <span className="text-[11.5px]" style={{ color: C.ink400 }}>{s.saved ? "Your score is saved · 2 reviewers in" : "You are reviewer 2"}</span>
      </div>
      <div className="grid gap-[4px] border-t pt-[8px]" style={{ borderColor: C.border }}>
        {s.saved ? (
          <div className="rounded-[6px] px-[8px] py-[5px] text-[11.5px]" style={{ color: C.ink600, background: "#f7f9ff" }}>
            <b className="font-medium" style={{ color: C.navy }}>{OTHER.reviewer}</b> · {OTHER.total} / 100
            {!compact && <span className="block" style={{ color: C.ink500 }}>{OTHER.notes}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-[7px] rounded-[6px] px-[8px] py-[5px] text-[11.5px]" style={{ color: C.ink500, background: C.ground }}>
            <Lock size={12} />
            <span>1 other score on file · hidden until yours is saved</span>
          </div>
        )}
      </div>
    </div>
  );
}

const ANSWERS = [
  ["Statement of need", "118 words", "My school cannot sponsor travel this year, and my family covers my fees on one income. I have saved for the registration fee from tutoring, but a flight from Kisumu is out of reach. A place in Addis would let me represent my club for the first time."],
  ["Which aspect of YMAU’s mission or community speaks to you most, and why?", null, "Hearing young people from every region argue the same resolution. Our club debates AU policy every week, but only with each other."],
  ["Alternative plan if not funded", "counts toward completeness & feasibility", "Travel by bus to Nairobi and apply for a partial fee waiver, joining committee sessions remotely if possible."],
];

function AidReviewPage({ s, act, compact }) {
  return (
    <>
      <PageHead
        title="Achieng Otieno"
        sub={compact ? "Lakeside Girls High · from Kisumu, Kenya · requested Full package" : "Lakeside Girls High · travelling from Kisumu, Kenya · East Africa band · priority review · requested Full package · 1 of 41 in your queue"}
        right={
          <span className="flex flex-none items-center gap-[8px]">
            {s.proposed && <Chip tone="blue">Awaiting sign-off</Chip>}
            <Chip tone="amber">Under review</Chip>
            {!compact && <Btn sec small onClick={act ? () => act({ type: "nav", page: "aid" }) : undefined}>Back to the queue</Btn>}
          </span>
        }
      />
      <div className={`grid items-start gap-[12px] ${compact ? "grid-cols-[1fr_292px]" : "grid-cols-[1fr_340px]"}`}>
        <div className="grid min-w-0 gap-[12px]">
          <Card title="Written answers">
            {ANSWERS.slice(0, compact ? 2 : 3).map(([q, small, a], i) => (
              <section key={q} className="px-[16px] py-[11px]" style={{ borderTop: i ? `1px solid ${C.ground}` : 0 }}>
                <h3 className="m-0 mb-[4px] text-[11.5px] font-semibold" style={{ color: C.ink900 }}>
                  {q} {small && !compact && <small className="ml-[5px] font-normal" style={{ color: C.ink400 }}>{small}</small>}
                </h3>
                <p className="m-0 text-[12px] leading-[1.65]" style={{ color: C.ink700 }}>{a}</p>
              </section>
            ))}
          </Card>
          {!compact && (
            <Card title="Documents" aside="open to read, nothing downloads">
              <div className="flex flex-wrap gap-[8px] px-[16px] py-[12px]">
                {["Transcript", "Letter of recommendation", "Signed code of conduct"].map((d) => <Btn key={d} sec small>{d}</Btn>)}
              </div>
            </Card>
          )}
          {!compact && (
            <Card title="Facts">
              <div className="grid grid-cols-2 gap-x-[30px] gap-y-[7px] px-[16px] py-[12px] text-[12px]">
                {[["Requested", "Full package"], ["Travelling from", "Kisumu, Kenya"], ["Their cost estimate", "$1,150"], ["Household size", "6"], ["School or employer funding", "No"], ["Prior YMAU aid", "No"], ["Passport", "Valid, or by Dec 2026"], ["Age at conference", "19"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-[10px] border-b pb-[6px]" style={{ borderColor: C.ground }}>
                    <span style={{ color: C.ink500 }}>{k}</span>
                    <b className="text-right font-medium" style={{ color: C.navy }}>{v}</b>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
        <div className="grid min-w-0 gap-[12px]">
          <Card title="Rubric" aside={compact ? null : "keys 1–5 · Enter saves"}>
            <Rubric s={s} act={act} compact={compact} />
          </Card>
          {!compact && <Decision s={s} act={act} />}
        </div>
      </div>
    </>
  );
}

// Decision card for an officer: a proposal moves nothing until a lead signs off.
function Decision({ s, act }) {
  return (
    <Card title="Decision" aside="proposal · core sec signs off">
      <div className="grid gap-[9px] px-[14px] py-[12px] text-[12px]">
        <p className="m-0" style={{ color: C.ink600 }}>Requested: <b style={{ color: C.navy }}>Full package · flight, visa, accommodation, fee</b></p>
        {s.proposed ? (
          <p className="m-0" style={{ color: C.ink600 }}>
            Proposed: <b style={{ color: C.navy }}>{{ awarded: "Awarded · full package", waitlisted: "Waitlisted", declined: "Declined" }[s.outcome]}</b> · by {ME.email} · awaiting core-sec sign-off. Nothing has moved yet: no fee change, no letter.
          </p>
        ) : (
          <>
            <label className="grid gap-[3px] font-semibold" style={{ color: C.ink900 }}>
              Outcome
              <select
                value={s.outcome}
                onChange={(e) => act && act({ type: "outcome", value: e.target.value })}
                className="h-[30px] rounded-[6px] border px-[8px] text-[12px] font-normal"
                style={{ borderColor: C.border2, background: C.surface, color: s.outcome ? C.ink900 : C.ink400, fontFamily: FONT }}
              >
                <option value="" disabled>Choose an outcome</option>
                <option value="awarded">Award</option>
                <option value="waitlisted">Waitlist</option>
                <option value="declined">Decline</option>
              </select>
            </label>
            {s.outcome === "awarded" && (
              <span className="flex items-center gap-[7px] font-medium" style={{ color: C.ink900 }}>
                <span className="grid h-[13px] w-[13px] place-items-center rounded-[3px] text-[9px] text-white" style={{ background: C.wine }}>✓</span>
                Approve what they requested · full package
              </span>
            )}
            <div><Btn small disabled={!s.outcome} onClick={act ? () => act({ type: "propose" }) : undefined}>Propose for sign-off</Btn></div>
          </>
        )}
        <span className="text-[11.5px]" style={{ color: C.ink500 }}>A proposal changes nothing on its own: the fee and the letter move only once a core-sec lead signs off.</span>
      </div>
    </Card>
  );
}

function AuditPage({ s }) {
  return (
    <>
      <PageHead title="Audit log" sub={`Latest ${s.audit.length} entries · who did what, when. Nothing here is editable.`} />
      <Card>
        <table className="w-full border-collapse text-[12px]" style={{ color: C.ink700 }}>
          <thead style={{ color: C.ink600 }}>
            <tr>
              <th className={TH} style={{ borderColor: C.border }}>Who</th>
              <th className={TH} style={{ borderColor: C.border }}>What</th>
              <th className={`${TH} text-right`} style={{ borderColor: C.border }}>When</th>
            </tr>
          </thead>
          <tbody>
            {s.audit.map((e) => (
              <tr key={e.id ?? e.what} style={{ background: e.t !== undefined && s.t - e.t < 4 ? "#f7f9ff" : undefined, transition: "background .6s" }}>
                <td className={`${TD} whitespace-nowrap`} style={{ borderColor: C.ground, height: 40 }}>{e.who}</td>
                <td className={TD} style={{ borderColor: C.ground }}>{e.what}</td>
                <td className={`${TD} whitespace-nowrap text-right text-[11.5px]`} style={{ borderColor: C.ground, color: C.ink500 }}>{when(e, s.t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
const when = (e, t) => (e.t === undefined ? e.when : t - e.t < 120 ? "just now" : `${Math.floor((t - e.t) / 120)}m ago`);

// The record panel (desk/_components/record-panel.tsx), slid over the page.
function RecordPanel({ r, s, act }) {
  const history = s.audit.filter((e) => e.person === r.id);
  return (
    <>
      <div className="absolute inset-0 z-20" style={{ background: "rgba(6,26,55,.28)" }} onClick={act ? () => act({ type: "close" }) : undefined} />
      <aside className="absolute bottom-0 right-0 top-0 z-30 w-[470px] overflow-y-auto pb-[20px]" style={{ background: C.ground, boxShadow: "-12px 0 40px rgba(6,26,55,.25)" }}>
        <header className="sticky top-0 z-10 border-b px-[20px] pb-[10px] pt-[16px]" style={{ background: C.surface, borderColor: C.border }}>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-[12px]">
            <Avatar name={r.name} size={40} />
            <div className="min-w-0">
              <h2 className="m-0 text-[17px] font-semibold leading-[1.25]" style={{ color: C.navy }}>{r.name}</h2>
              <p className="m-0 mt-[2px] truncate text-[12px]" style={{ color: C.ink500 }}>{r.ref} · <span className="underline decoration-[#d0d5dd] underline-offset-[3px]" style={{ color: C.ink600 }}>{r.email}</span></p>
            </div>
            <button type="button" onClick={act ? () => act({ type: "close" }) : undefined} className="-mr-[8px] -mt-[8px] grid h-[36px] w-[36px] cursor-pointer place-items-center self-start rounded-[6px] text-[20px] hover:bg-[#f6f7f9]" style={{ color: C.ink500 }} aria-label="Close">×</button>
          </div>
          <div className="mt-[10px] flex flex-wrap gap-[6px]">
            <Keyed map={REG} k={r.status} />
            {r.aid && <Keyed map={AID} k={r.aid} />}
            {r.fee && <Keyed map={FEE} k={r.fee} />}
          </div>
          <nav className="mt-[8px] flex gap-[16px] text-[12px] font-medium" style={{ color: C.wine }}>
            <span>Payments</span>{r.group && <span>Delegation</span>}
          </nav>
        </header>
        <dl className="mx-[14px] mt-[12px] grid grid-cols-5 overflow-hidden rounded-[6px] border" style={{ background: C.surface, borderColor: C.border }}>
          {[["Age at YMAU", r.age], ["From", `${r.city}, ${r.country}`], ["Registering", r.group ?? "Individually"], ["Fee", r.cents ? money(r.cents) : "–"], ["Submitted", r.status === "draft" ? "Not yet" : "18 Oct, 10:24 EAT"]].map(([k, v], i) => (
            <div key={k} className="min-w-0 px-[10px] py-[8px]" style={{ borderLeft: i ? `1px solid ${C.ground}` : 0 }}>
              <dt className="text-[10.5px]" style={{ color: C.ink500 }}>{k}</dt>
              <dd className="m-0 mt-[2px] text-[12px] font-medium leading-[1.35]" style={{ color: C.navy }}>{v}</dd>
            </div>
          ))}
        </dl>
        <PanelCard title="Registration fee">
          <Dl rows={[
            ["Status", r.fee ? <Keyed map={FEE} k={r.fee} /> : <span style={{ color: C.ink400 }}>Not given</span>],
            ["Amount", r.cents ? money(r.cents) : "Not given"],
            ...(r.note ? [["Note", <>{r.note}<small className="block text-[11px]" style={{ color: C.ink500 }}>{ME.email}</small></>]] : []),
            ...(GROUP.includes(r.id) && (s.reserved || s.paid) ? [["Payment page", "Opened 26 Oct, 14:02 EAT"]] : []),
            ...(r.fee === "paid" ? [["Paid", GROUP.includes(r.id) ? "26 Oct, 14:05 EAT · Stripe" : "25 Oct, 09:12 EAT · Stripe"]] : []),
            ...(r.attempt && r.fee === "due" && !GROUP.includes(r.id) ? [["Last attempt", r.attempt]] : []),
          ]} />
        </PanelCard>
        <PanelCard title="Financial aid">
          {r.aid ? <Dl rows={[["Status", <Keyed map={AID} k={r.aid} />], ["Requested", "Accommodation"], ["Review window", "Priority"]]} /> : <p className="m-0 text-[12px]" style={{ color: C.ink700 }}>Not applying for financial aid.</p>}
        </PanelCard>
        <PanelCard title="Documents">
          {r.age < 18 ? (
            <Dl rows={[["Parental consent form", r.docs.length ? <em className="font-medium not-italic" style={{ color: TONES.wine[1] }}>Missing</em> : <span style={{ color: C.wine }}>consent-form.pdf</span>], ["Signed code of conduct", <span style={{ color: C.wine }}>code-of-conduct.pdf</span>]]} />
          ) : (
            <Dl rows={[["Signed code of conduct", <span style={{ color: C.wine }}>code-of-conduct.pdf</span>]]} />
          )}
        </PanelCard>
        {history.length > 0 && (
          <PanelCard title="History">
            <ol className="m-0 list-none border-l-2 py-0 pl-[14px]" style={{ borderColor: C.border }}>
              {history.map((h) => (
                <li key={h.id} className="relative pb-[8px] pl-[8px] text-[12px]" style={{ color: C.ink700 }}>
                  <span className="absolute -left-[20px] top-[5px] h-[10px] w-[10px] rounded-full" style={{ background: C.navy }} />
                  {h.line}
                  <small className="block text-[11px]" style={{ color: C.ink500 }}>26 Oct, just now · {h.who}</small>
                </li>
              ))}
            </ol>
          </PanelCard>
        )}
      </aside>
    </>
  );
}
function PanelCard({ title, children }) {
  return (
    <section className="mx-[14px] mt-[10px] rounded-[6px] border px-[16px] pb-[12px] pt-[11px]" style={{ background: C.surface, borderColor: C.border }}>
      <h3 className="m-0 mb-[8px] text-[13px] font-semibold" style={{ color: C.navy }}>{title}</h3>
      {children}
    </section>
  );
}
function Dl({ rows }) {
  return (
    <dl className="m-0 grid grid-cols-[120px_1fr] gap-x-[12px] gap-y-[6px] text-[12px]">
      {rows.map(([k, v]) => [<dt key={`${k}t`} style={{ color: C.ink500 }}>{k}</dt>, <dd key={`${k}d`} className="m-0" style={{ color: C.ink900 }}>{v}</dd>])}
    </dl>
  );
}

// The floating line at the foot of the page: the newest audit entry, styled
// like the desk's floating bulk bar.
function AuditTicker({ entry, fresh, children, onOpen, label = "Audit log" }) {
  return (
    <div className="absolute bottom-[12px] left-1/2 z-40 flex max-w-[94%] -translate-x-1/2 items-center gap-[10px] rounded-[10px] px-[12px] py-[7px] text-[11.5px] text-white" style={{ background: C.navy, boxShadow: "0 10px 30px rgba(6,26,55,.35)" }}>
      <button type="button" onClick={onOpen} className={`flex min-w-0 items-center gap-[8px] text-left ${onOpen ? "cursor-pointer" : "cursor-default"}`}>
        {label === "Blind review" ? <Lock size={13} className="flex-none" style={{ color: C.gold }} /> : entry.who === "stripe" || label === "Stripe webhook" ? <Zap size={13} className="flex-none" style={{ color: C.gold }} /> : <History size={13} className="flex-none" style={{ color: C.gold }} />}
        <span className="flex-none text-[9.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(255,255,255,.55)" }}>{label}</span>
        <span className="min-w-0 truncate" style={{ opacity: fresh ? 1 : 0.78, transition: "opacity .4s" }}>
          {entry.who && <b className="font-semibold">{entry.who} </b>}{entry.what}
        </span>
      </button>
      {children}
    </div>
  );
}

/* ---------- cover: a scripted loop across three desk pages ---------- */

const COVER_STEPS = 28; // 500ms each

function Cover({ playing }) {
  const [t, setT] = useState(() => (reduced() ? 16 : 0));
  useEffect(() => {
    if (!playing || reduced()) return;
    const id = setInterval(() => setT((x) => (x + 1) % COVER_STEPS), 500);
    return () => clearInterval(id);
  }, [playing]);

  const page = t < 9 ? "capacity" : t < 19 ? "delegates" : "aid";
  const s = {
    reserved: t >= 3, paid: t >= 13 && t < 19 ? true : t >= 19, flash: t >= 13 && t <= 15,
    fees: {}, undo: {}, audit: [], t, open: null,
    hover: page === "delegates" && t >= 10 && t < 13 ? "d1" : null,
    scores: page === "aid" ? Object.fromEntries(RUBRIC.slice(0, Math.max(0, Math.min(4, t - 19))).map((c) => [c.key, SCRIPTED[c.key]])) : {},
    saved: t >= 24,
  };
  if (page === "capacity") s.paid = false;
  const rows = ["d1", "d2", "d3", "d4", "d5", "d6"].map((id) => rowOf(DELEGATES.find((d) => d.id === id), s));

  let entry = SEED_AUDIT[0];
  let fresh = false;
  let label = "Audit log";
  if (t >= 3 && t < 12) { entry = { who: PAYER, what: "capacity · checkout reserved · 3 places held for 35 min" }; fresh = t < 9; }
  if (t === 12) { entry = { who: "", what: "checkout.session.completed · signature verified · reconciling 3 fees" }; fresh = true; label = "Stripe webhook"; }
  if (t >= 13 && t < 19) { entry = { who: "stripe", what: "capacity · checkout paid · 3 registrations complete" }; fresh = true; }
  if (t >= 19) { entry = { who: "", what: t >= 24 ? "your score is saved, so the other reviewer’s score now shows" : "the other reviewer’s score stays hidden until yours is saved" }; fresh = true; label = "Blind review"; }

  return (
    <div className="grid h-full grid-cols-[156px_1fr]">
      <Sidebar page={page} compact aidCount="296" />
      <main className="relative min-w-0 overflow-hidden px-[18px] pt-[14px]">
        {page === "capacity" && <CapacityPage s={s} compact />}
        {page === "delegates" && <DelegatesPage rows={rows} s={s} compact />}
        {page === "aid" && <AidReviewPage s={s} compact />}
        {page !== "aid" && <AuditTicker entry={entry} fresh={fresh} label={label} />}
      </main>
    </div>
  );
}

/* ---------- full: the same desk, driven by the visitor ---------- */

const LOOP = 46; // 500ms ticks
const INIT = {
  t: 0, auto: true, page: "delegates", reserved: false, paid: false, flashUntil: 0, flash: false,
  open: null, hover: null, expanded: null, review: false, scores: {}, saved: false, outcome: "", proposed: false,
  fees: {}, undo: {}, payPrompt: null, payWebhookAt: null, audit: SEED_AUDIT,
};
const nameOf = (id) => DELEGATES.find((d) => d.id === id).name;
let seq = 0;
const log = (s, who, what, extra = {}) => ({ ...s, audit: [{ id: `e${++seq}`, who, what, t: s.t, ...extra }, ...s.audit] });

// What the autoplay does, by tick. It stops the moment the visitor acts.
const SCRIPT = {
  2: { type: "hover", id: "d1" },
  3: { type: "reserve" },
  7: { type: "webhook" },
  11: { type: "open", id: "d1" },
  16: { type: "close" },
  17: { type: "nav", page: "aid" },
  19: { type: "openReview" },
  21: { type: "score", key: "fn", n: 5 },
  22: { type: "score", key: "em", n: 4 },
  23: { type: "score", key: "rc", n: 4 },
  24: { type: "score", key: "cf", n: 4 },
  26: { type: "save" },
  30: { type: "outcome", value: "awarded" },
  32: { type: "propose" },
  36: { type: "nav", page: "audit" },
};

function reducer(s, a) {
  switch (a.type) {
    case "tick": {
      let n = { ...s, t: s.t + 1 };
      if (n.auto && n.t >= LOOP) return { ...INIT, audit: SEED_AUDIT };
      if (n.auto && SCRIPT[n.t]) n = reducer(n, SCRIPT[n.t]);
      if (n.payWebhookAt && n.t >= n.payWebhookAt) n = reducer({ ...n, payWebhookAt: null }, { type: "webhook" });
      if (n.flash && n.t >= n.flashUntil) n = { ...n, flash: false };
      return n;
    }
    case "take": return s.auto ? { ...s, auto: false } : s;
    case "replay": return { ...INIT, audit: SEED_AUDIT };
    case "hover": return { ...s, hover: a.id };
    case "nav": return { ...s, page: a.page, review: false, open: null, payPrompt: null, hover: null };
    case "open": return { ...s, open: a.id, hover: null };
    case "close": return { ...s, open: null };
    case "expand": return { ...s, expanded: a.id };
    case "reserve":
      // reserveCheckout: lock, check places, hold three for the 35-minute checkout.
      if (s.reserved || s.paid) return s;
      return log({ ...s, reserved: true }, PAYER, "capacity · checkout reserved");
    case "pay": {
      // The visitor's "pay by card" button: reserve now, Stripe reports back shortly.
      const r = reducer(s, { type: "reserve" });
      return a.now ? reducer(r, { type: "webhook" }) : { ...r, payWebhookAt: r.t + 3 };
    }
    case "webhook":
      // settle(): signature-checked event, fees to paid, places released, audited as stripe.
      if (s.paid) return s;
      return log({ ...s, reserved: true, paid: true, flash: true, flashUntil: s.t + 4 }, "stripe", "capacity · checkout paid");
    case "openReview": return { ...s, page: "aid", review: true, open: null };
    case "score": return { ...s, scores: { ...s.scores, [a.key]: a.n } };
    case "save": return total(s.scores) === null ? s : { ...s, saved: true };
    case "outcome": return { ...s, outcome: a.value };
    case "propose": {
      if (!s.outcome || s.proposed) return s;
      const what = { awarded: "awarded (full aid)", waitlisted: "waitlisted", declined: "declined" }[s.outcome];
      return log({ ...s, proposed: true }, ME.email, `proposed Achieng Otieno’s aid decision for sign-off: ${what}`);
    }
    case "payPrompt": return { ...s, payPrompt: a.id ? { id: a.id, mode: a.mode } : null };
    case "payConfirm": {
      const { id, mode } = s.payPrompt;
      const from = rowOf(DELEGATES.find((d) => d.id === id), s).fee;
      const note = mode === "manual" ? "Bank transfer received" : "Sponsor covered the fee";
      const n = { ...s, payPrompt: null, fees: { ...s.fees, [id]: mode }, undo: { ...s.undo, [id]: { did: mode, from } } };
      return log(n, ME.email, `changed ${nameOf(id)}’s fee from ${FEE_WORD[from]} to ${FEE_WORD[mode]}: “${note}”`, { person: id, line: `${mode === "manual" ? "Fee marked paid" : "Fee waived"}: ${note}` });
    }
    case "payUndo": {
      const u = s.undo[a.id];
      const fees = { ...s.fees };
      const base = DELEGATES.find((d) => d.id === a.id).fee;
      if (u.from === base) delete fees[a.id];
      else fees[a.id] = u.from;
      const undo = { ...s.undo };
      delete undo[a.id];
      return log({ ...s, fees, undo }, ME.email, `undid a change: changed ${nameOf(a.id)}’s fee from ${FEE_WORD[u.did]} to ${FEE_WORD[u.from]}`, { person: a.id, line: `Undo: Fee back to ${FEE_WORD[u.from]}` });
    }
    default: return s;
  }
}

function Full({ playing }) {
  const [s, dispatch] = useReducer(reducer, INIT);
  const still = reduced();
  useEffect(() => {
    if (!playing || still) return;
    const id = setInterval(() => dispatch({ type: "tick" }), 500);
    return () => clearInterval(id);
  }, [playing, still]);
  // Any click hands control to the visitor, then does what they asked.
  const act = (a) => {
    dispatch({ type: "take" });
    dispatch(a.type === "pay" && still ? { ...a, now: true } : a);
  };
  // The page scrolls inside its own frame: back to the top on a new page, and
  // down to the reviewer's half once the rubric is nearly scored.
  const mainRef = useRef(null);
  const scored = Object.keys(s.scores).length;
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [s.page, s.review]);
  useEffect(() => {
    const m = mainRef.current;
    if (m && s.review && (scored >= 4 || s.saved)) m.scrollTop = m.scrollHeight;
  }, [s.review, scored, s.saved, s.outcome, s.proposed]);
  const rows = DELEGATES.map((d) => rowOf(d, s));
  const latest = s.audit[0];
  const open = s.open ? rows.find((r) => r.id === s.open) : null;
  const navPage = s.page === "aid" ? "aid" : s.page;

  return (
    <div className="relative grid h-full grid-cols-[200px_1fr]">
      <Sidebar page={navPage} onNav={(p) => act({ type: "nav", page: p })} aidCount="296" />
      <div className="relative min-w-0 overflow-hidden">
        <main ref={mainRef} className="h-full overflow-y-auto px-[24px] pb-[70px] pt-[18px]">
          {s.page === "delegates" && <DelegatesPage rows={rows} s={s} onOpen={(id) => act({ type: "open", id })} />}
          {s.page === "delegations" && <DelegationsPage s={s} act={act} />}
          {s.page === "payments" && <PaymentsPage s={s} act={act} rows={rows} />}
          {s.page === "aid" && (s.review ? <AidReviewPage s={s} act={act} /> : <AidQueuePage act={act} />)}
          {s.page === "capacity" && <CapacityPage s={s} />}
          {s.page === "audit" && <AuditPage s={s} />}
        </main>
        <AuditTicker entry={latest} fresh={latest.t !== undefined && s.t - latest.t < 6} onOpen={() => act({ type: "nav", page: "audit" })}>
          {!s.paid && (
            <button type="button" onClick={() => act({ type: "pay" })} className="flex h-[26px] flex-none cursor-pointer items-center gap-[5px] rounded-[6px] border px-[9px] text-[11.5px] font-medium hover:bg-white/10" style={{ borderColor: "rgba(255,255,255,.35)" }}>
              <CreditCard size={12} /> Harmattan College pays by card
            </button>
          )}
          <button type="button" onClick={() => dispatch({ type: "replay" })} className="flex h-[26px] flex-none cursor-pointer items-center gap-[5px] rounded-[6px] px-[8px] text-[11.5px] hover:bg-white/10" style={{ color: "rgba(255,255,255,.8)" }} title="Replay the demo">
            <RotateCcw size={12} /> {s.auto && !still ? "Playing" : "Replay"}
          </button>
        </AuditTicker>
      </div>
      {open && <RecordPanel r={open} s={s} act={act} />}
    </div>
  );
}

/* ---------- frame: a fixed design size scaled to the card ---------- */

const SIZES = { cover: [720, 450], full: [1120, 700] };

export default function RegistrationDesk({ mode = "cover", playing = true }) {
  const ref = useRef(null);
  const [dw, dh] = SIZES[mode] ?? SIZES.cover;
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(Math.min(el.clientWidth / dw, el.clientHeight / dh) || 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dw, dh]);

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden" style={{ background: C.ground }}>
      <div
        className="absolute left-0 top-0 origin-top-left antialiased"
        style={{ width: dw, height: dh, transform: `scale(${scale})`, fontFamily: FONT, fontSize: 12, lineHeight: 1.55, color: C.ink900, background: C.ground, fontVariantNumeric: "tabular-nums" }}
      >
        {mode === "full" ? <Full playing={playing} /> : <Cover playing={playing} />}
        <span
          className={`pointer-events-none absolute z-10 rounded-[4px] px-[6px] py-[1px] text-[9.5px] font-medium uppercase tracking-[0.08em] ${mode === "full" ? "left-[620px] top-[8px]" : "right-[10px] top-[8px]"}`}
          style={{ background: "rgba(6,26,55,.06)", color: C.ink400 }}
        >
          Sample data
        </span>
      </div>
    </div>
  );
}
