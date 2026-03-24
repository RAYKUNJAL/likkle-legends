import { TATTOO_BOOKING_URL, TATTOO_COVERUP_CASE_STUDIES } from "@/lib/tattoo-site";

export function CoverupCaseStudies() {
  return (
    <section id="coverup-cases" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">Cover-Up Case Studies</p>
        <h2 className="mt-3 text-4xl font-black uppercase text-[#f8f3ea]">Before and after style transformations</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-stone-300">
          Real cover-up examples to show how we rebuild old work into stronger designs with better flow, contrast, and readability.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {TATTOO_COVERUP_CASE_STUDIES.map((study) => (
          <article key={study.id} className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-6">
            <h3 className="text-2xl font-black text-white">{study.title}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-stone-400">Before</p>
                <img
                  src={study.beforeImage}
                  alt={`${study.title} before`}
                  loading="lazy"
                  className="h-44 w-full rounded-xl object-cover"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-stone-400">After</p>
                <img
                  src={study.afterImage}
                  alt={`${study.title} after`}
                  loading="lazy"
                  className="h-44 w-full rounded-xl object-cover"
                />
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm leading-7 text-stone-300">
              <p><span className="font-semibold text-stone-100">Challenge:</span> {study.challenge}</p>
              <p><span className="font-semibold text-stone-100">Solution:</span> {study.solution}</p>
              <p><span className="font-semibold text-stone-100">Outcome:</span> {study.outcome}</p>
            </div>
            <a
              href={TATTOO_BOOKING_URL}
              className="mt-6 inline-flex rounded-full bg-[#f5e6c8] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#140f0d]"
            >
              Book Cover-Up Consult
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
