import PropertyCard from "./PropertyCard";

export default function PopularProperties() {
  const properties = [
    {
      title: "Lakeside Villa",
      price: "$1.2M",
      city: "Lakeside",
      beds: 4,
      baths: 3,
      image: "/placeholder-villa.png",
    },
    {
      title: "Urban Penthouse",
      price: "$850K",
      city: "Downtown",
      beds: 2,
      baths: 2,
      image: "/placeholder-penthouse.png",
    },
    {
      title: "Countryside Farmhouse",
      price: "$750K",
      city: "Countryside",
      beds: 3,
      baths: 2,
      image: "/placeholder-farmhouse.png",
    },
    {
      title: "Skyline Condo",
      price: "$620K",
      city: "Metro",
      beds: 2,
      baths: 2,
      image: "/placeholder-condo.png",
    },
  ];
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-8">
          Popular Properties
        </span>
        <h2 className="text-4xl font-bold tracking-tight text-brown-700 mb-8">
          Featured Listings
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((p) => (
            <PropertyCard
              key={p.title}
              title={p.title}
              price={p.price}
              city={p.city}
              beds={p.beds}
              baths={p.baths}
              image={p.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}