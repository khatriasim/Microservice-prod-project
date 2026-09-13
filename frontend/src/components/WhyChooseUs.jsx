export default function WhyChooseUs() {
  const reasons = [
    {
      icon: "trust",
      title: "Verified Listings",
      subtitle: "Every property is verified and inspected by our experts.",
    },
    {
      icon: "support",
      title: "Expert Guidance",
      subtitle: "Our agents are with you every step of the way, from search to closing.",
    },
    {
      icon: "value",
      title: "Transparent Pricing",
      subtitle: "No hidden fees — what you see is what you pay.",
    },
    {
      icon: "choice",
      title: "Wide Selection",
      subtitle: "1000+ properties across the city's most desirable neighborhoods.",
    },
  ];

  return (
    <section className="py-12 lg:py-20 bg-cream-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid max-w-5xl mx-auto gap-8 md:grid-cols-2 items-center lg:gap-12">
          <div>
            <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-3">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-brown-700 sm:text-5xl lg:text-6xl mb-4">
              Your Trusted Partner in Real Estate
            </h2>
            <p className="text-lg leading-relaxed text-brown-600 max-w-xl">
              We believe finding a home should be transparent, rewarding, and
              stress-free. Our platform combines powerful search with expert
              guidance to help you make the best decision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {reasons.map((reason, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md bg-cream-100 p-5 border border-cream-200/50"
              >
                <div className="flex-shrink-0 rounded-md bg-brown-600 text-white w-10 h-10 items-center justify-center flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-brown-700 mb-1">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-brown-500 line-clamp-2">
                    {reason.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}