export default function BlogLoading() {
  return (
    <>
      <section className="pt-28 md:pt-36">
        <div className="container-tai flex flex-col items-center text-center">
          <div className="skeleton h-7 w-40 rounded-full" />
          <div className="skeleton mt-6 h-14 w-[min(90%,520px)]" />
          <div className="skeleton mt-4 h-5 w-[min(80%,420px)]" />
        </div>
      </section>
      <section className="container-tai mt-14">
        {/* Featured */}
        <div className="surface-card mb-8 grid gap-0 overflow-hidden lg:grid-cols-2">
          <div className="skeleton aspect-[16/10] rounded-none" />
          <div className="space-y-4 p-10">
            <div className="skeleton h-5 w-24 rounded-full" />
            <div className="skeleton h-8 w-5/6" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        </div>
        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-card overflow-hidden">
              <div className="skeleton aspect-[16/10] rounded-none" />
              <div className="space-y-3 p-6">
                <div className="skeleton h-4 w-20 rounded-full" />
                <div className="skeleton h-5 w-5/6" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
