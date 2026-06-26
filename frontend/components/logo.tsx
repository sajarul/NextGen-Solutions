"use client";

import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="#home"
      className={`relative block overflow-hidden ${className ?? "h-12 w-[250px] sm:h-14 sm:w-[320px]"}`}
      aria-label="NextGen Solutions"
    >
      <Image
        src="/logo.png"
        alt="NextGen Solutions"
        fill
        priority
        sizes="(max-width: 640px) 250px, 320px"
        className="object-contain object-center scale-[3.2] -translate-x-[8%] translate-y-[1px]"
      />
    </Link>
  );
}
