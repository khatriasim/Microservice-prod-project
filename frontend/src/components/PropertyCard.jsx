import Image from "next/image";

export default function PropertyCard({ title, price, city, beds, baths, image }) {
  return (
    <article className="card-elevated border border-cream-200 rounded-2xl overflow-hidden hover:transform hover:translate-y-[-4px] transition-all duration-300 aspect-[3/4]">
      <div className="relative overflow-hidden aspect-[4/5]">
        <Image
          src={image}
          alt={title}
          fill
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-via-transparent to-transparent from-brown-800/50 via-transparent to-transparent p-5"
        />
        <div
          className="absolute top-3 left-3 text-xs font-semibold uppercase tracking-wider text-white"
        >
          {price}
        </div>
      </div>
      <div className="p-4 flex flex-col h-full">
        <h3 className="line-clamp-2 font-medium text-brown-700 mb-2">{title}</h3>
        <div className="flex items-center gap-1.5 mt-auto text-xs text-brown-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l4-4m0 0l4 4m-4-4l-4 4" />
          </svg>
          {beds} bed
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l4-4m0 0l4 4m-4-4l-4 4" />
          </svg>
          {baths} bath
        </div>
      </div>
    </article>
  );
}