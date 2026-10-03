import { encode, slot, write } from "./design.js";

/** Two copies of the real site, each rendered with one saved design slot. */
export default function Compare() {
  const sides = ["a", "b"].map((name) => ({ name, d: encode(slot(name)) }));
  const use = (d) => {
    write("design", d);
    window.location.href = "/lab";
  };

  return (
    <div className="flex h-screen flex-col bg-night font-mono text-xs">
      <div className="flex items-center gap-4 border-b-2 border-line px-4 py-2.5">
        <p className="uppercase tracking-widest text-ember">Design Lab // Compare</p>
        <a href="/lab" className="ml-auto border border-line px-3 py-1.5 text-ink hover:border-ember">Back to lab</a>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px bg-line md:grid-cols-2">
        {sides.map(({ name, d }) => (
          <div key={name} className="flex min-h-0 flex-col bg-night">
            <div className="flex items-center gap-3 px-4 py-2">
              <span className="bg-ember px-2 py-0.5 uppercase text-night">{name}</span>
              <span className="min-w-0 truncate text-mute">{d}</span>
              <button type="button" onClick={() => use(d)} className="ml-auto shrink-0 border border-line px-3 py-1 text-ink hover:border-ember">Use this one</button>
            </div>
            <iframe title={`Design ${name}`} src={`/?embed=1&d=${encodeURIComponent(d)}`} className="min-h-0 w-full flex-1 border-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
