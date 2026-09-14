"use client";
import  { AuthSection} from "@/components/AuthSection"
import Link from "next/link";
import {
  ArrowRight,
  Home,
} from "lucide-react";
import  { useAuth } from "@/hooks/useAuth"

import Image from "next/image";
import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  Play,
  Plus,
  Search,
  Star,
} from "lucide-react";

const IMAGES = {
  listing:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=520&q=80",
  video:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=354&q=80",
  bottomLeft:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&q=80",
  bottomCenter:
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  bottomRight:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=640&q=80",
  agent:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&q=80",
  avatar1:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&q=80",
  avatar2:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80",
};

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2 shrink-0" aria-label="EstateHub home">
                   <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange text-white shadow-lg shadow-orange/30">
                <Home size={22} strokeWidth={2.2} />
              </span>
              <span className="font-serif-display text-2xl tracking-wide">
                EstateHub
              </span>
    </a>
  );
}

function AvatarStack({ size = "w-6 h-6", plus = true }) {
  return (
    <div className="flex -space-x-2">
      <div className={`${size} rounded-full overflow-hidden ring-2 ring-background`}>
        <Image
          src={IMAGES.avatar1}
          alt="Happy client"
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
      <div className={`${size} rounded-full overflow-hidden ring-2 ring-background`}>
        <Image
          src={IMAGES.avatar2}
          alt="Happy client"
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
      {plus ? (
        <span
          className={`${size} rounded-full bg-dark-green ring-2 ring-background flex items-center justify-center text-white`}
        >
          <Plus className="w-3 h-3" strokeWidth={3} />
        </span>
      ) : null}
    </div>
  );
}

function Header({ user, loading, logout }) {
  return (
    <header className="relative z-30 shrink-0 w-full px-6 lg:px-12 py-4 flex items-center justify-between animate-fade-in delay-200">
      <Logo />

      {/* Center nav */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <a href="#" className="text-gray-900 hover:text-dark-green transition-colors">
          Home
        </a>
        <Link href={"/view_estate"} className="text-gray-600 hover:text-dark-green transition-colors">
          Listings
        </Link>
        <Link href={"/view_agents"} className="text-gray-600 hover:text-dark-green transition-colors">
          Agents
        </Link>
        <a href="#" className="text-gray-600 hover:text-dark-green transition-colors">
          Blog
        </a>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        <button
          type="button"
          aria-label="Search"
          className="hidden sm:flex h-10 w-10 rounded-full border border-dark-green/20 items-center justify-center text-dark-green hover:bg-dark-green hover:text-white transition-colors"
        >
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>

        <a
          href="#"
          aria-label="Saved homes"
          className="relative flex h-10 w-10 rounded-full bg-orange items-center justify-center text-white shadow-md hover:bg-orange-hover transition-colors shrink-0"
        >
          <Heart className="w-5 h-5 fill-current" strokeWidth={2} />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange border-2 border-background text-[10px] font-bold text-white flex items-center justify-center">
            4
          </span>
        </a>

        <a
          href="#"
          aria-label="Inquiries"
          className="relative flex h-10 w-10 rounded-full border border-dark-green/20 items-center justify-center text-dark-green hover:bg-dark-green hover:text-white transition-colors shrink-0"
        >
          <MessageCircle className="w-5 h-5" strokeWidth={2} />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
            1
          </span>
        </a>

        <AuthSection user={user} loading={loading} logout={logout} />
      </div>
    </header>
  );
}

function DesktopHero() {
  return (
    <div className="hidden lg:flex flex-1 flex-col px-12 pt-[5.4rem] overflow-hidden relative">
      {/* Heading — text layer */}
      <div className="relative z-5 text-center max-w-[1100px] mx-auto w-full">
        <h1 className="font-serif-display text-dark-green leading-[0.95] tracking-tight text-[clamp(60px,7.5vw,110px)]">
          <span className="inline-block animate-word-pop delay-200">Find Your</span>
          <br />
          <span className="inline-block animate-word-pop delay-400">Dream Home</span>
        </h1>
      </div>

      {/* Left listing card */}
      <a
        href="#"
        className="absolute top-[50px] left-12 z-10 w-[clamp(160px,14vw,260px)] group animate-slide-in-left delay-600"
      >
        <div className="rounded-2xl overflow-hidden shadow-xl shadow-dark-green/10 group-hover:shadow-2xl transition-shadow relative">
          <div className="relative aspect-260/257">
            <Image
              src={IMAGES.listing}
              alt="Modern family villa exterior"
              fill
              sizes="(max-width: 1024px) 160px, 260px"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[clamp(11px,1.1vw,14px)] font-medium text-gray-700">
            Modern Family Villa
          </p>
          <p className="text-[clamp(10px,0.95vw,13px)] font-bold text-dark-green">
            $549,000
          </p>
        </div>
        <div className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-dark-green text-white flex items-center justify-center shadow-lg group-hover:bg-dark-green-hover transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </a>

      {/* Right video / tour card */}
      <a
        href="#"
        className="absolute top-[50px] right-12 z-10 w-[clamp(120px,10vw,177px)] group animate-slide-in-right delay-700"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-dark-green/10 group-hover:shadow-2xl transition-shadow aspect-177/287">
          <Image
            src={IMAGES.video}
            alt="Property video tour"
            fill
            sizes="(max-width: 1024px) 120px, 177px"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-dark-green/10 group-hover:bg-dark-green/20 transition-colors" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-11 w-11 rounded-full bg-dark-green text-white flex items-center justify-center shadow-lg group-hover:bg-dark-green-hover transition-colors">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-[clamp(10px,0.9vw,13px)] text-gray-600">
            Watch Virtual Property Tours
          </p>
        </div>
      </a>

      {/* Info badges above images — text row */}
      <div className="absolute bottom-[calc(min(40vh,33vw)+12px)] left-12 right-12 z-10 flex items-end gap-0">
        {/* Left badge — Homes Sold */}
        <div className="flex-1 text-dark-green animate-scale-in delay-1000">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[clamp(20px,2.5vw,34px)] font-bold font-serif-display leading-none">
              12K+
            </span>
            <span className="text-[clamp(10px,1vw,14px)] font-medium leading-tight text-gray-600">
              Homes Sold
            </span>
          </div>
          <AvatarStack />
        </div>

        {/* Center badge — CTA */}
        <div className="flex-[1.265] text-center text-dark-green animate-scale-in delay-1100">
          <h2 className="font-serif-display text-[clamp(18px,2.5vw,36px)] leading-tight text-dark-green">
            Find the Perfect Property for Your Family
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-2 mt-3 px-6 py-3 bg-orange hover:bg-orange-hover rounded-full text-white text-sm font-semibold transition-colors shadow-lg shadow-orange/20"
          >
            Explore Listings <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Right badge — Rating */}
        <div className="flex-1 text-right text-dark-green animate-scale-in delay-1200">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-[clamp(24px,2.8vw,40px)] font-bold leading-none font-serif-display">
              4.9
            </span>
            <Star className="w-[clamp(16px,2vw,28px)] h-[clamp(16px,2vw,28px)] fill-orange text-orange" />
          </div>
          <p className="text-[clamp(10px,1vw,14px)] font-medium leading-tight text-gray-600">
            Client Satisfaction Rating
          </p>
        </div>
      </div>

      {/* Bottom 3 images — image strip */}
      <div className="absolute bottom-0 left-0 right-0 z-0 flex items-end gap-0">
        {/* Left */}
        <div className="flex-1 relative animate-photo-reveal delay-700">
          <div className="relative min-h-[min(34vh,28vw)] max-h-[min(34vh,28vw)]">
            <Image
              src={IMAGES.bottomLeft}
              alt="Exterior curb appeal"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Center */}
        <div className="flex-[1.265] relative animate-photo-reveal delay-600">
          <div className="relative min-h-[min(40vh,33vw)] max-h-[min(40vh,33vw)]">
            <Image
              src={IMAGES.bottomCenter}
              alt="Dream home exterior"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 relative animate-photo-reveal delay-800">
          <div className="relative min-h-[min(34vh,28vw)] max-h-[min(34vh,28vw)]">
            <Image
              src={IMAGES.bottomRight}
              alt="Interior lifestyle"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabletHero() {
  return (
    <div className="hidden md:flex lg:hidden flex-1 flex-col px-8 pt-[4rem] overflow-hidden relative">
      {/* Heading */}
      <div className="text-center max-w-[640px] mx-auto w-full relative z-5">
        <h1 className="font-serif-display text-dark-green leading-[0.95] tracking-tight text-7xl">
          <span className="inline-block animate-word-pop delay-200">Find Your</span>
          <br />
          <span className="inline-block animate-word-pop delay-400">Dream Home</span>
        </h1>
      </div>

      {/* Left listing card */}
      <a
        href="#"
        className="absolute top-[80px] left-4 z-10 w-[160px] group animate-slide-in-left delay-600"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-dark-green/10 group-hover:shadow-2xl transition-shadow">
          <div className="relative aspect-260/257">
            <Image
              src={IMAGES.listing}
              alt="Modern family villa exterior"
              fill
              sizes="160px"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-700">Modern Family Villa</p>
          <p className="text-xs font-bold text-dark-green">$549,000</p>
        </div>
        <div className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-dark-green text-white flex items-center justify-center shadow-lg group-hover:bg-dark-green-hover transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </a>

      {/* Right video / tour card */}
      <a
        href="#"
        className="absolute top-[80px] right-4 z-10 w-[120px] group animate-slide-in-right delay-700"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-dark-green/10 group-hover:shadow-2xl transition-shadow aspect-177/287">
          <Image
            src={IMAGES.video}
            alt="Property video tour"
            fill
            sizes="120px"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-dark-green/10 group-hover:bg-dark-green/20 transition-colors" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-dark-green text-white flex items-center justify-center shadow-lg group-hover:bg-dark-green-hover transition-colors">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-600">
          Virtual Property Tours
        </p>
      </a>

      {/* Bottom 3 images */}
      <div className="absolute bottom-0 left-0 right-0 z-0 flex items-end gap-0">
        <div className="flex-1 relative animate-photo-reveal delay-700">
          <div className="relative min-h-[30vh] max-h-[30vh]">
            <Image src={IMAGES.bottomLeft} alt="Exterior curb appeal" fill className="object-cover" />
          </div>
        </div>
        <div className="flex-[1.265] relative animate-photo-reveal delay-600">
          <div className="relative min-h-[36vh] max-h-[36vh]">
            <Image src={IMAGES.bottomCenter} alt="Dream home exterior" fill className="object-cover" />
          </div>
        </div>
        <div className="flex-1 relative animate-photo-reveal delay-800">
          <div className="relative min-h-[30vh] max-h-[30vh]">
            <Image src={IMAGES.bottomRight} alt="Interior lifestyle" fill className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileHero() {
  return (
    <div className="flex md:hidden flex-1 flex-col overflow-hidden px-5 pt-8">
      {/* Title + subtitle + CTA */}
      <div className="text-center mb-6 animate-fade-up delay-200">
        <h1 className="font-serif-display text-dark-green text-[36px] leading-[0.95] tracking-tight">
          <span className="inline-block animate-word-pop delay-200">Find Your</span>{" "}
          <span className="inline-block animate-word-pop delay-400">Dream Home</span>
        </h1>
        <p className="text-gray-600 text-sm mt-3 animate-fade-in delay-300">
          Browse thousands of verified listings
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-orange hover:bg-orange-hover rounded-full text-white text-sm font-semibold shadow-lg shadow-orange/20 transition-colors animate-fade-in delay-400"
        >
          Explore Listings <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Two cards side by side */}
      <div className="flex gap-3 mb-5">
        <a href="#" className="flex-1 group animate-slide-in-left delay-300">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl shadow-dark-green/10 group-hover:shadow-2xl transition-shadow">
            <Image
              src={IMAGES.listing}
              alt="Modern family villa exterior"
              fill
              sizes="50vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-dark-green text-white flex items-center justify-center shadow-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-gray-700">Modern Family Villa</div>
          <div className="text-xs font-bold text-dark-green">$549,000</div>
        </a>

        <a href="#" className="w-[45%] group animate-slide-in-right delay-400">
          <div className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-xl shadow-dark-green/10 group-hover:shadow-2xl transition-shadow">
            <Image
              src={IMAGES.video}
              alt="Property video tour"
              fill
              sizes="45vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-dark-green/10" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-dark-green text-white flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-center text-gray-600">Virtual Tours</p>
        </a>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-4 mb-2 animate-fade-in delay-600">
        <div className="flex items-center gap-2 mr-1">
          <AvatarStack size="w-7 h-7" />
          <span className="text-xs font-medium text-gray-600 leading-tight">
            <span className="text-gray-900 font-bold">12K+</span> Homes Sold
          </span>
        </div>

        <div className="w-px h-8 bg-dark-green/20" />

        <div className="flex items-center gap-1 ml-1">
          <span className="text-base font-bold text-dark-green">4.9</span>
          <Star className="w-4 h-4 fill-orange text-orange" />
          <span className="text-xs text-gray-600">Client Satisfaction</span>
        </div>
      </div>

      {/* Bottom 3 images */}
      <div className="relative flex flex-1 min-h-0 w-full animate-photo-reveal delay-800">
        <div className="relative flex-1">
          <Image src={IMAGES.bottomLeft} alt="Exterior curb appeal" fill className="object-cover" />
        </div>
        <div className="relative flex-[1.2]">
          <Image src={IMAGES.bottomCenter} alt="Dream home exterior" fill className="object-cover" />
        </div>
        <div className="relative flex-1">
          <Image src={IMAGES.bottomRight} alt="Interior lifestyle" fill className="object-cover" />
        </div>
      </div>
    </div>
  );
}

export default function EstateHero() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header user={user} loading={loading} logout={logout} />
      <main className="relative flex-1 flex flex-col overflow-hidden">
        <DesktopHero />
        <TabletHero />
        <MobileHero />
      </main>
    </div>
  );
}
