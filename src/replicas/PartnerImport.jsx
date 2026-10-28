import { createElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown, Building2, Check, ChevronDown, Church, CircleAlert, CircleCheck, ClipboardCheck, FileSpreadsheet,
  FileUp, HandCoins, LayoutDashboard, LoaderCircle, LogOut, MessageCircleMore, Phone, PhoneCall, RotateCcw,
  Settings, Sparkles, Trash2, TriangleAlert, Upload, UserPlus, Users,
} from "lucide-react";
import { formatE164, maskPhone, normalizeChurchKey, validateRows } from "./partnerimport/rules.js";
import {
  AFRICA_HUBS, BASE_PARTNERS, BLOCKS, CHURCHES, COUNTRIES, EXISTING_PARTNERS, EXISTING_PHONES, FILE_NAME, HUB_ID,
  LEADER, SHEET, SHEET_NAME,
} from "./partnerimport/data.js";

/*
 * BENMP Partner Platform: the hub upload wizard (src/app/hub/ingest-wizard.tsx) and the
 * office Admins tab (src/app/poc/admins). Drawn at a fixed design width and scaled to fit,
 * so it reads like a screenshot at every card size.
 */

const COVER_W = 860;
const FULL_W = 1120;
const OFFICE_W = 1240;
const BAR_H = 38;

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "map", label: "Columns" },
  { key: "preview", label: "Check & fix" },
  { key: "done", label: "Saved" },
];

const FIELD_LABEL = { name: "Name", whatsappPhone: "WhatsApp number", church: "Branch" };
const COLUMN_FIELDS = [["name", "Names column"], ["whatsappPhone", "WhatsApp numbers column"], ["church", "Church column"]];
const TAGS = { name: "Name", whatsappPhone: "WhatsApp", church: "Church" };

const inputBase =
  "h-9 w-full rounded border bg-[#f4f8fa] px-2.5 text-[13px] text-[#102a43] outline-none transition focus:border-[#0f9d8a] focus:ring-2 focus:ring-[#0f9d8a]/15";
const brandBtn =
  "inline-flex h-11 items-center gap-2 rounded-md bg-[#0f9d8a] px-5 text-sm font-semibold text-white transition hover:bg-[#087987] disabled:cursor-not-allowed disabled:opacity-45";
const scriptFocus = " !border-[#0f9d8a] ring-2 ring-[#0f9d8a]/15";

// ----- wizard state (pure transitions, shared by the script and the visitor) ---------------

/** Guess the mapping from header words, as guessColumns does; "Cell" matches nothing. */
function guessColumns(header) {
  const cols = { name: "", whatsappPhone: "", church: "" };
  header.forEach((cell, i) => {
    const h = cell.toLowerCase();
    if (cols.name === "" && /name/.test(h) && !/church|branch/.test(h)) cols.name = i;
    if (cols.whatsappPhone === "" && /(whatsapp|wa)/.test(h)) cols.whatsappPhone = i;
    if (cols.church === "" && /(church|branch|assembly)/.test(h)) cols.church = i;
  });
  return cols;
}

/** Rows numbered as in the admin's own Excel, header included. */
function extractRows(cols, hasHeader) {
  const out = [];
  for (let i = hasHeader ? 1 : 0; i < SHEET.length; i++) {
    const raw = SHEET[i];
    const row = { rowIndex: i + 1, name: raw[cols.name].trim(), whatsappPhone: raw[cols.whatsappPhone].trim(), church: raw[cols.church].trim(), removed: false };
    if (row.name || row.whatsappPhone || row.church) out.push(row);
  }
  return out;
}

const MAPPED = { name: 1, whatsappPhone: 2, church: 3 };
const atPreview = (partners = BASE_PARTNERS) => ({
  step: "preview", cols: MAPPED, hasHeader: true, rows: extractRows(MAPPED, true), busy: null, dragging: false, result: null, error: null, partners,
});

function validationCtx(country) {
  return { churches: CHURCHES, hubId: HUB_ID, existingPartners: EXISTING_PARTNERS, existingPhones: EXISTING_PHONES, country };
}

/** Save: the same rules run again, and only a clean set is written. */
function save(s, country) {
  const active = s.rows.filter((r) => !r.removed);
  const checked = validateRows(active, validationCtx(country));
  if (checked.some((v) => v.issues.length > 0)) return { ...s, busy: null, error: "Could not save. Fix the flagged rows and try again." };
  const updated = checked.filter((v) => v.updatesPartnerId).length;
  const accepted = checked.length;
  return { ...s, busy: null, step: "done", result: { accepted, removed: s.rows.length - accepted }, partners: s.partners + accepted - updated };
}

function finishBusy(s, country) {
  if (s.busy === "read") return { ...s, busy: null, step: "map", cols: guessColumns(SHEET[0]), hasHeader: true };
  if (s.busy === "check") return { ...s, busy: null, step: "preview", rows: extractRows(s.cols, s.hasHeader) };
  if (s.busy === "save") return save(s, country);
  return s;
}

const columnLabel = (c, hasHeader) => {
  const header = hasHeader ? SHEET[0][c].trim() : "";
  const letter = String.fromCharCode(65 + c);
  return header ? `Column ${letter}: “${header}”` : `Column ${letter}`;
};

// ----- the component ----------------------------------------------------------------------

export default function PartnerImport({ mode = "cover", playing = true }) {
  const full = mode === "full";
  const [reduced] = useState(reducedMotion);
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const contentRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const [tab, setTab] = useState("hub");
  const [officeView, setOfficeView] = useState("blocks");
  const [countryKey, setCountryKey] = useState("malawi");
  const country = COUNTRIES.find((c) => c.key === countryKey);
  const [w, setW] = useState(() => atPreview());
  const [ui, setUi] = useState({ cursor: null, clicks: 0, menu: null, focus: null, drag: false, readRow: 3, pill: true, scroll: { sel: "wizard", n: 0, smooth: false } });
  const [autoplay, setAutoplay] = useState(!reduced);
  const [idx, setIdx] = useState(0);

  useLayoutEffect(() => {
    const el = rootRef.current;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const designW = tab === "office" ? OFFICE_W : full ? FULL_W : COVER_W;
  const areaH = size.h - (full ? BAR_H : 0);
  const scale = size.w / designW || 1;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // Scroll the page to a marked element once it has rendered.
  useLayoutEffect(() => {
    const main = mainRef.current;
    const el = contentRef.current?.querySelector(`[data-cur="${ui.scroll.sel}"]`);
    if (!main || !el) return;
    const top = (el.getBoundingClientRect().top - contentRef.current.getBoundingClientRect().top) / scaleRef.current;
    main.scrollTo({ top: Math.max(0, top - (ui.scroll.offset ?? 12)), behavior: ui.scroll.smooth && !reduced ? "smooth" : "auto" });
  }, [ui.scroll, reduced, size.w, tab]);

  // ----- validation, live (the same function the save runs) -----
  const validated = useMemo(() => {
    if (w.step !== "preview") return [];
    return validateRows(w.rows.filter((r) => !r.removed), validationCtx(country));
  }, [w.step, w.rows, country]);
  const byRow = useMemo(() => new Map(validated.map((v) => [v.rowIndex, v])), [validated]);

  // ----- actions -----
  const scrollTo = (sel, offset, smooth = true) => setUi((u) => ({ ...u, scroll: { sel, offset, smooth, n: u.scroll.n + 1 } }));
  const editRow = (rowIndex, patch) => setW((s) => ({ ...s, error: null, rows: s.rows.map((r) => (r.rowIndex === rowIndex ? { ...r, ...patch } : r)) }));
  const startBusy = (kind) => setW((s) => ({ ...s, busy: kind, error: null }));
  const finish = () => {
    setW((s) => finishBusy(s, country));
    scrollTo("wizard", 12, false);
  };
  const reset = () => {
    setW((s) => ({ ...s, step: "upload", rows: [], result: null, error: null, busy: null }));
    scrollTo("wizard", 12, false);
  };

  // Visitor-driven steps: a short "busy" beat, then the transition.
  const userBusy = (kind) => {
    startBusy(kind);
    setTimeout(finish, kind === "save" ? 650 : 550);
  };

  // ----- the scripted run (cover loop, and full mode until the visitor takes over) -----
  const pointAt = (sel) => {
    const el = contentRef.current?.querySelector(`[data-cur="${sel}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const c = contentRef.current.getBoundingClientRect();
    const k = scaleRef.current;
    return { x: (r.left - c.left) / k, y: (r.top - c.top) / k, w: r.width / k, h: r.height / k };
  };
  const cursorTo = (sel, fx = 0.55, fy = 0.6) => {
    const p = pointAt(sel);
    if (p) setUi((u) => ({ ...u, cursor: { x: p.x + p.w * fx, y: p.y + p.h * fy } }));
  };
  const click = () => setUi((u) => ({ ...u, clicks: u.clicks + 1 }));
  const openMenu = (sel, options) => {
    const p = pointAt(sel);
    if (p) setUi((u) => ({ ...u, menu: { ...p, sel, options, hi: -1 } }));
  };
  const menuHi = (hi) => setUi((u) => (u.menu ? { ...u, menu: { ...u.menu, hi } } : u));
  const closeMenu = () => setUi((u) => ({ ...u, menu: null }));
  const focus = (key) => setUi((u) => ({ ...u, focus: key }));

  const script = [];
  const at = (wait, run) => script.push([wait, run]);
  at(1500, () => { cursorTo("name-4", 0.7); setUi((u) => ({ ...u, readRow: 3 })); });
  at(600, () => { click(); focus("name-4"); });
  " Mkandawire".split("").forEach((_, i, all) => at(i === 0 ? 300 : 60, () => editRow(4, { name: "Tiwonge" + all.slice(0, i + 1).join("") })));
  at(500, () => { focus(null); scrollTo("row-6", 40); setUi((u) => ({ ...u, pill: false })); });
  at(450, () => cursorTo("church-7"));
  at(600, () => { click(); openMenu("church-7", CHURCHES); });
  at(400, () => menuHi(4));
  at(350, () => { editRow(7, { church: CHURCHES[4] }); closeMenu(); });
  at(500, () => cursorTo("trash-8", 0.5, 0.5));
  at(600, () => { click(); editRow(8, { removed: true }); });
  at(650, () => { scrollTo("save", 300); cursorTo("save"); });
  at(650, () => { click(); startBusy("save"); });
  at(600, () => { finish(); setUi((u) => ({ ...u, cursor: null })); });
  at(600, () => cursorTo("upload-again"));
  at(1200, () => { click(); reset(); });
  at(500, () => setUi((u) => ({ ...u, cursor: { x: 640, y: 150, jump: true }, drag: true })));
  at(60, () => cursorTo("dropzone", 0.5, 0.45));
  at(500, () => setW((s) => ({ ...s, dragging: true })));
  at(400, () => { setW((s) => ({ ...s, dragging: false })); setUi((u) => ({ ...u, drag: false })); startBusy("read"); });
  at(650, finish);
  at(500, () => { cursorTo("col-whatsappPhone"); scrollTo("col-whatsappPhone", 150); });
  at(550, () => { click(); openMenu("col-whatsappPhone", ["Choose...", ...SHEET[0].map((_, c) => columnLabel(c, true))]); });
  at(400, () => menuHi(3));
  at(350, () => { setW((s) => ({ ...s, cols: { ...s.cols, whatsappPhone: 2 } })); closeMenu(); });
  at(500, () => cursorTo("check-rows"));
  at(550, () => { click(); startBusy("check"); });
  at(500, () => { setW(atPreview()); scrollTo("wizard", 12, false); setUi((u) => ({ ...u, pill: true })); });
  const scriptRef = useRef(script);
  scriptRef.current = script;

  const running = playing && !reduced && autoplay && tab === "hub" && size.w > 0;
  useEffect(() => {
    if (!running) return;
    const steps = scriptRef.current;
    const [wait, run] = steps[idx % steps.length];
    const id = setTimeout(() => {
      run();
      setIdx((i) => (i + 1) % steps.length);
    }, wait);
    return () => clearTimeout(id);
  }, [running, idx]);

  // The visitor takes over: drop the script's cursor and finish anything mid-flight.
  const takeOver = (e) => {
    if (!full || !autoplay || e.target.closest?.("[data-replay]")) return;
    setAutoplay(false);
    setUi((u) => ({ ...u, cursor: null, menu: null, focus: null, drag: false }));
    setW((s) => ({ ...finishBusy(s, country), dragging: false }));
  };
  const replay = () => {
    setTab("hub");
    setOfficeView("blocks");
    setCountryKey("malawi");
    setW(atPreview());
    setUi((u) => ({ ...u, cursor: null, menu: null, focus: null, drag: false, readRow: 3, pill: true, scroll: { sel: "wizard", n: u.scroll.n + 1, smooth: false } }));
    setIdx(0);
    setAutoplay(!reduced);
  };

  const live = full && !autoplay;
  const hubProps = { full, w, setW, ui, setUi, validated, byRow, editRow, userBusy, reset, scrollTo, live, country, mainRef, contentRef };

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full select-none overflow-hidden bg-[#f4f8fa] font-sans antialiased"
      onPointerDownCapture={takeOver}
      onWheelCapture={takeOver}
      onKeyDownCapture={takeOver}
      onFocusCapture={takeOver}
      onChangeCapture={takeOver}
    >
      <style>{KEYFRAMES}</style>
      {size.w > 0 && (
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: designW, height: areaH / scale, transform: `scale(${scale})` }}>
          {tab === "hub" ? (
            <HubPortal {...hubProps} />
          ) : (
            <OfficeConsole view={officeView} setView={setOfficeView} partners={w.partners} />
          )}
        </div>
      )}
      {full && (
        <ControlBar
          tab={tab} setTab={setTab} countryKey={countryKey} setCountryKey={setCountryKey}
          autoplay={autoplay && !reduced} replay={replay} setReadRow={(r) => setUi((u) => ({ ...u, readRow: r }))}
          readout={tab === "hub" && w.step === "preview" ? byRow.get(ui.readRow) : null} country={country}
        />
      )}
    </div>
  );
}

const KEYFRAMES = `
@keyframes pi-click { from { transform: translate(-50%,-50%) scale(.4); opacity: .55 } to { transform: translate(-50%,-50%) scale(1.6); opacity: 0 } }
@keyframes pi-in { from { opacity: 0; transform: translateY(3px) } to { opacity: 1; transform: none } }
`;

// ----- hub portal (src/app/hub/layout.tsx, nav.tsx, upload/page.tsx) ---------------------

const HUB_TABS = [
  ["Overview", LayoutDashboard], ["Upload", FileUp], ["Your partners", Users], ["Unclaimed givers", UserPlus], ["Settings", Settings],
];

function HubPortal(props) {
  const { w, ui, country, mainRef, contentRef, live, byRow, full } = props;
  // The cover shows the reading as a callout; full mode shows it in the control bar.
  const readout = !full && ui.pill && w.step === "preview" ? byRow.get(ui.readRow) : null;
  return (
    <div
      className="flex h-full flex-col text-[#102a43]"
      style={{ background: "radial-gradient(circle at 92% 0%, rgba(59,159,246,0.10), transparent 28%), radial-gradient(circle at 10% 35%, rgba(22,184,154,0.07), transparent 25%), #f4f8fa" }}
    >
      <header className="flex-none border-b border-[#dce8ed] bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-4xl items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative grid h-9 w-9 flex-none place-items-center rounded-lg bg-[#0f9d8a] text-sm font-bold text-white shadow-sm">
              B
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#f5ad22]" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold">BENMP Partners</span>
              <span className="block text-[11px] text-[#62798a]">Hub workspace</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#0f9d8a]/15 bg-[#0f9d8a]/5 px-3 py-1.5 text-xs font-semibold text-[#0f9d8a]">{country.hubLabel}</span>
            <span className="flex h-9 items-center gap-1.5 rounded-md border border-[#dce8ed] bg-[#f4f8fa] px-3 text-xs font-semibold text-[#62798a]">
              <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
            </span>
          </div>
        </div>
      </header>
      <nav className="flex-none border-b border-[#dce8ed] bg-white">
        <div className="mx-auto flex w-full max-w-4xl gap-1 px-6">
          {HUB_TABS.map(([label, icon]) => (
            <span
              key={label}
              className={`flex flex-none items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-semibold ${label === "Upload" ? "border-[#0f9d8a] text-[#0f9d8a]" : "border-transparent text-[#62798a]"}`}
            >
              {createElement(icon, { className: "h-3.5 w-3.5", "aria-hidden": true })}
              {label}
            </span>
          ))}
        </div>
      </nav>
      <main ref={mainRef} className={`relative min-h-0 flex-1 [scrollbar-width:none] ${live ? "overflow-y-auto" : "overflow-hidden"}`}>
        <div ref={contentRef} className="relative mx-auto w-full max-w-4xl px-6 pb-10 pt-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{country.hubLabel}</h1>
              <p className="mt-1 text-sm text-[#62798a]">{country.region} · Led by {LEADER}</p>
            </div>
            <Wizard {...props} pill={readout} />
            <HubTotals partners={w.partners} live={live} />
          </div>
          <ScriptLayer ui={ui} />
        </div>
      </main>
    </div>
  );
}

/** Where-am-I strip across the top of the wizard. */
function StepIndicator({ current }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span
            className={`grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-bold ${i < idx ? "bg-[#32c978]/15 text-[#32c978]" : i === idx ? "bg-[#0f9d8a] text-white" : "bg-[#edf1f2] text-[#62798a]"}`}
          >
            {i < idx ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
          </span>
          <span className={`text-xs font-semibold ${i === idx ? "text-[#102a43]" : "text-[#62798a]"}`}>{s.label}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-7 bg-[#dce8ed]" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function Wizard(props) {
  const { w } = props;
  return (
    <div data-cur="wizard" className="rounded-lg border border-[#dce8ed] bg-white">
      <div className="h-1 rounded-t-lg bg-[#f5ad22]" />
      <div className="p-6">
        <StepIndicator current={w.step} />
        {w.step === "upload" && <UploadStep {...props} />}
        {w.step === "map" && <MapStep {...props} />}
        {w.step === "preview" && <PreviewStep {...props} />}
        {w.step === "done" && <DoneStep {...props} />}
      </div>
    </div>
  );
}

function UploadStep({ w, userBusy, live }) {
  return (
    <div
      data-cur="dropzone"
      className={`rounded-lg border-2 border-dashed px-4 py-10 text-center transition ${w.dragging ? "border-[#0f9d8a] bg-[#0f9d8a]/5" : "border-[#dce8ed] bg-[#f4f8fa]/40"}`}
    >
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-[#0f9d8a]/10 text-[#0f9d8a]">
        <FileUp className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-3 text-base font-semibold">Upload your hub&apos;s partner list</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#62798a]">
        An Excel file (.xlsx) or CSV with names, WhatsApp numbers, and the church each partner belongs to. You will check and correct
        everything before anything is saved: nothing goes in behind your back.
      </p>
      <div className="mt-5">
        <button type="button" disabled={!!w.busy} onClick={() => live && userBusy("read")} className={brandBtn}>
          {w.busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <FileSpreadsheet className="h-4 w-4" aria-hidden />}
          {w.busy ? "Reading file..." : "Choose file"}
        </button>
        <p className="mt-2 text-xs text-[#62798a]">or drag the file anywhere into this box</p>
      </div>
    </div>
  );
}

function MapStep({ w, setW, userBusy, reset, live, ui }) {
  const { cols, hasHeader } = w;
  const ready = cols.name !== "" && cols.whatsappPhone !== "" && cols.church !== "";
  const tagFor = (c) => Object.keys(TAGS).find((k) => cols[k] === c);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Where is everything in “{FILE_NAME}”?</h2>
        <p className="mt-1 text-sm text-[#62798a]">Pick the sheet, then point at the four columns. Column titles in the file don&apos;t matter: your choice here does.</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={hasHeader} onChange={(e) => live && setW((s) => ({ ...s, hasHeader: e.target.checked }))} className="h-4 w-4 accent-[#0f9d8a]" />
        The first row is column titles, not a person
      </label>
      <div className="grid grid-cols-4 gap-3">
        {COLUMN_FIELDS.map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
            <select
              data-cur={`col-${key}`}
              value={cols[key]}
              onChange={(e) => live && setW((s) => ({ ...s, cols: { ...s.cols, [key]: e.target.value === "" ? "" : Number(e.target.value) } }))}
              className={inputBase + " border-[#dce8ed]" + (ui.menu?.sel === `col-${key}` ? scriptFocus : "")}
            >
              <option value="">Choose...</option>
              {SHEET[0].map((_, c) => (
                <option key={c} value={c}>{columnLabel(c, hasHeader)}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="overflow-hidden rounded border border-[#dce8ed]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr>
              {SHEET[0].map((_, c) => {
                const tag = tagFor(c);
                return (
                  <th key={c} className="border-b border-[#dce8ed] px-3 py-1.5">
                    {tag ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0f9d8a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ animation: "pi-in .25s ease-out" }}>
                        <Check className="h-3 w-3" aria-hidden />
                        {TAGS[tag]}
                      </span>
                    ) : (
                      <span className="inline-block h-px w-3 bg-[#62798a]/40 align-middle" aria-hidden />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {SHEET.slice(0, 6).map((r, i) => (
              <tr key={i} className={i === 0 && hasHeader ? "bg-[#edf1f2]/60 font-semibold" : "odd:bg-[#f4f8fa]"}>
                {r.map((cell, c) => (
                  <td key={c} className={`whitespace-nowrap border-b border-[#dce8ed] px-3 py-1.5 ${tagFor(c) ? "bg-[#0f9d8a]/5 text-[#102a43]" : "text-[#62798a]"}`}>
                    {c === 2 && i > 0 ? maskPhone(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => live && reset()} className="text-sm font-semibold text-[#62798a] hover:text-[#102a43]">Start over</button>
        <button data-cur="check-rows" type="button" disabled={!!w.busy || !ready} onClick={() => live && userBusy("check")} className={brandBtn}>
          {w.busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
          Check the rows
        </button>
      </div>
    </div>
  );
}

function PreviewStep({ w, validated, byRow, editRow, userBusy, reset, scrollTo, live, ui, setUi, pill, country }) {
  const active = w.rows.filter((r) => !r.removed).length;
  const flagged = validated.filter((v) => v.issues.length > 0).length;
  const updates = validated.filter((v) => v.updatesPartnerId && v.issues.length === 0).length;
  return (
    <div className="space-y-4">
      <div data-cur="preview-head" className="relative flex flex-wrap items-center justify-between gap-3">
        {pill && <Readout row={pill} country={country} />}
        <div>
          <h2 className="text-base font-semibold">Check before saving</h2>
          <p className="mt-0.5 text-sm text-[#62798a]">
            {active} row{active === 1 ? "" : "s"} from “{SHEET_NAME}”
            {flagged > 0 ? (
              <span className="font-semibold text-[#ec5c8d]"> · {flagged} need{flagged === 1 ? "s" : ""} attention: the reason is written under each flagged row</span>
            ) : (
              <span className="font-semibold text-[#32c978]"> · all clean</span>
            )}
          </p>
          {updates > 0 && (
            <p className="mt-1 text-sm text-[#62798a]">
              <span className="font-semibold text-[#102a43]">{updates} row{updates === 1 ? "" : "s"} will update {updates === 1 ? "a partner" : "partners"} you already have</span>{" "}
              (same name and same number). Their church and details will be updated to what is shown here. Giving history is not affected.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {flagged > 0 && (
            <button
              type="button"
              onClick={() => live && scrollTo(`row-${validated.find((v) => v.issues.length > 0).rowIndex}`, 120)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#ec5c8d]/30 bg-[#ec5c8d]/5 px-3 text-xs font-semibold text-[#ec5c8d] transition hover:bg-[#ec5c8d]/10"
            >
              <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              Go to first problem
            </button>
          )}
          <button type="button" onClick={() => live && reset()} className="text-sm font-semibold text-[#62798a] hover:text-[#102a43]">Start over</button>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-[#dce8ed]">
        <table className="w-full table-fixed text-left text-[13px]">
          <thead>
            <tr className="bg-[#edf1f2] text-xs font-semibold text-[#62798a]">
              <th className="w-14 px-2 py-2">Row</th>
              <th className="w-[27%] px-2 py-2">Name</th>
              <th className="w-[25%] px-2 py-2">WhatsApp number</th>
              <th className="px-2 py-2">Church</th>
              <th className="w-[92px] px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {w.rows.map((r) => (
              <PreviewRow key={r.rowIndex} row={r} v={byRow.get(r.rowIndex)} onEdit={editRow} live={live} ui={ui} setUi={setUi} />
            ))}
          </tbody>
        </table>
      </div>

      {w.error && (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-[#ec5c8d]/25 bg-[#ec5c8d]/5 px-3 py-2.5 text-[13px] leading-5 text-[#ec5c8d]">
          <CircleAlert className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          {w.error}
        </p>
      )}

      <div className="flex items-center justify-end">
        <button data-cur="save" type="button" disabled={!!w.busy || flagged > 0 || active === 0} onClick={() => live && userBusy("save")} className={brandBtn}>
          {w.busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <CircleCheck className="h-4 w-4" aria-hidden />}
          Save {active} partner{active === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );
}

function PreviewRow({ row, v, onEdit, live, ui, setUi }) {
  const [editingPhone, setEditingPhone] = useState(false);
  const td = "px-2 py-1.5";
  if (row.removed) {
    return (
      <tr className="bg-[#edf1f2]/40 text-[#62798a]">
        <td className={`${td} tabular-nums`}>{row.rowIndex}</td>
        <td className={`${td} line-through`}>{row.name}</td>
        <td className={`${td} line-through`}>{maskPhone(row.whatsappPhone)}</td>
        <td className={`${td} line-through`}>{row.church}</td>
        <td className={`${td} text-right`}>
          <button type="button" onClick={() => live && onEdit(row.rowIndex, { removed: false })} title="Put this row back" className="inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-semibold text-[#62798a] hover:bg-[#edf1f2] hover:text-[#102a43]">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Restore
          </button>
        </td>
      </tr>
    );
  }
  const issues = v?.issues ?? [];
  const issueFor = (field) => issues.filter((i) => i.field === field).map((i) => i.message).join(" ");
  const flagged = issues.length > 0;
  const matched = CHURCHES.find((c) => normalizeChurchKey(c) === normalizeChurchKey(row.church));
  const border = (field) => (issueFor(field) ? " border-[#ec5c8d]/60" : " border-[#dce8ed]");
  const scripted = (key) => (ui.focus === key || ui.menu?.sel === key ? scriptFocus : "");
  return (
    <>
      <tr data-cur={`row-${row.rowIndex}`} className="align-top odd:bg-[#f4f8fa]" data-flagged={flagged || undefined}>
        <td className="whitespace-nowrap px-2 py-2.5 tabular-nums text-[#62798a]">
          <span className="inline-flex items-center gap-1">
            {flagged ? <TriangleAlert className="h-3.5 w-3.5 text-[#ec5c8d]" aria-hidden /> : <CircleCheck className="h-3.5 w-3.5 text-[#32c978]" aria-hidden />}
            {row.rowIndex}
          </span>
        </td>
        <td className={td}>
          <FlaggedCell message={issueFor("name")}>
            <input data-cur={`name-${row.rowIndex}`} value={row.name} readOnly={!live} onChange={(e) => onEdit(row.rowIndex, { name: e.target.value })} className={inputBase + border("name") + scripted(`name-${row.rowIndex}`)} />
          </FlaggedCell>
        </td>
        <td className={td}>
          <FlaggedCell message={issueFor("whatsappPhone")}>
            <input
              data-cur={`wa-${row.rowIndex}`}
              value={editingPhone ? row.whatsappPhone : maskPhone(row.whatsappPhone)}
              inputMode="tel"
              readOnly={!live}
              onFocus={() => { if (live) { setEditingPhone(true); setUi((u) => ({ ...u, readRow: row.rowIndex })); } }}
              onBlur={() => setEditingPhone(false)}
              onChange={(e) => onEdit(row.rowIndex, { whatsappPhone: e.target.value })}
              className={inputBase + " tabular-nums" + border("whatsappPhone")}
            />
          </FlaggedCell>
        </td>
        <td className={td}>
          <FlaggedCell message={issueFor("church")}>
            <select data-cur={`church-${row.rowIndex}`} value={matched ?? ""} onChange={(e) => live && onEdit(row.rowIndex, { church: e.target.value })} className={inputBase + border("church") + scripted(`church-${row.rowIndex}`)}>
              <option value="" disabled>{row.church ? `“${row.church.slice(0, 28)}”: pick from list` : "Pick church..."}</option>
              {CHURCHES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FlaggedCell>
        </td>
        <td className={`${td} text-right`}>
          <button data-cur={`trash-${row.rowIndex}`} type="button" onClick={() => live && onEdit(row.rowIndex, { removed: true })} title="Leave this row out" className="inline-flex h-8 w-8 items-center justify-center rounded text-[#62798a] hover:bg-[#ec5c8d]/10 hover:text-[#ec5c8d]">
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </td>
      </tr>
      {flagged && (
        // The reasons in full, right under the row, where the eye lands after the triangle.
        <tr className="bg-[#ec5c8d]/5">
          <td />
          <td colSpan={4} className="px-2 pb-2.5 pt-0">
            <ul className="space-y-0.5 text-[13px] leading-5 text-[#ec5c8d]">
              {issues.map((i, n) => (
                <li key={n}><span className="font-semibold">{FIELD_LABEL[i.field]}:</span> {i.message}</li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

/** Red-triangle flag with the reason under the field. */
function FlaggedCell({ message, children }) {
  if (!message) return children;
  return (
    <div title={message}>
      <div className="relative">
        {children}
        <TriangleAlert className="pointer-events-none absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-white text-[#ec5c8d]" aria-hidden />
      </div>
      <p className="mt-1 text-[11px] leading-4 text-[#ec5c8d]">{message}</p>
    </div>
  );
}

function DoneStep({ w, reset, live }) {
  const { accepted, removed } = w.result;
  return (
    <div className="py-2 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-[#32c978]/10 text-[#32c978]">
        <CircleCheck className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-3 text-base font-semibold">{accepted} partner{accepted === 1 ? "" : "s"} saved</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#62798a]">
        From “{FILE_NAME}”
        {removed > 0 ? `: ${removed} row${removed === 1 ? " was" : "s were"} left out and kept on record.` : "."} They now count toward your hub&apos;s totals below.
      </p>
      <button data-cur="upload-again" type="button" onClick={() => live && reset()} className={brandBtn + " mt-5"}>
        <FileUp className="h-4 w-4" aria-hidden />
        Upload another file
      </button>
    </div>
  );
}

function HubTotals({ partners, live }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {[
          [Church, CHURCHES.length, "Churches in this hub", "bg-[#0f9d8a]/10 text-[#0f9d8a]"],
          [Users, partners, "Partners uploaded by this hub", "bg-[#32c978]/10 text-[#32c978]"],
        ].map(([icon, value, label, tone]) => (
          <div key={label} className="rounded-lg border border-[#dce8ed] bg-white p-5">
            <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
                {createElement(icon, { className: "h-5 w-5", "aria-hidden": true })}
              </span>
              <div>
                <p className="text-xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-[#62798a]">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-[#dce8ed] bg-white">
        <button type="button" onClick={() => live && setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 p-5 text-left">
          <div>
            <h2 className="text-sm font-semibold">Your hub&apos;s approved church list</h2>
            <p className="mt-0.5 text-xs text-[#62798a]">Church names in your uploads must match one of these: open the list to check your spreadsheet before uploading.</p>
          </div>
          <ChevronDown className={`h-4 w-4 flex-none text-[#62798a] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {open && (
          <div className="border-t border-[#dce8ed] px-5 py-4">
            <ul className="flex flex-wrap gap-1.5">
              {CHURCHES.map((c) => (
                <li key={c} className="rounded-full border border-[#dce8ed] bg-[#f4f8fa] px-2.5 py-1 text-xs">{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

// ----- script overlay: cursor, dragged file, the native dropdown it opens -----------------

function ScriptLayer({ ui }) {
  const { cursor, menu, drag, clicks } = ui;
  return (
    <>
      {menu && (
        <div className="absolute z-30 overflow-hidden rounded-md border border-black/10 bg-white py-1 text-[13px] shadow-[0_10px_30px_rgba(16,42,67,0.2)]" style={{ left: menu.x, top: menu.y + menu.h + 2, width: Math.max(menu.w, 230) }}>
          {menu.options.map((o, i) => (
            <div key={o} className={`px-3 py-1 ${i === menu.hi ? "bg-[#2f6fde] text-white" : "text-[#102a43]"}`}>{o}</div>
          ))}
        </div>
      )}
      {cursor && (
        <div
          className="pointer-events-none absolute z-40"
          style={{ left: cursor.x, top: cursor.y, transition: cursor.jump ? "none" : "left .55s cubic-bezier(.4,0,.2,1), top .55s cubic-bezier(.4,0,.2,1)" }}
        >
          <span key={clicks} className="absolute left-0 top-0 h-8 w-8 rounded-full bg-[#0f9d8a]/40" style={{ animation: clicks ? "pi-click .45s ease-out forwards" : "none", opacity: 0 }} />
          <svg width="20" height="22" viewBox="0 0 20 22" className="relative drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]" aria-hidden="true">
            <path d="M2 1.5 L2 17 L6.2 13.2 L9 19.6 L11.9 18.3 L9.2 12.1 L15 12.1 Z" fill="#102a43" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          {drag && (
            <span className="absolute left-4 top-5 flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#dce8ed] bg-white px-2.5 py-1.5 text-xs font-semibold shadow-lg">
              <FileSpreadsheet className="h-4 w-4 text-[#1d7a46]" aria-hidden />
              {FILE_NAME}
            </span>
          )}
        </div>
      )}
    </>
  );
}

/** Replica annotation: how the hub's country read the selected WhatsApp cell. */
function Readout({ row, country, bar = false }) {
  const raw = maskPhone(row.whatsappPhone);
  const wrongCountry = country.ghanaRule && row.e164?.startsWith("+233") && !/^\+|^233/.test(row.whatsappPhone.replace(/\s/g, ""));
  const short = !row.e164 ? "flagged" : wrongCountry ? "wrong country, no warning" : country.cc && !country.ghanaRule ? `read in ${country.label}` : "own country code";
  const note = !row.e164
    ? country.ghanaRule ? "not a Ghana-shaped number: flagged" : country.cc ? `not a valid number for ${country.label}: flagged` : "no country code, and this hub spans several countries: flagged"
    : country.ghanaRule
      ? wrongCountry ? "read as Ghana and saved without a warning" : "carried its own country code"
      : country.cc
        ? `read in ${country.label}`
        : "carried its own country code";
  const result = (
    <span className={`font-mono font-semibold ${!row.e164 ? "text-[#ff8fb3]" : wrongCountry ? "text-[#f5ad22]" : "text-[#5fe0c5]"}`}>
      {row.e164 ? formatE164(row.e164, country.cc) : "rejected"}
    </span>
  );
  if (bar) {
    return (
      <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-[#f1f3f7]">
        <span className="text-[#9aa1b0]">row {row.rowIndex}</span>
        <span>{raw}</span>
        <span className="text-[#9aa1b0]">→</span>
        {result}
        <span className="truncate text-[#9aa1b0]">{short}</span>
      </span>
    );
  }
  return (
    <div className="pointer-events-none absolute -top-1 right-0 z-20 flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#06283d]/95 py-1.5 pl-2 pr-4 text-[12px] text-white shadow-[0_8px_24px_rgba(6,40,61,0.35)]" style={{ animation: "pi-in .3s ease-out" }}>
      <span className="flex items-center gap-1 rounded-full bg-[#16b89a]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5fe0c5]">
        <Phone className="h-3 w-3" aria-hidden /> Row {row.rowIndex}
      </span>
      <span className="font-mono">{raw}</span>
      <span className="text-white/50">→</span>
      {result}
      <span className="text-white/70">{note}</span>
    </div>
  );
}

// ----- full-mode controls (replica chrome, not part of the product) -----------------------

function ControlBar({ tab, setTab, countryKey, setCountryKey, autoplay, replay, setReadRow, readout, country }) {
  const btn = (on) => `px-2.5 py-1 border ${on ? "border-[#16b89a] bg-[#16b89a]/15 text-[#5fe0c5]" : "border-[#2a2a34] text-[#9aa1b0] hover:text-[#f1f3f7]"}`;
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 whitespace-nowrap border-t border-[#2a2a34] bg-[#0a0a0c] px-3 font-mono text-[11px]" style={{ height: BAR_H }}>
      <div className="flex flex-none gap-1">
        <button type="button" className={btn(tab === "hub")} onClick={() => setTab("hub")}>Hub portal</button>
        <button type="button" className={btn(tab === "office")} onClick={() => setTab("office")}>Office console</button>
      </div>
      {tab === "hub" && (
        <label className="flex flex-none items-center gap-2 text-[#9aa1b0]">
          Hub country
          <select
            value={countryKey}
            onChange={(e) => { setCountryKey(e.target.value); setReadRow(3); }}
            className="border border-[#2a2a34] bg-[#111114] px-1.5 py-1 text-[#f1f3f7] outline-none focus:border-[#16b89a]"
          >
            {COUNTRIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}{c.cc && !c.ghanaRule ? ` (+${c.cc})` : ""}</option>
            ))}
          </select>
        </label>
      )}
      {readout ? <Readout row={readout} country={country} bar /> : <span className="text-[#9aa1b0]">{autoplay ? "autoplay: click anything to take over" : "your turn"}</span>}
      <span className={`ml-auto h-1.5 w-1.5 flex-none rounded-full ${autoplay ? "bg-[#16b89a]" : "bg-[#2a2a34]"}`} title={autoplay ? "Autoplay" : "Your turn"} />
      <button type="button" data-replay onClick={replay} className="flex flex-none items-center gap-1.5 border border-[#2a2a34] px-2.5 py-1 text-[#f1f3f7] hover:border-[#16b89a]">
        <RotateCcw className="h-3 w-3" aria-hidden /> Replay
      </button>
    </div>
  );
}

// ----- office console, Admins tab (src/app/poc/layout.tsx, admins/page.tsx, [region]) -----

const POC_TABS = [
  ["Dashboard", LayoutDashboard], ["Admins", Building2], ["Giving", HandCoins], ["Upload", Upload],
  ["Review", ClipboardCheck], ["Messages", MessageCircleMore], ["Calls", PhoneCall],
];

const formatGhs = (minor) => {
  const whole = Math.trunc(minor / 100).toLocaleString("en-US");
  const p = Math.abs(minor % 100);
  return `GHS ${p === 0 ? whole : `${whole}.${String(p).padStart(2, "0")}`}`;
};
const ofTotal = (done, total) => (total === 0 ? { value: "0" } : { value: `${done} of ${total}`, tone: done === total ? "good" : "warn" });
const toneClass = (tone) => (tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-red-700" : "text-[#102a43]");

function Stat({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-[#62798a]">{label}</span>
      <span className={`font-semibold tabular-nums ${toneClass(tone)}`}>{value}</span>
    </div>
  );
}

function MonthPicker() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#62798a]">Month</span>
      <span className="flex items-center gap-6 rounded border border-[#dce8ed] px-3 py-1.5 text-sm">October 2026 <ChevronDown className="h-3.5 w-3.5 text-[#62798a]" aria-hidden /></span>
      <span className="rounded bg-[#0f9d8a] px-3 py-1.5 text-sm font-semibold text-white">Show</span>
    </div>
  );
}

function OfficeConsole({ view, setView, partners }) {
  const delta = partners - BASE_PARTNERS;
  return (
    <div className="relative flex h-full flex-col bg-[#f4f8fa] text-[#102a43]">
      <header className="flex-none border-b border-[#dce8ed] bg-white/95 shadow-[0_2px_8px_rgba(16,42,67,0.07)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-5 px-6">
          <span className="flex flex-none items-center gap-2.5 py-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-br from-[#10a995] to-[#087b88] text-sm font-bold text-white shadow-[0_7px_18px_rgba(0,0,0,0.14)]">
              B
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#f5ad22]" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-[#073b4c]">BENMP Partners</span>
              <span className="block whitespace-nowrap text-[11px] text-[#62798a]">Healing Jesus Campaign</span>
            </span>
          </span>
          <nav className="ml-auto flex self-stretch">
            {POC_TABS.map(([label, icon]) => (
              <span key={label} className={`relative flex min-h-16 items-center gap-2 whitespace-nowrap px-4 text-sm ${label === "Admins" ? "font-bold text-[#073b4c]" : "font-medium text-[#607789]"}`}>
                {createElement(icon, { className: "h-4 w-4", "aria-hidden": true })}
                {label}
                {label === "Admins" && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-full bg-[#16b89a]" />}
              </span>
            ))}
          </nav>
          <span className="whitespace-nowrap rounded-full border border-[#dce8ed] bg-[#f4f8fa] px-3 py-1.5 text-[11px] font-semibold text-[#62798a]">Staff workspace</span>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 [scrollbar-width:none]">
        <div className="mx-auto max-w-6xl">
          {view === "blocks" ? <AdminBlocks delta={delta} open={() => setView("africa")} /> : <AdminRegion partners={partners} back={() => setView("blocks")} />}
        </div>
      </main>
      <span className="absolute bottom-6 right-6 flex items-center gap-2">
        <span className="rounded-full border border-[#0f9d8a]/20 bg-white px-3 py-2 text-xs font-bold text-[#0f9d8a] shadow-lg">Ask BENMP AI</span>
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#0f9d8a] text-white shadow-[0_12px_30px_rgba(0,95,112,0.32)] ring-4 ring-white">
          <Sparkles className="h-6 w-6" aria-hidden />
          <span className="absolute -bottom-1 rounded-full bg-[#f5ad22] px-1.5 py-0.5 text-[9px] font-black leading-none text-[#17344a] ring-2 ring-white">AI</span>
        </span>
      </span>
    </div>
  );
}

function AdminBlocks({ delta, open }) {
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admins</h1>
          <p className="mt-1 text-sm text-[#62798a]">Every hub admin&apos;s report for October 2026. Open a block to see its hubs.</p>
        </div>
        <MonthPicker />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {BLOCKS.map((b) => {
          const setUp = b.hubs > 0;
          const admins = setUp && ofTotal(b.signedIn, b.hubs);
          const cash = setUp && ofTotal(b.cash, b.branches);
          const partners = b.partners + (b.region ? delta : 0);
          return (
            <button
              key={b.label}
              type="button"
              onClick={() => b.region && open()}
              className={`flex h-full w-full flex-col rounded-lg border border-[#dce8ed] bg-white p-4 text-left shadow-[0_2px_8px_rgba(16,42,67,0.07)] transition ${setUp ? "hover:border-[#0f9d8a]" : "cursor-default opacity-70"} ${b.region ? "" : "cursor-default"}`}
            >
              <div className="flex w-full items-baseline justify-between">
                <h2 className="text-lg font-bold">{b.label}</h2>
                {setUp && <span className="text-xs text-[#62798a]">{b.hubs} hubs</span>}
              </div>
              {setUp ? (
                <div className="mt-3 w-full space-y-1.5">
                  <Stat label="Admins signed in" value={admins.value} tone={admins.tone} />
                  <Stat label="Partners" value={partners.toLocaleString("en-US")} />
                  <Stat label="Branches" value={b.branches.toLocaleString("en-US")} />
                  <Stat label="Cash reports filed" value={cash.value} tone={cash.tone} />
                  <Stat label="Giving this month" value={formatGhs(b.giving)} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#62798a]">Not set up yet. Its hubs and branches have not been added.</p>
              )}
            </button>
          );
        })}
      </div>
      <h2 className="mt-10 text-lg font-bold">Office reports</h2>
      <p className="mt-1 text-sm text-[#62798a]">The full reports behind these figures, for every church at once.</p>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[
          ["Cash Form Monitoring", "Which churches have filed this month's cash report."],
          ["Money by Church", "Giving per church by method, with hub and region totals."],
          ["Partners by Church", "Partners per church, with hub and region totals."],
          ["Executive Summary", "The headline giving figures, with a CSV download."],
        ].map(([title, text]) => (
          <div key={title} className="rounded-lg border border-[#dce8ed] bg-white p-4 shadow-[0_2px_8px_rgba(16,42,67,0.07)]">
            <span className="font-semibold text-[#0f9d8a]">{title} →</span>
            <span className="mt-1 block text-sm text-[#62798a]">{text}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function AdminRegion({ partners, back }) {
  return (
    <>
      <nav className="text-sm text-[#62798a]">
        <button type="button" onClick={back} className="hover:text-[#102a43]">Admins</button>
        {" / "}
        <span className="font-semibold text-[#102a43]">UD AF</span>
      </nav>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">UD AF</h1>
          <p className="mt-1 text-sm text-[#62798a]">33 hubs, October 2026. Open a hub to see its branches.</p>
        </div>
        <MonthPicker />
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-[#dce8ed] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#dce8ed] text-left text-xs uppercase text-[#62798a]">
            <tr>
              <th className="px-4 py-3">Hub</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3 text-right">Partners</th>
              <th className="px-4 py-3 text-right">Cash reports filed</th>
              <th className="px-4 py-3 text-right">Giving this month</th>
            </tr>
          </thead>
          <tbody>
            {AFRICA_HUBS.map((h) => {
              const cash = ofTotal(h.cash, h.branches);
              return (
                <tr key={h.label} className={`border-b border-[#dce8ed] last:border-0 hover:bg-[#f4f8fa]`}>
                  <td className="px-4 py-3 font-semibold text-[#0f9d8a]">{h.label}</td>
                  <td className="px-4 py-3">{h.admin}</td>
                  <td className={`px-4 py-3 ${h.last ? "" : "text-red-700"}`}>{h.last ?? "Not yet"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{(h.partners ?? partners).toLocaleString("en-US")}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${toneClass(cash.tone)}`}>{cash.value}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatGhs(h.giving)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
