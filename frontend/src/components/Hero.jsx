import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-50 py-12 lg:py-0">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:py-20">
        {/* Left content */}
        <div className="flex flex-col justify-center lg:col-span-5">
          <span className="mb-4 inline-block text-xs font-semibold tracking-[0.18em] uppercase text-accent">
            Premium Properties
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-brown-700 sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
            Find Your{" "}
            <span className="italic text-accent">Dream</span> Home
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-brown-600">
            Discover curated estates that redefine luxury. From modern villas
            to historic estates — we connect you with the property that
            feels like home.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/buy"
              className="btn-primary !text-base !px-8 !py-4"
            >
              Buy Home
            </a>
            <a
              href="/browse"
              className="inline-flex items-center justify-center rounded-md border-2 border-brown-600 px-8 py-4 text-base font-semibold transition-all duration-200 hover:bg-brown-600 hover:text-white active:scale-[0.97]"
              style={{ color: "var(--color-primary)" }}
            >
              Browse Listings
            </a>
          </div>
        </div>

        {/* Right: hero image + floating search */}
        <div className="relative lg:col-span-7">
          {/* Property image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl lg:aspect-[5/4]">
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=960&q=80"
              alt="Modern luxury villa"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown-800/30 via-transparent to-transparent" />
          </div>

          {/* Floating search bar */}
          <div className="absolute -bottom-6 left-4 right-4 z-20 rounded-2xl border border-cream-200 bg-cream-50/95 p-5 shadow-xl backdrop-blur-lg sm:left-auto sm:right-6 sm:-bottom-8 sm:w-[85%] lg:w-[78%]">
            <form className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brown-500">
                  Location
                </label>
                <select className="input-field !py-2.5 !text-sm">
                  <option>Anywhere</option>
                  <option>Downtown</option>
                  <option>Suburbs</option>
                  <option>Waterfront</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brown-500">
                  Type
                </label>
                <select className="input-field !py-2.5 !text-sm">
                  <option>All Types</option>
                  <option>Villa</option>
                  <option>Apartment</option>
                  <option>Townhouse</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brown-500">
                  Price Range
                </label>
                <select className="input-field !py-2.5 !text-sm">
                  <option>Any Price</option>
                  <option>$100K – $300K</option>
                  <option>$300K – $600K</option>
                  <option>$600K+</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-brown-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brown-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
