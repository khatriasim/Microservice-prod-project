export default function Testimonials() {
  const testimonials = [
    {
      name: "Carla M.",
      role: "First-time Buyer",
      rating: 5,
      text:
        "I never thought buying a home could be this smooth. The team at EstateHub made everything easy to understand and navigate. Highly recommended!",
    },
    {
      name: "Dennis R.",
      role: "Property Investor",
      rating: 5,
      text:
        "Their platform is incredibly intuitive. I found the perfect investment property in less than two weeks. Worth every penny.",
    },
    {
      name: "Priya S.",
      role: "Home Seller",
      rating: 4,
      text:
        "Sold my house in 10 days at a great price. The marketing photos and descriptions were spot-on. Excellent service.",
    },
  ];

  return (
    <section className="py-12 lg:py-20 bg-cream-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-8">
          What People Say
        </span>
        <h2 className="text-4xl font-bold tracking-tight text-brown-700 mb-8">
          Testimonials
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {testimonials.map((t, i) => (
            <article
              key={i}
              className="rounded-xl bg-cream-100 p-6 border border-cream-200/50"
            >
              <div className="flex items-start gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-accent mt-1 flex-shrink-0"
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
                <div className="flex-1 min-w-0">
                  <p className="text-lg leading-relaxed text-brown-600">
                    "{t.text}"
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-brown-700">{t.name}</span>
                      <span className="text-xs text-brown-500">{t.role}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5]
                        .slice(0, t.rating)
                        .map(
                          (_, idx) => (
                            <svg
                              key={idx}
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-yellow-500"
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
                          )
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}