import React, { useEffect, useState } from 'react';
import { HomeBrain3D } from './HomeBrain3D';

interface HomeHeroProps {
  onEnterMind: () => void;
  onExploreProjects: () => void;
}

const NAME_LETTERS = ['N', 'i', 's', 'h', 't', 'h', 'a', '.'];
const FONTS = [
  '"Bricolage Grotesque", sans-serif',
  'Georgia, serif',
  '"Courier New", monospace',
  'Arial, sans-serif',
  '"Times New Roman", serif',
];
const COLORS = ['#9ebdff', '#f2a4c0', '#f0ca7d', '#84d9ad', '#7dd3e8', '#c8b2ff', '#f39cd6'];

export const HomeHero: React.FC<HomeHeroProps> = ({ onEnterMind, onExploreProjects }) => {
  const [frame, setFrame] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);

    if (mq.matches) {
      return () => mq.removeEventListener('change', onChange);
    }

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setFrame((f) => f + 1);
      }
    }, 650);

    return () => {
      window.clearInterval(timer);
      mq.removeEventListener('change', onChange);
    };
  }, []);

  return (
    <section
      aria-label="Introduction"
      className="bg-[#161924] text-[#f2f0f7] pt-14 pb-16 md:pt-20 md:pb-24"
    >
      <div className="max-w-[1280px] mx-auto px-[6%]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero: Hello, I'm Nishtha. */}
          <div className="lg:col-span-7 space-y-8">
            <div className="uppercase text-[13px] tracking-[2px] font-semibold text-[#b7b5c6]">
              A little corner of the internet
            </div>

            <h1 className="font-display text-[clamp(56px,9vw,122px)] font-medium leading-[1.06] tracking-[-0.06em] text-[#f2f0f7]">
              <span className="block">Hello, I’m</span>
              <span className="inline-block relative mt-1" aria-label="Nishtha.">
                {NAME_LETTERS.map((char, idx) => {
                  const phase = (frame + idx * 2) % 24;
                  const letterColor = reducedMotion
                    ? '#c3b0f6'
                    : COLORS[(frame + idx * 2) % COLORS.length];
                  const letterFont =
                    reducedMotion || phase >= 12
                      ? FONTS[0]
                      : FONTS[(frame + idx) % FONTS.length];

                  return (
                    <span
                      key={idx}
                      aria-hidden="true"
                      className="inline-block transition-colors duration-500"
                      style={{
                        color: letterColor,
                        fontFamily: letterFont,
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
                <span
                  aria-hidden="true"
                  className="block h-[5px] bg-[#c3b0f6]/80 mt-2 -rotate-2 rounded-full"
                />
              </span>
            </h1>

            <div className="pt-4">
              <button
                type="button"
                onClick={onExploreProjects}
                className="inline-block border border-[#b7b2c9] px-7 py-3.5 rounded-full font-medium text-[15px] text-[#f2f0f7] hover:bg-[#eee9fa] hover:text-[#222334] transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6]"
              >
                Explore my projects
              </button>
            </div>
          </div>

          {/* Right Hero: Sculptural Backlit Brain Portal */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative isolate w-full max-w-[440px]">
              {/* Soft coral/lavender/cyan radial backlight matching live site */}
              <div
                aria-hidden="true"
                className="absolute left-[2.5%] top-[-2%] w-[95%] aspect-square rounded-full -z-10 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse, rgba(242,173,189,0.38) 0%, rgba(168,139,238,0.27) 32%, rgba(117,185,211,0.12) 53%, transparent 72%)',
                  filter: 'blur(25px)',
                }}
              />

              <HomeBrain3D onEnterMind={onEnterMind} reducedMotion={reducedMotion} />
            </div>

            <span className="mt-3 text-sm text-[#b7b5c6] text-center">
              My interests, ideas, and things I’m exploring.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
