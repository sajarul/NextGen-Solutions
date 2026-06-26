"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import type { SiteContent } from "@/lib/types";

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  useEffect(() => {
    if (!inView) {
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(target * progress));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [duration, inView, target]);

  return { ref, count };
}

function StatCard({
  label,
  value,
  suffix
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  const { ref, count } = useCountUp(value);

  return (
    <div ref={ref} className="glass-panel rounded-2xl p-5">
      <p className="text-3xl font-semibold text-brand-300">
        {count}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-[color:var(--text-muted)]">{label}</p>
    </div>
  );
}

const SHOWCASE_VIDEO_PATH = "/showcase.mp4";

interface AboutSectionProps {
  siteContent?: SiteContent | null;
}

export function AboutSection({ siteContent = null }: AboutSectionProps) {
  const [videoError, setVideoError] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoBoxRef = useRef<HTMLDivElement | null>(null);
  const isVideoInView = useInView(videoBoxRef, { amount: 0.45 });
  const videoSource = siteContent?.about_video_url || SHOWCASE_VIDEO_PATH;
  const primaryImageSource = siteContent?.about_primary_image_url || "/services/poster.svg";
  const secondaryImageSource = siteContent?.about_secondary_image_url || "/services/thumbnail.svg";

  useEffect(() => {
    setVideoError(false);
    setIsVideoMuted(true);
    setIsUserPaused(false);
  }, [videoSource]);

  useEffect(() => {
    const player = videoRef.current;
    if (!player || videoError) {
      return;
    }

    player.muted = isVideoMuted;

    if (isVideoInView && !isUserPaused) {
      void player.play().catch(() => {
        // Ignore autoplay errors due to browser policy.
      });
    } else {
      player.pause();
    }
  }, [isVideoInView, isVideoMuted, isUserPaused, videoError, videoSource]);

  const stats = useMemo(
    () => [
      { label: "Projects", value: 380, suffix: "+" },
      { label: "Happy Clients", value: 220, suffix: "+" },
      { label: "Years Experience", value: 6, suffix: "+" }
    ],
    []
  );

  return (
    <motion.section
      id="about"
      className="section-anchor relative border-y border-white/10 bg-[#04070e] px-4 py-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0.8, filter: "grayscale(0.9) saturate(0.7)", y: 18 }}
      whileInView={{ opacity: 1, filter: "grayscale(0) saturate(1)", y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionTitle
          eyebrow="About"
          title="NextGen Solutions"
          description="Premium graphic design studio by SK SAJARUL HAKUE, built for clean visuals and fast brand growth."
          align="left"
          outlineWord="About"
        />

        <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <article className="glass-panel rounded-2xl p-6 sm:p-7">
              <p className="inline-flex rounded-full border border-brand-400/35 bg-brand-500/12 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-brand-200">
                Founder
              </p>
              <h3 className="mt-4 text-3xl font-semibold text-white">SK SAJARUL HAKUE</h3>
              <p className="mt-1 text-sm uppercase tracking-[0.14em] text-brand-300">Founder, NextGen Solutions</p>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-muted)]">
                I help businesses build stronger brand presence through clean, modern, conversion-focused design.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-300">
                  Poster Design
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-300">
                  Social Creatives
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-300">
                  Thumbnail Design
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-300">
                  Brand Assets
                </div>
              </div>

              <Link
                href="/portfolio"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-950 transition hover:shadow-glow"
              >
                View Portfolio
                <ArrowRight size={14} />
              </Link>
            </article>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div ref={videoBoxRef} className="relative h-56 overflow-hidden bg-[#0b1220] sm:h-72">
                  {!videoError ? (
                    <video
                      key={videoSource}
                      ref={videoRef}
                      src={videoSource}
                      autoPlay={isVideoInView}
                      loop
                      muted={isVideoMuted}
                      playsInline
                      preload="auto"
                      className="h-full w-full cursor-pointer object-cover"
                      onClick={(event) => {
                        const player = event.currentTarget;
                        if (player.paused) {
                          setIsUserPaused(false);
                          void player.play().catch(() => {
                            // Ignore playback promise failures.
                          });
                        } else {
                          setIsUserPaused(true);
                          player.pause();
                        }
                      }}
                      onError={() => setVideoError(true)}
                      onCanPlay={(event) => {
                        const player = event.currentTarget;
                        if (isVideoInView && !isUserPaused && player.paused) {
                          void player.play().catch(() => {
                            // Ignore autoplay errors silently and keep fallback available.
                          });
                        }
                      }}
                      onEnded={(event) => {
                        const player = event.currentTarget;
                        player.currentTime = 0;
                        void player.play().catch(() => {
                          // Ignore playback restart errors silently.
                        });
                      }}
                    >
                    </video>
                  ) : (
                    <Image
                      src={primaryImageSource}
                      alt="Showcase fallback"
                      fill
                      sizes="(max-width: 1024px) 100vw, 620px"
                      className="object-cover"
                    />
                  )}
                  {!videoError ? (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
                        title={isVideoMuted ? "Unmute" : "Mute"}
                        onClick={() => {
                          const player = videoRef.current;
                          const nextMuted = !isVideoMuted;
                          setIsVideoMuted(nextMuted);
                          if (player) {
                            player.muted = nextMuted;
                          }
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur transition hover:border-brand-300 hover:text-brand-200"
                      >
                        {isVideoMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-28 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <Image
                    src={primaryImageSource}
                    alt="Poster design"
                    fill
                    sizes="(max-width: 1024px) 50vw, 240px"
                    className="object-cover"
                  />
                </div>
                <div className="relative h-28 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <Image
                    src={secondaryImageSource}
                    alt="Thumbnail design"
                    fill
                    sizes="(max-width: 1024px) 50vw, 240px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} suffix={item.suffix} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
