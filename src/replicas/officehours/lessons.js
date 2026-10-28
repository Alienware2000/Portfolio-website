/*
 * Three scripted office-hours turns. Each beat is one spoken sentence (or a
 * student turn), and the board groups it names start writing when that
 * sentence starts, the same way the real voice loop applies DRAW tags at
 * audio start (app/(session)/voice/useVoiceLoop.ts). Nothing is on the board
 * before the tutor says it, and every tutor turn ends on a question.
 *
 * Board coordinates are a 1000 x 1000 square (the real board is a 1 x 1
 * viewBox). Notes pages are 612 x 792, a US Letter PDF page.
 */

export const TUTOR = { ink: "#292621", accent: "#b95832", muted: "#938b7d", warn: "#a77726" };
const PAGE_INK = "#1c1917";

const circle = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0`;
const boxes = (x0, y0, w, h, n) => {
  let d = `M${x0},${y0} H${x0 + w * n} V${y0 + h} H${x0} Z`;
  for (let i = 1; i < n; i++) d += ` M${x0 + w * i},${y0} V${y0 + h}`;
  return d;
};
const hatch = (x0, x1, y, step = 40, len = 24) => {
  let d = "";
  for (let x = x0 + step / 2; x < x1; x += step) d += ` M${x},${y} L${x - len * 0.8},${y + len}`;
  return d.trim();
};

/* ---------- 1. Chain rule (concept question, calculus) ---------- */

const chain = {
  id: "chain",
  chip: "Chain rule",
  ask: "Why isn't the derivative of sin(x²) just cos(x²)?",
  coverFrom: 6,
  poster: 10,
  groups: {
    head: [{ k: "label", x: 55, y: 100, s: 52, text: "Chain rule", heading: true }],
    f: [{ k: "math", x: 55, y: 240, s: 94, tex: "f(x) = \\sin(x^2)" }],
    u: [
      { k: "math", x: 55, y: 385, s: 84, tex: "u = x^2" },
      { k: "label", x: 330, y: 376, s: 38, text: "the inside function", c: TUTOR.muted },
    ],
    y: [{ k: "math", x: 55, y: 545, s: 84, tex: "y = \\sin u" }],
    dydu: [{ k: "math", x: 455, y: 545, s: 84, tex: "\\frac{dy}{du} = \\cos u" }],
    dudx: [{ k: "math", x: 55, y: 722, s: 84, tex: "\\frac{du}{dx} =" }],
    dydx: [{ k: "math", x: 55, y: 893, s: 84, tex: "\\frac{dy}{dx} = \\; ?" }],
  },
  ink: {
    loop: { kind: "loop", g: "f", from: 9, to: 10, pad: [26, 20] },
    two: { kind: "write", text: "2x", after: "dudx", dx: 30, dy: 16, k: 1.75 },
  },
  beats: [
    { who: "listen", dur: 1500, label: "Student asks out loud" },
    { who: "student", say: "Why isn't the derivative of sin(x²) just cos(x²)?", dur: 1100, label: "Transcribed, the tutor thinks" },
    { who: "tutor", say: "Good question. Let's write out what you're differentiating.", draw: ["head", "f"], dur: 2700, label: "Writes the function as it says it" },
    { who: "tutor", say: "There's a function sitting inside the sine. Which part is it?", dur: 2300, label: "Asks instead of telling" },
    { who: "listen", ink: ["loop"], dur: 1500, label: "Student circles it in their own ink" },
    { who: "student", say: "The x squared?", dur: 900, label: "Student answers" },
    { who: "tutor", say: "Yes. Call that inside part u.", draw: ["u"], dur: 2000, label: "Records the student's idea" },
    { who: "tutor", say: "Your cos(x²) is the outside rate: how y changes with u.", draw: ["y", "dydu"], dur: 2900, label: "Builds on what they got right" },
    { who: "tutor", say: "But x moves u, too. How fast does u change with x?", draw: ["dudx"], dur: 2500, label: "Leaves the next step open" },
    { who: "listen", ink: ["two"], dur: 1500, label: "Student writes 2x" },
    { who: "student", say: "It's 2x.", dur: 800, label: "Student answers" },
    { who: "tutor", say: "Right. Your lecture notes show how those two rates combine.", notes: true, draw: ["dydx"], dur: 2900, label: "Highlights the rule in their notes" },
    { who: "tutor", say: "So what should dy/dx be? Try writing it.", dur: 2100, label: "Hands the last step back" },
    { who: "hold", dur: 2400, label: "Waits for the student" },
  ],
  notes: {
    file: "calc-lecture-07.pdf",
    pages: 4,
    hl: { els: [10], pad: [14, 8] },
    els: [
      { k: "text", x: 54, y: 46, s: 9.5, text: "CALCULUS I  ·  LECTURE NOTES", c: "#78716c", ls: 1.2 },
      { k: "text", x: 558, y: 46, s: 9.5, text: "Lecture 7", c: "#78716c", anchor: "end" },
      { k: "rule", x1: 54, y1: 55, x2: 558, y2: 55 },
      { k: "text", x: 54, y: 100, s: 23, text: "7\u2003The Chain Rule", w: 600 },
      { k: "text", x: 54, y: 137, s: 13.5, text: "Many functions are built by putting one function inside another. To differentiate" },
      { k: "text", x: 54, y: 157, s: 13.5, text: "them, we track how a small change in x travels through each layer." },
      { k: "text", x: 54, y: 196, s: 15, text: "7.1\u2003Composite functions", w: 600 },
      { k: "text", x: 54, y: 222, s: 13.5, text: "If u = g(x) and y = f(u), then y = f(g(x)). We call g the inside function and f the" },
      { k: "text", x: 54, y: 241, s: 13.5, text: "outside function. Each one has its own rate of change." },
      { k: "box", x: 54, y: 264, w: 504, h: 131 },
      { k: "math", x: 306, y: 364, s: 23, tex: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}", anchor: "middle" },
      { k: "text", x: 68, y: 291, s: 13.5, spans: [{ t: "Theorem 7.1 (Chain rule). ", w: 600 }, { t: "If g is differentiable at x and f is differentiable at", it: true }] },
      { k: "text", x: 68, y: 310, s: 13.5, spans: [{ t: "u = g(x), then", it: true }] },
      { k: "text", x: 54, y: 423, s: 13.5, text: "In words: rates multiply. If u changes 3 times as fast as x, and y changes 2 times as" },
      { k: "text", x: 54, y: 443, s: 13.5, text: "fast as u, then y changes 6 times as fast as x." },
      { k: "text", x: 54, y: 481, s: 15, text: "Example 7.2", w: 600 },
      { k: "text", x: 54, y: 507, s: 13.5, text: "Differentiate y = (3x + 1)⁵. Take u = 3x + 1, so y = u⁵. Then dy/du = 5u⁴ and" },
      { k: "text", x: 54, y: 527, s: 13.5, text: "du/dx = 3, which gives dy/dx = 15(3x + 1)⁴." },
      { k: "text", x: 54, y: 565, s: 15, text: "7.3\u2003Practice", w: 600 },
      { k: "text", x: 54, y: 591, s: 13.5, text: "1.  Differentiate cos(5x) and check the factor of 5 numerically." },
      { k: "text", x: 54, y: 611, s: 13.5, text: "2.  Which layer contributes each factor in the derivative of (x² + 1)³?" },
    ],
  },
};

/* ---------- 2. Ball thrown straight up (homework-style, physics) ---------- */

const projectile = {
  id: "projectile",
  chip: "Projectile",
  ask: "If I throw a ball straight up at 12 m/s, how high does it go?",
  coverFrom: 7,
  poster: 7,
  groups: {
    head: [{ k: "label", x: 55, y: 100, s: 52, text: "Ball thrown straight up", heading: true }],
    ground: [
      { k: "path", d: "M90,862 L470,862", w: 4.5 },
      { k: "path", d: hatch(90, 470, 866, 38, 22), w: 2.6, c: TUTOR.muted },
    ],
    ball: [
      { k: "fill", d: circle(280, 834, 26), c: "#ece3d3" },
      { k: "path", d: circle(280, 834, 26), w: 4 },
    ],
    v0: [
      { k: "path", d: "M280,800 L280,624", w: 5, c: TUTOR.accent },
      { k: "head", d: "M280,598 L266,630 L294,630 Z", c: TUTOR.accent },
      { k: "label", x: 310, y: 722, s: 42, text: "v₀ = 12 m/s", anchor: "start" },
    ],
    path: [{ k: "path", d: "M280,578 L280,268", w: 3.5, c: TUTOR.muted, dashed: true }],
    top: [
      { k: "path", d: circle(280, 236, 26), w: 3.5, c: TUTOR.warn, dashed: true },
      { k: "label", x: 240, y: 248, s: 40, text: "top", c: TUTOR.warn, anchor: "end" },
    ],
    vtop: [{ k: "math", x: 575, y: 545, s: 64, tex: "v_{\\text{top}} = 0" }],
    g: [{ k: "math", x: 575, y: 665, s: 64, tex: "g = 9.8\\,\\text{m/s}^2" }],
    dy: [{ k: "math", x: 575, y: 795, s: 64, tex: "\\Delta y = \\; ?" }],
  },
  ink: {
    arrow: { kind: "path", strokes: [{ d: "M520,306 C470,282 410,256 334,242", dur: 420 }, { d: "M356,228 C349,233 342,238 334,242 C341,246 348,251 354,258", dur: 200 }] },
    v: { kind: "write", text: "v = 0", x: 530, y: 372, k: 1.3 },
  },
  beats: [
    { who: "listen", dur: 1500, label: "Student asks out loud" },
    { who: "student", say: "If I throw a ball straight up at 12 m/s, how high does it go?", dur: 1100, label: "Transcribed, the tutor thinks" },
    { who: "tutor", say: "Let's sketch it before any equations.", draw: ["head", "ground", "ball"], dur: 2600, label: "Sketches the situation first" },
    { who: "tutor", say: "You launch it upward at 12 meters per second.", draw: ["v0"], dur: 2300, label: "Uses the student's own number" },
    { who: "tutor", say: "It rises, slows down, and turns around at a top point.", draw: ["path", "top"], dur: 2600, label: "Draws the motion as it narrates" },
    { who: "tutor", say: "What is the ball's velocity right at the top?", dur: 2100, label: "Asks for a prediction" },
    { who: "listen", ink: ["arrow", "v"], dur: 1900, label: "Student marks the top in their ink" },
    { who: "student", say: "Zero? It stops for an instant.", dur: 1000, label: "Student answers" },
    { who: "tutor", say: "Exactly, and that's the condition you'll use.", draw: ["vtop"], dur: 2300, label: "Records the student's idea" },
    { who: "tutor", say: "Gravity is what slows it, at 9.8 meters per second squared.", draw: ["g"], dur: 2600, label: "Adds only the given" },
    { who: "tutor", say: "One equation in your notes links v, v₀, and height without time. Which one?", notes: true, draw: ["dy"], dur: 3300, label: "Points at the notes, doesn't pick" },
    { who: "hold", dur: 2600, label: "Waits for the student" },
  ],
  notes: {
    file: "mechanics-notes-3.pdf",
    pages: 6,
    hl: { els: [9, 10, 11], pad: [18, 9] },
    els: [
      { k: "text", x: 54, y: 46, s: 9.5, text: "MECHANICS  ·  COURSE NOTES", c: "#78716c", ls: 1.2 },
      { k: "text", x: 558, y: 46, s: 9.5, text: "Notes 3", c: "#78716c", anchor: "end" },
      { k: "rule", x1: 54, y1: 55, x2: 558, y2: 55 },
      { k: "text", x: 54, y: 100, s: 23, text: "3\u2003Motion with Constant Acceleration", w: 600 },
      { k: "text", x: 54, y: 137, s: 13.5, text: "When acceleration is constant, position and velocity follow a small set of equations." },
      { k: "text", x: 54, y: 157, s: 13.5, text: "Pick the one that contains what you know and what you want to find." },
      { k: "text", x: 54, y: 196, s: 15, text: "3.1\u2003The kinematics equations", w: 600 },
      { k: "box", x: 54, y: 214, w: 504, h: 164 },
      { k: "text", x: 68, y: 238, s: 11.5, text: "Constant acceleration a, starting velocity v₀", c: "#78716c", it: true },
      { k: "math", x: 306, y: 273, s: 21.3, tex: "v = v_0 + a t", anchor: "middle" },
      { k: "math", x: 306, y: 319, s: 21.3, tex: "\\Delta y = v_0 t + \\frac{1}{2} a t^2", anchor: "middle" },
      { k: "math", x: 306, y: 362, s: 21.3, tex: "v^2 = v_0^2 + 2 a \\, \\Delta y", anchor: "middle" },
      { k: "text", x: 54, y: 406, s: 13.5, text: "Each equation leaves out one of the five quantities v₀, v, a, t, and Δy." },
      { k: "text", x: 54, y: 445, s: 15, text: "3.2\u2003Free fall", w: 600 },
      { k: "text", x: 54, y: 471, s: 13.5, text: "Near Earth's surface a thrown object accelerates downward with a = −g, where" },
      { k: "text", x: 54, y: 491, s: 13.5, text: "g = 9.8 m/s². Take up as positive and keep the sign of every velocity." },
      { k: "text", x: 54, y: 529, s: 15, text: "3.3\u2003Worked example", w: 600 },
      { k: "text", x: 54, y: 555, s: 13.5, text: "A cart starts from rest and speeds up at 2 m/s² for 5 s. How far does it travel?" },
      { k: "text", x: 54, y: 575, s: 13.5, text: "Known: v₀ = 0, a = 2 m/s², t = 5 s. Wanted: Δy. The second equation has all four." },
    ],
  },
};

/* ---------- 3. Binary search (concept question, CS) ---------- */

const VALUES = [3, 7, 9, 12, 15, 18, 21, 26, 30, 33, 37, 41, 46, 50, 54, 59];
const cell = (i) => 60 + 55 * i + 27.5;

const search = {
  id: "search",
  chip: "Binary search",
  ask: "Why is binary search log n and not n over 2?",
  coverFrom: 6,
  poster: 7,
  groups: {
    head: [{ k: "label", x: 55, y: 100, s: 52, text: "Binary search", heading: true }],
    row: [{ k: "path", d: boxes(60, 180, 55, 72, 16), w: 3.5 }],
    nums: [{ k: "label", y: 227, s: 29, anchor: "middle", runs: VALUES.map((v, i) => ({ x: cell(i), text: String(v) })) }],
    mid: [
      { k: "path", d: "M472,120 L472,152", w: 4.5, c: TUTOR.accent },
      { k: "head", d: "M472,174 L461,148 L483,148 Z", c: TUTOR.accent },
      { k: "label", x: 496, y: 146, s: 32, text: "middle", c: TUTOR.accent, anchor: "start" },
    ],
    cut: [
      { k: "fill", d: "M500,180 H940 V252 H500 Z", c: TUTOR.muted, o: 0.16 },
      { k: "path", d: "M500,252 L572,180 M555,252 L627,180 M610,252 L682,180 M665,252 L737,180 M720,252 L792,180 M775,252 L847,180 M830,252 L902,180 M885,252 L940,197", w: 2, c: TUTOR.muted },
      { k: "label", x: 720, y: 300, s: 34, text: "can't hold the target", c: TUTOR.muted, anchor: "middle" },
    ],
    row2: [
      { k: "path", d: "M280,266 L280,352", w: 3.5 },
      { k: "head", d: "M280,372 L270,348 L290,348 Z", c: TUTOR.ink },
      { k: "path", d: boxes(60, 382, 55, 72, 8), w: 3.5 },
      { k: "label", y: 429, s: 29, anchor: "middle", runs: VALUES.slice(0, 8).map((v, i) => ({ x: cell(i), text: String(v) })) },
      { k: "label", x: 530, y: 430, s: 38, text: "8 left", c: TUTOR.muted, anchor: "start" },
    ],
    chain: [{ k: "math", x: 55, y: 725, s: 72, tex: "16 \\to 8 \\to 4 \\to 2 \\to 1" }],
    k: [
      { k: "math", x: 55, y: 868, s: 72, tex: "k = \\; ?" },
      { k: "label", x: 265, y: 860, s: 36, text: "guesses until one item is left", c: TUTOR.muted, anchor: "start" },
    ],
  },
  ink: {
    counts: { kind: "write", text: "4, 2, 1", x: 72, y: 585, k: 1.6 },
  },
  beats: [
    { who: "listen", dur: 1400, label: "Student asks out loud" },
    { who: "student", say: "Why is binary search log n and not n over 2?", dur: 1100, label: "Transcribed, the tutor thinks" },
    { who: "tutor", say: "Picture a sorted list of sixteen items.", draw: ["head", "row", "nums"], dur: 2800, label: "Draws the list as it describes it" },
    { who: "tutor", say: "Each guess checks the middle one.", draw: ["mid"], dur: 2000, label: "Points at the middle" },
    { who: "tutor", say: "Then it throws away the half that can't hold the target.", draw: ["cut", "row2"], dur: 3000, label: "Shows one halving, not the pattern" },
    { who: "tutor", say: "How many are left after the next guess? And the one after that?", dur: 2300, label: "Lets the student find the pattern" },
    { who: "listen", ink: ["counts"], dur: 1900, label: "Student writes the counts" },
    { who: "student", say: "Four, then two, then one.", dur: 1000, label: "Student answers" },
    { who: "tutor", say: "Good. You just counted four guesses for sixteen items.", draw: ["chain"], dur: 2700, label: "Records the student's idea" },
    { who: "tutor", say: "Your notes write what's left after k guesses. When does it reach one?", notes: true, draw: ["k"], dur: 3200, label: "Highlights the line in their notes" },
    { who: "hold", dur: 2600, label: "Waits for the student" },
  ],
  notes: {
    file: "week-4-searching.pdf",
    pages: 3,
    hl: { els: [13], pad: [14, 8] },
    els: [
      { k: "text", x: 54, y: 46, s: 9.5, text: "DATA STRUCTURES  ·  WEEK 4", c: "#78716c", ls: 1.2 },
      { k: "text", x: 558, y: 46, s: 9.5, text: "Searching", c: "#78716c", anchor: "end" },
      { k: "rule", x1: 54, y1: 55, x2: 558, y2: 55 },
      { k: "text", x: 54, y: 100, s: 23, text: "4.2\u2003Binary Search", w: 600 },
      { k: "text", x: 54, y: 137, s: 13.5, text: "Binary search finds a target in a sorted array. Each step compares the target with the" },
      { k: "text", x: 54, y: 157, s: 13.5, text: "middle element and discards the half that cannot contain it." },
      { k: "box", x: 54, y: 177, w: 504, h: 119, fill: "#f3ede2" },
      { k: "text", x: 70, y: 203, s: 11.5, mono: true, text: "def search(a, target):" },
      { k: "text", x: 70, y: 222, s: 11.5, mono: true, text: "    lo, hi = 0, len(a) - 1" },
      { k: "text", x: 70, y: 240, s: 11.5, mono: true, text: "    while lo <= hi:" },
      { k: "text", x: 70, y: 259, s: 11.5, mono: true, text: "        mid = (lo + hi) // 2" },
      { k: "text", x: 70, y: 278, s: 11.5, mono: true, text: "        if a[mid] == target: return mid" },
      { k: "text", x: 54, y: 324, s: 13.5, text: "How many candidates survive? Each comparison keeps at most half of them:" },
      { k: "math", x: 306, y: 374, s: 20.2, tex: "\\text{left after } k \\text{ guesses} \\le \\frac{n}{2^k}", anchor: "middle" },
      { k: "text", x: 54, y: 420, s: 13.5, text: "Compare this with linear search, which may check every element once." },
      { k: "text", x: 54, y: 459, s: 15, text: "4.3\u2003Exercises", w: 600 },
      { k: "text", x: 54, y: 485, s: 13.5, text: "1.  Trace binary search for 41 in the array from lecture." },
      { k: "text", x: 54, y: 505, s: 13.5, text: "2.  What changes if the array has duplicates?" },
    ],
  },
};

export const LESSONS = [chain, projectile, search];
export { PAGE_INK };
