import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "Build with confidence",
    title: "The right tools for every project.",
    description:
      "Quality hardware, dependable supplies, and practical advice for work that lasts.",
    action: "Shop hardware",
    href: "/catalog",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=85",
    alt: "Hand tools arranged on a workbench",
    accent: "from-[#172033]/95 via-[#172033]/75 to-[#172033]/15",
  },
  {
    eyebrow: "Weekend projects start here",
    title: "Make more of your space.",
    description:
      "Find the essentials for repairs, renovations, and the ideas waiting in your workshop.",
    action: "Explore the collection",
    href: "/catalog",
    image:
      "https://images.unsplash.com/photo-1581147036324-c17ac41f7b5c?auto=format&fit=crop&w=1200&q=85",
    alt: "Power drill and workshop equipment",
    accent: "from-[#28364d]/95 via-[#28364d]/72 to-[#28364d]/10",
  },
  {
    eyebrow: "Fresh deals every week",
    title: "Good gear. Better value.",
    description:
      "Browse selected offers on trusted tools and supplies before your next project begins.",
    action: "View current deals",
    href: "/deals",
    image:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=85",
    alt: "Protective workwear and tools",
    accent: "from-[#1c2738]/95 via-[#1c2738]/72 to-[#1c2738]/10",
  },
];

function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalID = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(intervalID);
  }, []);

  const showSlide = (slideIndex) => setActiveSlide(slideIndex);
  const showPreviousSlide = () =>
    setActiveSlide((currentSlide) =>
      currentSlide === 0 ? slides.length - 1 : currentSlide - 1,
    );
  const showNextSlide = () =>
    setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length);

  return (
    <section
      className="relative isolate overflow-hidden bg-night-sky-500"
      aria-label="Featured hardware"
    >
      <div className="relative mx-auto min-h-[440px] max-w-[1600px] sm:min-h-[500px] lg:min-h-[560px]">
        {slides.map((slide, slideIndex) => (
          <article
            key={slide.title}
            aria-hidden={activeSlide !== slideIndex}
            className={`absolute inset-0 transition-opacity duration-700 ${
              activeSlide === slideIndex ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`}
            />
            <div className="relative z-10 flex min-h-[440px] items-center px-6 py-16 sm:min-h-[500px] sm:px-10 lg:min-h-[560px] lg:px-16 xl:px-24">
              <div className="max-w-xl text-white">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-slate-200 sm:text-sm">
                  {slide.eyebrow}
                </p>
                <h1 className="max-w-lg text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-slate-200 sm:text-lg">
                  {slide.description}
                </p>
                <a
                  href={slide.href}
                  tabIndex={activeSlide === slideIndex ? 0 : -1}
                  className="mt-8 inline-flex items-center gap-3 rounded-lg bg-white px-5 py-3 text-sm font-bold text-night-sky-500 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/40"
                >
                  {slide.action}
                  <span aria-hidden="true">-&gt;</span>
                </a>
              </div>
            </div>
          </article>
        ))}

        <div className="absolute right-5 bottom-6 z-20 flex items-center gap-2 sm:right-10 sm:bottom-8 lg:right-16">
          <button
            type="button"
            onClick={showPreviousSlide}
            aria-label="Previous featured item"
            className="flex size-10 items-center justify-center rounded-full border border-white/50 bg-black/15 text-xl text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-night-sky-500 focus:outline-none focus:ring-4 focus:ring-white/40"
          >
            &lt;
          </button>
          <div
            className="flex items-center gap-2 px-2"
            aria-label="Slide navigation"
          >
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => showSlide(slideIndex)}
                aria-label={`Show featured item ${slideIndex + 1}`}
                aria-current={activeSlide === slideIndex ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === slideIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={showNextSlide}
            aria-label="Next featured item"
            className="flex size-10 items-center justify-center rounded-full border border-white/50 bg-black/15 text-xl text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-night-sky-500 focus:outline-none focus:ring-4 focus:ring-white/40"
          >
            -&gt;
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
