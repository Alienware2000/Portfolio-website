import {
  BotIcon,
  BrainIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  FilePenIcon,
  FileTextIcon,
  GlobeIcon,
  HammerIcon,
  KeyboardIcon,
  ListChecksIcon,
  Loader2Icon,
  MouseIcon,
  MousePointerClickIcon,
  MoveVerticalIcon,
  PlayIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldQuestionIcon,
  ShieldXIcon,
  SquareChevronRightIcon,
  SquareIcon,
  TimerIcon,
  UserIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { Screen } from "./Desktop.jsx";

// Tokens from the real globals.css (shadcn neutral, light theme), as hex.
const MUTED = "text-[#737373]";
const BORDER = "border-[#e5e5e5]";
const GREEN = "text-[#00a63e]";
const RED = "text-[#e7000b]";

export function Spinner({ className = "" }) {
  return <Loader2Icon className={`animate-spin ${className}`} />;
}

export function Panel({ className = "", style, children }) {
  return <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-[6px] border ${BORDER} ${className}`} style={style}>{children}</div>;
}

export function PanelHeader({ children }) {
  return (
    <div className={`flex shrink-0 items-center gap-2 border-b ${BORDER} bg-[#f5f5f5] px-2.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-tight text-[#171717]`}>
      {children}
    </div>
  );
}

/** One chat message: the real "YOU" / "AGENT" header, then its parts. */
export function Message({ msg, mi, live, task, open, onToggle, onFix, onRetry }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase">
        {msg.role === "user" ? <UserIcon className="size-3.5" /> : <BotIcon className="size-3.5" />}
        {msg.role === "user" ? "You" : "Agent"}
      </div>
      {msg.parts.map((part, i) => (
        <Part
          // Parts are append-only within a message.
          key={`${mi}-${i}`}
          part={part}
          running={live && i === msg.parts.length - 1 && part.type === "tool"}
          phase={live ? msg.parts.find((p) => p.type === "phase")?.phase : undefined}
          task={task}
          open={open}
          onToggle={onToggle}
          onFix={onFix}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}

function Part({ part, running, phase, task, open, onToggle, onFix, onRetry }) {
  if (part.type === "text") return <TextPart text={part.text} />;
  if (part.type === "phase") return <PhasePart phase={part.phase} />;
  if (part.type === "checklist") return <ChecklistPart items={part.items} building={phase === "building"} />;
  if (part.type === "reasoning") return <ReasoningPart text={part.text} />;
  if (part.type === "verification") return <VerificationPart card={part} task={task} open={open} onToggle={onToggle} onFix={onFix} onRetry={onRetry} />;
  if (part.type === "tool") return <ToolPart part={part} running={running} task={task} />;
  return null;
}

/* Streamdown renders markdown; this covers what the script uses: paragraphs, `code`, bare URLs. */
function TextPart({ text }) {
  return (
    <div className="space-y-3 text-sm leading-5">
      {text.split("\n\n").map((para) => (
        <p key={para}>
          {para.split(/(`[^`]+`|https?:\/\/\S+)/).map((bit, i) =>
            bit.startsWith("`") ? (
              <code key={i} className="rounded bg-[#f5f5f5] px-1 py-0.5 font-mono text-[0.85em]">{bit.slice(1, -1)}</code>
            ) : bit.startsWith("http") ? (
              <span key={i} className="font-medium underline underline-offset-2">{bit}</span>
            ) : (
              bit
            ),
          )}
        </p>
      ))}
    </div>
  );
}

// One live line telling the user where the turn is. "done" renders nothing.
const PHASES = {
  planning: { Icon: ListChecksIcon, label: "Planning, defining what done means…" },
  building: { Icon: HammerIcon, label: "Building…" },
  verifying: { Icon: ShieldCheckIcon, label: "Verifying, fresh eyes on the result…" },
};

function PhasePart({ phase }) {
  if (phase === "done") return null;
  const { Icon, label } = PHASES[phase];
  return (
    <div className={`flex items-center gap-1.5 font-mono text-xs ${MUTED}`}>
      <Icon className="size-3.5" />
      <span className="ca-shimmer">{label}</span>
      <Spinner className="ml-auto mr-0.5 size-3.5" />
    </div>
  );
}

function ChecklistPart({ items, building }) {
  const done = items.filter((i) => i.passes).length;
  return (
    <div className={`rounded-[8px] border ${BORDER} p-3`}>
      <div className={`mb-2 flex items-center gap-1.5 font-mono text-xs ${MUTED}`}>
        <ListChecksIcon className="size-3.5" />
        <span>Definition of done</span>
        <span className="ml-auto">{done}/{items.length}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm leading-5">
            {item.passes ? (
              <CheckIcon className={`mt-0.5 size-3.5 shrink-0 ${GREEN}`} />
            ) : (
              // In-progress look while the builder works; the checkmark is earned only by evidence.
              <SquareIcon className={`mt-0.5 size-3.5 shrink-0 ${building ? "animate-pulse text-[#fe9a00]/80" : "text-[#737373]/50"}`} />
            )}
            <span className={item.passes ? MUTED : ""}>{item.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const VERDICTS = {
  verified: { label: "Verified", Icon: ShieldCheckIcon, cls: "border-[#00a63e]/20 bg-[#00a63e]/10 text-[#00a63e]" },
  partial: { label: "Partially verified", Icon: ShieldAlertIcon, cls: "border-[#fe9a00]/20 bg-[#fe9a00]/10 text-[#e17100]" },
  failed: { label: "Failed", Icon: ShieldXIcon, cls: "border-[#e7000b]/20 bg-[#e7000b]/10 text-[#e7000b]" },
  unable_to_verify: { label: "Unable to verify", Icon: ShieldQuestionIcon, cls: "border-[#e5e5e5] bg-[#f5f5f5] text-[#737373]" },
};

function VerificationPart({ card, task, open, onToggle, onFix, onRetry }) {
  const { report } = card;
  const v = VERDICTS[report.verdict];
  const passes = report.checks.filter((c) => c.status === "pass").length;
  return (
    <div className={`rounded-[8px] border ${BORDER} p-3`}>
      <div className={`mb-2 flex items-center gap-1.5 font-mono text-xs ${MUTED}`}>
        <ShieldCheckIcon className="size-3.5" />
        <span>Verification</span>
        <span className={`ml-auto inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${v.cls}`}>
          <v.Icon className="size-3" />
          {v.label}
        </span>
      </div>
      <div className={`mb-2 font-mono text-xs ${MUTED}`}>
        {passes}/{report.checks.length} checks passed · {report.appUrl}
      </div>
      <ul className="space-y-1.5">
        {report.checks.map((check) => {
          const key = `${card.id}:${check.itemId}`;
          return <CheckRow key={key} check={check} task={task} open={!!open[key]} onToggle={() => onToggle(key)} />;
        })}
      </ul>
      <div className="mt-3 flex gap-2">
        {report.verdict !== "verified" && (
          <Btn primary disabled={!onFix} onClick={onFix}>
            <WrenchIcon className="size-3.5" />
            Fix and re-verify
          </Btn>
        )}
        <Btn disabled={!onRetry} onClick={onRetry}>
          <RefreshCwIcon className="size-3.5" />
          Retry verification
        </Btn>
      </div>
    </div>
  );
}

/** The real Button, size "sm": default (primary) or outline. */
function Btn({ primary, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-7 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[8px] border px-2.5 text-[0.8rem] font-medium transition-all active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${
        primary ? "border-transparent bg-[#171717] text-[#fafafa] hover:bg-[#171717]/80" : `${BORDER} bg-white hover:bg-[#f5f5f5]`
      }`}
    >
      {children}
    </button>
  );
}

function CheckRow({ check, task, open, onToggle }) {
  return (
    <li>
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-2 text-left text-sm leading-5">
        {check.status === "pass" ? (
          <CheckIcon className={`mt-0.5 size-3.5 shrink-0 ${GREEN}`} />
        ) : check.status === "fail" ? (
          <XIcon className={`mt-0.5 size-3.5 shrink-0 ${RED}`} />
        ) : (
          <CircleHelpIcon className={`mt-0.5 size-3.5 shrink-0 ${MUTED}`} />
        )}
        <span className="min-w-0 flex-1">{check.description}</span>
        <ChevronRightIcon className={`mt-0.5 size-3 shrink-0 transition-transform ${MUTED} ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className={`ml-[22px] mt-1.5 flex flex-col gap-1.5 border-l-2 ${BORDER} pl-3`}>
          <p className={`text-xs leading-4 ${MUTED}`}>{check.evidence}</p>
          {check.shot ? (
            // Harness-captured at the moment record_check was called.
            <div className={`w-fit overflow-hidden rounded-[6px] border ${BORDER}`} role="img" aria-label={`Evidence: ${check.description}`}>
              <Screen desk={check.shot} task={task} width={256} />
            </div>
          ) : (
            <p className="text-xs italic text-[#737373]/70">no screenshot captured</p>
          )}
        </div>
      )}
    </li>
  );
}

function ReasoningPart({ text }) {
  return (
    <details className="group/r">
      <summary className={`flex cursor-pointer list-none items-center gap-1.5 font-mono text-xs ${MUTED} hover:text-[#0a0a0a] [&::-webkit-details-marker]:hidden`}>
        <BrainIcon className="size-3.5" />
        <span>Reasoning</span>
        <ChevronRightIcon className="size-3 transition-transform group-open/r:rotate-90" />
      </summary>
      <div className={`mt-1.5 border-l-2 ${BORDER} pl-3 text-xs ${MUTED}`}>{text}</div>
    </details>
  );
}

const TOOLS = {
  goto: [GlobeIcon, (a) => `goto ${a}`],
  click: [MousePointerClickIcon, (a) => `click ${a}`],
  type: [KeyboardIcon, (a) => `type "${a}"`],
  press: [MouseIcon, (a) => `press ${a}`],
  scroll: [MoveVerticalIcon, (a) => `scroll ${a}`],
  write_file: [FilePenIcon, (a) => `write ${a}`],
  read_file: [FileTextIcon, (a) => `read ${a}`],
  run_background: [PlayIcon, (a) => `run (bg) ${a}`],
  read_logs: [ScrollTextIcon, (a) => `logs pid ${a}`],
  wait: [TimerIcon, (a) => `wait ${a}s`],
  exec: [SquareChevronRightIcon, (a) => `$ ${a}`],
  screenshot: [CameraIcon, () => "screenshot"],
};

function ToolPart({ part, running, task }) {
  const [Icon, label] = TOOLS[part.tool];
  const failed = part.tool === "exec" && part.exit !== 0;
  return (
    <div className={`flex min-w-0 items-start gap-2 font-mono text-xs leading-4 ${MUTED}`}>
      <span className="mt-0.5 shrink-0"><Icon className="size-3.5" /></span>
      {part.tool === "screenshot" ? (
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span>screenshot</span>
          {!running && part.shot && (
            <div className={`w-fit overflow-hidden rounded-[6px] border ${BORDER}`}>
              <Screen desk={part.shot} task={task} width={232} />
            </div>
          )}
        </div>
      ) : part.tool === "exec" ? (
        <details className="min-w-0 flex-1">
          <summary className="block max-w-full cursor-pointer list-none truncate hover:text-[#0a0a0a] [&::-webkit-details-marker]:hidden">
            {label(part.arg)}
            {!running && ` → exit ${part.exit}`}
          </summary>
          <pre className="mt-1 whitespace-pre-wrap rounded-[6px] bg-[#f5f5f5] p-2 text-xs">{part.out}</pre>
        </details>
      ) : (
        <span className="truncate">{label(part.arg)}</span>
      )}
      <span className="ml-auto mt-0.5 shrink-0">
        {running ? <Spinner className="size-3.5" /> : failed ? <XIcon className={`size-3.5 ${RED}`} /> : <CheckIcon className="size-3.5" />}
      </span>
    </div>
  );
}
