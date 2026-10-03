export default function SectionHeading({ index, title, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-pixel text-3xl text-ink sm:text-4xl">
        <span className="mr-3 text-ember">{index}</span>
        {title}
      </h2>
      {children && <p className="mt-3 max-w-2xl text-mute">{children}</p>}
    </div>
  );
}
