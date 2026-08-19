export default function Loading() {
  return (
    <section className="container-page py-14" aria-label="Loading page" aria-busy="true">
      <div className="h-4 w-32 animate-pulse rounded bg-maroon/10" />
      <div className="mt-5 h-14 max-w-xl animate-pulse rounded bg-charcoal/8" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-md border border-charcoal/8 bg-white">
            <div className="aspect-[4/5] animate-pulse bg-charcoal/6" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-charcoal/8" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-maroon/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
