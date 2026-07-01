import { useEffect, useState } from 'react';
import { TESTIMONIALS, chunkTestimonials, type Testimonial } from '../../data/testimonials';

const SLIDE_MS = 10_000;
const PER_SLIDE = 3;

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="testimonial-card flex h-full flex-col">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400/90 to-brand-600 font-semibold text-white shadow-md">
          {t.initials}
        </span>
        <figcaption className="min-w-0 text-left">
          <p className="truncate font-semibold text-white">{t.name}</p>
          <p className="truncate text-xs text-slate-400">{t.role}</p>
        </figcaption>
        <span className="ml-auto shrink-0 text-sm text-amber-300" aria-label="5 estrellas">
          ★★★★★
        </span>
      </div>
      <blockquote className="flex-1 text-left text-sm leading-relaxed text-slate-300">
        &ldquo;{t.text}&rdquo;
      </blockquote>
    </figure>
  );
}

export function TestimonialsCarousel() {
  const slides = chunkTestimonials(TESTIMONIALS, PER_SLIDE);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFade(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        setFade(true);
      }, 280);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const current = slides[index] ?? [];

  return (
    <div className="mt-10">
      <div
        className={`grid grid-cols-1 gap-5 transition-opacity duration-300 md:grid-cols-3 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
        aria-live="polite"
      >
        {current.map((t) => (
          <TestimonialCard key={t.name} t={t} />
        ))}
        {current.length < PER_SLIDE &&
          Array.from({ length: PER_SLIDE - current.length }).map((_, i) => (
            <div key={`pad-${i}`} className="hidden md:block" aria-hidden />
          ))}
      </div>
    </div>
  );
}
