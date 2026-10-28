import { useEffect, useMemo, useState } from "react";

const NODE_W = 148;
const NODE_H = 58;
const GAP_X = 92;
const GAP_Y = 26;

const MAX_COLS = 4;
const SKIP_RISE = 46;
const BAND_GAP = 56;

/**
 * Column = longest path from a source, so data flows left to right.
 * Long chains wrap into a second band below instead of shrinking into unreadable text.
 */
function layout(nodes, edges) {
  const layer = Object.fromEntries(nodes.map((n) => [n.id, 0]));
  for (let pass = 0; pass < nodes.length; pass++) {
    for (const e of edges) {
      if (layer[e.to] < layer[e.from] + 1) layer[e.to] = layer[e.from] + 1;
    }
  }
  const cols = [];
  for (const n of nodes) (cols[layer[n.id]] ||= []).push(n);
  const bands = Math.ceil(cols.length / MAX_COLS);
  const bandRows = Array.from({ length: bands }, (_, b) =>
    Math.max(...cols.slice(b * MAX_COLS, (b + 1) * MAX_COLS).map((c) => c.length))
  );
  const bandTop = bandRows.map((_, b) => bandRows.slice(0, b).reduce((y, r) => y + r * (NODE_H + GAP_Y) - GAP_Y + BAND_GAP, 0));
  const pos = {};
  cols.forEach((col, ci) => {
    const band = Math.floor(ci / MAX_COLS);
    const offset = ((bandRows[band] - col.length) * (NODE_H + GAP_Y)) / 2;
    col.forEach((n, ri) => {
      pos[n.id] = { col: ci % MAX_COLS, row: ri, offset, band, top: bandTop[band] };
    });
  });
  const width = Math.min(cols.length, MAX_COLS);
  const height = bandTop[bands - 1] + bandRows[bands - 1] * (NODE_H + GAP_Y) - GAP_Y;
  return { pos, cols: width, rows: Math.max(...bandRows), height, flatCols: cols.length };
}

function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setNarrow(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

/**
 * Boxes-and-arrows system diagram from a small spec:
 * { nodes: [{ id, label, tech, mine }], edges: [{ from, to, label }], caption }
 * Nodes David built are filled with the accent. On phones the flow turns vertical.
 */
export default function ArchDiagram({ spec }) {
  const narrow = useNarrow();
  const { nodes, edges, caption } = spec;
  const L = useMemo(() => layout(nodes, edges), [nodes, edges]);
  const { pos } = L;
  const narrowRows = Math.max(...Object.values(pos).map((p) => p.row + 1));

  // On phones the flow runs top to bottom, one layer per row
  const place = (id) => {
    const p = pos[id];
    if (narrow) {
      const layerIndex = p.band * MAX_COLS + p.col;
      return { x: p.row * (NODE_W + 16), y: layerIndex * (NODE_H + GAP_X) };
    }
    return { x: p.col * (NODE_W + GAP_X), y: p.top + p.row * (NODE_H + GAP_Y) + p.offset };
  };
  const width = narrow ? narrowRows * (NODE_W + 16) - 16 : L.cols * (NODE_W + GAP_X) - GAP_X;
  const height = narrow ? L.flatCols * (NODE_H + GAP_X) - GAP_X : L.height;
  const pad = 8;
  const wraps = narrow ? [] : edges.filter((e) => pos[e.from].band !== pos[e.to].band);
  const padRight = wraps.length ? 22 + wraps.length * 9 : pad;
  const padLeft = wraps.some((e) => pos[e.to].row > 0) ? 22 + wraps.length * 9 : pad;
  const hasSkip = !narrow && edges.some((e) => pos[e.from].band === pos[e.to].band && Math.abs(pos[e.to].col - pos[e.from].col) > 1);
  const padTop = hasSkip ? SKIP_RISE : pad;

  const edgePath = (e) => {
    const a = place(e.from);
    const b = place(e.to);
    if (narrow) {
      const down = b.y >= a.y;
      const x1 = a.x + NODE_W / 2, y1 = down ? a.y + NODE_H : a.y;
      const x2 = b.x + NODE_W / 2, y2 = down ? b.y : b.y + NODE_H;
      const my = (y1 + y2) / 2;
      return { d: `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`, lx: (x1 + x2) / 2, ly: my };
    }
    if (pos[e.to].band !== pos[e.from].band) {
      // Wrapping to the next band: out the right side, down the outer margin, then along
      // the gap between bands, so the line never crosses another box
      const k = wraps.indexOf(e);
      const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2;
      const rail = width + 14 + k * 9;
      const gapY = pos[e.to].top - BAND_GAP / 2 + k * 8 - ((wraps.length - 1) * 8) / 2;
      const r = 6;
      const out = `M${x1},${y1} H${rail - r} Q${rail},${y1} ${rail},${y1 + r} V${gapY - r} Q${rail},${gapY} ${rail - r},${gapY}`;
      // Spread labels along the gap so parallel wraps never stack their text
      const lx = rail - 70 - k * 150;
      if (pos[e.to].row > 0) {
        // Target sits under another box: come in from the left side instead of dropping through it
        const left = -14 - k * 9;
        const ty = b.y + NODE_H / 2;
        return {
          d: `${out} H${left + r} Q${left},${gapY} ${left},${gapY + r} V${ty - r} Q${left},${ty} ${left + r},${ty} H${b.x}`,
          lx,
          ly: gapY,
        };
      }
      const x2 = b.x + NODE_W / 2, y2 = b.y;
      return { d: `${out} H${x2 + r} Q${x2},${gapY} ${x2},${gapY + r} V${y2}`, lx, ly: gapY };
    }
    if (Math.abs(pos[e.to].col - pos[e.from].col) > 1) {
      // Skipping a column: arc over the boxes in between instead of through them
      const x1 = a.x + NODE_W / 2, y1 = a.y;
      const x2 = b.x + NODE_W / 2, y2 = b.y;
      const peak = pos[e.from].top - SKIP_RISE;
      return { d: `M${x1},${y1} C${x1},${peak} ${x2},${peak} ${x2},${y2}`, lx: (x1 + x2) / 2, ly: y1 + 0.75 * (peak - y1) + 4 };
    }
    const right = b.x >= a.x;
    const x1 = right ? a.x + NODE_W : a.x, y1 = a.y + NODE_H / 2;
    const x2 = right ? b.x : b.x + NODE_W, y2 = b.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    return { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, lx: mx, ly: (y1 + y2) / 2 };
  };

  return (
    <figure className="arch">
      <div className="overflow-x-auto">
        <svg
          viewBox={`${-padLeft} ${-padTop} ${width + padLeft + padRight} ${height + pad + padTop}`}
          width={width + padLeft + padRight}
          className="mx-auto block h-auto max-w-full"
          role="img"
          aria-label={`System diagram: ${edges.map((e) => `${nodes.find((n) => n.id === e.from).label} to ${nodes.find((n) => n.id === e.to).label}${e.label ? ` (${e.label})` : ""}`).join("; ")}`}
        >
          <defs>
            <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" className="fill-mute" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const { d } = edgePath(e);
            const begin = `${i * 0.35}s`;
            return (
              <g key={i}>
                <path d={d} className="arch-edge" markerEnd="url(#arrow)" />
                {/* Hidden until its motion starts, so it never sits at the origin */}
                <circle r="2.5" className="arch-packet" visibility="hidden">
                  <set attributeName="visibility" to="visible" begin={begin} />
                  <animateMotion dur={`${2.4 + (i % 3) * 0.5}s`} repeatCount="indefinite" path={d} begin={begin} />
                </circle>
              </g>
            );
          })}
          {/* Labels go above every line, on a backing so crossing lines never cut through them */}
          {edges.map((e, i) => {
            if (!e.label) return null;
            const { lx, ly } = edgePath(e);
            const w = e.label.length * 6.4 + 10;
            return (
              <g key={`l${i}`}>
                <rect x={lx - w / 2} y={ly - 16} width={w} height={15} rx="2" className="arch-edge-label-bg" />
                <text x={lx} y={ly - 5} textAnchor="middle" className="arch-edge-label">
                  {e.label}
                </text>
              </g>
            );
          })}
          {nodes.map((n) => {
            const { x, y } = place(n.id);
            return (
              <g key={n.id} transform={`translate(${x},${y})`}>
                <rect width={NODE_W} height={NODE_H} rx="3" className={n.mine ? "arch-node arch-node-mine" : "arch-node"} />
                <text x={NODE_W / 2} y={n.tech ? 24 : 34} textAnchor="middle" className="arch-label">
                  {n.label}
                </text>
                {n.tech && (
                  <text x={NODE_W / 2} y={42} textAnchor="middle" className="arch-tech">
                    {n.tech}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-mute">
        <span className="inline-flex items-center gap-2 font-mono text-xs">
          <span className="inline-block h-3 w-3 border border-ember bg-ember/20" aria-hidden="true" /> I built this
        </span>
        {caption && <span>{caption}</span>}
      </figcaption>
    </figure>
  );
}
