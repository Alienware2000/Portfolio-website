import { lazy, Suspense, useMemo } from "react";

// Dev-only bench: renders one product replica at the sizes the site uses, so it
// can be screenshotted and reviewed on its own. /lab/replica?name=CloudAgent
const modules = import.meta.glob("../replicas/*.jsx");

function Frame({ width, label, children }) {
  return (
    <div style={{ width }} className="shrink-0">
      <p className="label mb-2">{label} · {width}px</p>
      <div className="media-frame">
        <div className="relative aspect-[16/10] overflow-hidden bg-black">{children}</div>
      </div>
    </div>
  );
}

export default function ReplicaBench() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const only = params.get("mode");
  const Replica = useMemo(() => {
    const key = `../replicas/${name}.jsx`;
    return modules[key] ? lazy(modules[key]) : null;
  }, [name]);

  if (!Replica) {
    return (
      <main className="p-8 font-mono text-sm text-ink">
        <p className="mb-4">Replicas:</p>
        {Object.keys(modules).map((k) => {
          const n = k.split("/").pop().replace(".jsx", "");
          return <p key={k}><a className="text-ember" href={`/lab/replica?name=${n}`}>{n}</a></p>;
        })}
      </main>
    );
  }
  return (
    <main className="space-y-10 bg-night p-8">
      <Suspense fallback={<p className="text-mute">loading</p>}>
        {(!only || only === "cover") && (
          <div className="flex flex-wrap items-start gap-8">
            <Frame width={560} label="cover (card)"><Replica mode="cover" playing /></Frame>
            <Frame width={360} label="cover (phone)"><Replica mode="cover" playing /></Frame>
          </div>
        )}
        {(!only || only === "full") && (
          <Frame width={1040} label="full (case study)"><Replica mode="full" playing /></Frame>
        )}
      </Suspense>
    </main>
  );
}
