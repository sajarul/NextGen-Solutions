"use client";

interface MarqueeStripProps {
  text: string;
  reverse?: boolean;
}

export function MarqueeStrip({ text, reverse = false }: MarqueeStripProps) {
  return (
    <section className="overflow-hidden border-y border-white/10 bg-[#05080f] py-7">
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {new Array(10).fill(null).map((_, index) => (
          <span key={`${text}-${index}`} className="marquee-item">
            / {text} /
          </span>
        ))}
      </div>
    </section>
  );
}
