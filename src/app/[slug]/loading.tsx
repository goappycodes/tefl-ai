export default function PostLoading() {
  return (
    <article className="pt-28 md:pt-32">
      <div className="container-tai max-w-3xl">
        <div className="skeleton h-4 w-28" />
        <div className="mt-6 flex gap-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-3/4" />
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="skeleton h-4 w-40" />
        </div>
      </div>
      <div className="container-tai mt-10 max-w-4xl">
        <div className="skeleton aspect-[16/8] w-full rounded-[var(--radius-xl)]" />
      </div>
      <div className="container-tai mt-12 max-w-3xl space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`skeleton h-4 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </article>
  );
}
