import React, { useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Dribbble,
  LucideIcon,
  Map as MapIcon,
  Music,
  Users,
} from 'lucide-react';
import { BELIEFS } from '../data/portfolioData';

interface PersonalSectionProps {
  onOpenResume: () => void;
  onOpenMindNode: (nodeId: string) => void;
}

interface FunFactItem {
  id: string;
  label: string;
  shortLabel: string;
  tag: string;
  value: string;
  icon: LucideIcon;
  mindNodeId?: string;
}

const FUN_FACTS: FunFactItem[] = [
  {
    id: 'twin',
    label: 'Twin & icebreakers',
    shortLabel: 'Twin',
    tag: 'Social rooms & wit',
    value:
      'I’m a twin, thrive in social rooms, and love using dry wit and humor to break the ice.',
    icon: Users,
    mindNodeId: 'family-twin',
  },
  {
    id: 'maps',
    label: 'Map collection',
    shortLabel: 'Maps',
    tag: 'Aspen & Berkeley',
    value:
      'I collect maps everywhere I explore—two favorites are The Land of Kids in Aspen and the UC Berkeley library map.',
    icon: MapIcon,
    mindNodeId: 'travel',
  },
  {
    id: 'basketball',
    label: 'Basketball',
    shortLabel: 'Basketball',
    tag: 'State level',
    value:
      'Played state-level basketball—still one of my favorite resets between ideas and product sprints.',
    icon: Dribbble,
  },
  {
    id: 'dance',
    label: 'Indian classical dance',
    shortLabel: 'Dance',
    tag: 'Rhythm & craft',
    value:
      'Between builds, Indian classical dance keeps me connected to rhythm, focus, and expressive storytelling.',
    icon: Music,
  },
  {
    id: 'reading',
    label: 'Reading',
    shortLabel: 'Reading',
    tag: 'Strange Pictures',
    value: 'Avid reader—recently finished Strange Pictures and loved every visual twist.',
    icon: BookOpen,
    mindNodeId: 'travel',
  },
  {
    id: 'green-compute',
    label: 'Green compute research',
    shortLabel: 'Green compute',
    tag: 'Yale SOM',
    value:
      'Studying the green compute space and how university data clusters can operate sustainably.',
    icon: Cpu,
    mindNodeId: 'climate-tech',
  },
];

export const PersonalSection: React.FC<PersonalSectionProps> = ({
  onOpenResume,
  onOpenMindNode,
}) => {
  const [activeFactIdx, setActiveFactIdx] = useState(0);
  const activeFact = FUN_FACTS[activeFactIdx];
  const ActiveIcon = activeFact.icon;

  const handlePrevFact = () => {
    setActiveFactIdx((prev) => (prev - 1 + FUN_FACTS.length) % FUN_FACTS.length);
  };

  const handleNextFact = () => {
    setActiveFactIdx((prev) => (prev + 1) % FUN_FACTS.length);
  };

  return (
    <div className="bg-[#161924] text-[#f2f0f7] border-t border-white/15">
      <div className="max-w-[1280px] mx-auto px-[6%]">
        {/* Personal Portrait Section ("A little more me.") */}
        <section
          aria-labelledby="personal-title"
          className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start border-b border-white/15"
        >
          <div className="md:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-white/15 bg-[#1e2230] max-w-[420px]">
              <img
                src="/images/nishtha-portrait.png"
                alt="Nishtha Bahal"
                width={800}
                height={800}
                loading="lazy"
                className="w-full h-auto block object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="uppercase text-[13px] tracking-[2px] font-semibold text-[#b7b5c6]">
              Beyond the projects
            </div>
            <h2
              id="personal-title"
              className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-[#f2f0f7]"
            >
              A little more me.
            </h2>
            <p className="text-lg text-[#d2cfe0] leading-relaxed max-w-[58ch]">
              I’m passionate about the intersection of creativity, product, and growth. Currently,
              I’m a Global Business &amp; Society student at Yale School of Management—previously at
              INSEAD and UC Berkeley—and my current research explores the green compute space and
              how university data clusters can run sustainably.
            </p>
            <p className="text-lg text-[#b7b5c6] leading-relaxed max-w-[58ch]">
              I’m an avid traveler, reader, and community builder who loves bringing curious people
              together through spaces like SideQuest Yale. Between ideas: basketball, Indian
              classical dance, and exploring somewhere new.
            </p>

            {/* Interactive Fun Facts Carousel + Descriptive Icon Grid */}
            <div
              aria-label="Fun facts and interests"
              className="pt-5 border-t border-white/12 space-y-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-[1.6px] text-[#c3b0f6]">
                    Fun facts &amp; notes
                  </span>
                  <span className="text-xs font-mono-tabular text-[#8c869a]">
                    {String(activeFactIdx + 1).padStart(2, '0')} /{' '}
                    {String(FUN_FACTS.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevFact}
                    aria-label="Previous fun fact"
                    className="w-8 h-8 rounded-full border border-white/15 bg-[#121520] text-[#d2cfe0] hover:text-white hover:border-[#c3b0f6]/60 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFact}
                    aria-label="Next fun fact"
                    className="w-8 h-8 rounded-full border border-white/15 bg-[#121520] text-[#d2cfe0] hover:text-white hover:border-[#c3b0f6]/60 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Carousel Spotlight Card */}
              <div
                aria-live="polite"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(195,176,246,0.09) 0%, #121520 55%, #0e111a 100%)',
                }}
                className="rounded-2xl border border-[#c3b0f6]/30 p-5 flex items-start gap-4 transition-colors duration-200 motion-reduce:transition-none"
              >
                <div className="w-11 h-11 rounded-xl border border-[#c3b0f6]/35 bg-[#191d2d] text-[#c3b0f6] flex items-center justify-center shrink-0">
                  <ActiveIcon className="w-5 h-5" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-base sm:text-lg font-medium text-white">
                      {activeFact.label}
                    </span>
                    <span className="text-[11px] uppercase tracking-[1.4px] text-[#c3b0f6]">
                      {activeFact.tag}
                    </span>
                  </div>
                  <p className="text-sm text-[#d2cfe0] leading-relaxed">{activeFact.value}</p>

                  {activeFact.mindNodeId && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenMindNode(activeFact.mindNodeId!)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#d0bdfb] hover:text-white underline underline-offset-4 transition-colors"
                      >
                        <span>Explore in Mind</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Icon Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FUN_FACTS.map((fact, idx) => {
                  const Icon = fact.icon;
                  const isActive = idx === activeFactIdx;
                  return (
                    <button
                      key={fact.id}
                      type="button"
                      onClick={() => setActiveFactIdx(idx)}
                      aria-pressed={isActive}
                      className={`text-left rounded-xl border px-3.5 py-2.5 flex items-center gap-2.5 transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6] ${
                        isActive
                          ? 'border-[#c3b0f6]/65 bg-[#1a1f31] text-white'
                          : 'border-white/10 bg-[#121520] text-[#b7b5c6] hover:border-white/25 hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#c3b0f6]' : 'text-[#8c869a]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium truncate">{fact.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenResume}
                className="text-sm text-[#d0bdfb] underline underline-offset-4 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6] rounded-sm"
              >
                Get to know my journey
              </button>
            </div>
          </div>
        </section>

        {/* Flagship Ventures Band: NightShift AI & Entrepreneurship */}
        <section
          aria-labelledby="ventures-title"
          className="py-16 md:py-24 space-y-10 border-b border-white/15"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="block uppercase text-[13px] tracking-[2px] font-semibold text-[#c3b0f6]">
                Founder &amp; incubator work
              </span>
              <h2
                id="ventures-title"
                className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-[#f2f0f7]"
              >
                NightShift AI &amp; Entrepreneurship<span className="text-[#c3b0f6]">.</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenResume}
              className="text-sm text-[#d0bdfb] underline underline-offset-4 hover:text-white transition-colors self-start md:self-auto"
            >
              Read full founder timeline on Resume
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NightShift AI Card */}
            <article
              style={{
                backgroundImage:
                  'linear-gradient(145deg, rgba(195, 176, 246, 0.1) 0%, #121520 55%, #0e111a 100%)',
              }}
              className="rounded-2xl border border-[#c3b0f6]/35 p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="uppercase text-[11px] tracking-[1.8px] font-semibold text-[#c3b0f6]">
                    AI Venture · Tsai CITY Launchpad
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full border border-[#c3b0f6]/35 bg-[#c3b0f6]/12 text-[#e5dcff]">
                    Yale University
                  </span>
                </div>
                <h3 className="font-display text-3xl font-medium tracking-tight text-white">
                  NightShift AI<span className="text-[#c3b0f6]">.</span>
                </h3>
                <p className="text-base text-[#c7c4d6] leading-relaxed">
                  Founded inside Tsai CITY’s Launchpad startup incubator at Yale—building practical
                  overnight AI workflows that synthesize research, track signals, and hand clear
                  briefs back to human judgment every morning.
                </p>

                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="rounded-xl border border-white/10 bg-[#0b0e16] p-3">
                    <div className="text-xs font-semibold text-white">01 · Gather</div>
                    <div className="text-[11px] text-[#9c99ad] mt-0.5">
                      Overnight research &amp; triage
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0b0e16] p-3">
                    <div className="text-xs font-semibold text-white">02 · Verify</div>
                    <div className="text-[11px] text-[#9c99ad] mt-0.5">
                      Confidence &amp; signal checks
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0b0e16] p-3">
                    <div className="text-xs font-semibold text-white">03 · Decide</div>
                    <div className="text-[11px] text-[#9c99ad] mt-0.5">
                      Human-ready morning brief
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#9c99ad]">
                  Founder · Applied AI Workflows
                </span>
                <button
                  type="button"
                  onClick={() => onOpenMindNode('nightshift-ai')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c3b0f6] text-[#161924] text-sm font-semibold hover:bg-[#d7c9fb] transition-colors"
                >
                  <span>Explore NightShift AI</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </article>

            {/* Entrepreneurship Card */}
            <article
              style={{
                backgroundImage:
                  'linear-gradient(145deg, rgba(212, 184, 242, 0.09) 0%, #121520 55%, #0e111a 100%)',
              }}
              className="rounded-2xl border border-white/18 p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="uppercase text-[11px] tracking-[1.8px] font-semibold text-[#c3b0f6]">
                    Entrepreneurship · France, Singapore &amp; Yale
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/6 text-[#e5dcff]">
                    Founder &amp; Cofounder
                  </span>
                </div>
                <h3 className="font-display text-3xl font-medium tracking-tight text-white">
                  Entrepreneurship<span className="text-[#c3b0f6]">.</span>
                </h3>
                <p className="text-base text-[#c7c4d6] leading-relaxed">
                  Building zero-to-one ventures and founder ecosystems—from cofounding ClearCarbon
                  and starting Entrepreneurs@INSEAD &amp; Women’s Mentorship to leading SideQuest
                  Yale’s 300+ builder community.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <div className="rounded-xl border border-white/10 bg-[#0b0e16] p-3">
                    <div className="text-xs font-semibold text-white">Entrepreneurs@INSEAD</div>
                    <div className="text-[11px] text-[#9c99ad] mt-0.5">
                      Founder · Fontainebleau &amp; Singapore
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0b0e16] p-3">
                    <div className="text-xs font-semibold text-white">ClearCarbon</div>
                    <div className="text-[11px] text-[#9c99ad] mt-0.5">
                      Cofounder · 20+ interviews &amp; EU carbon GTM
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0b0e16] p-3">
                    <div className="text-xs font-semibold text-white">SideQuest Yale</div>
                    <div className="text-[11px] text-[#9c99ad] mt-0.5">
                      Founder · 300+ builders &amp; Jackpot Hackathon
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0b0e16] p-3">
                    <div className="text-xs font-semibold text-white">Women’s Mentorship</div>
                    <div className="text-[11px] text-[#9c99ad] mt-0.5">
                      Founder · Cross-cohort founder circles
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#9c99ad]">
                  Ventures, GTM &amp; Founder Communities
                </span>
                <button
                  type="button"
                  onClick={() => onOpenMindNode('entrepreneurship')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c3b0f6]/60 bg-[#181c2b] text-[#f2f0f7] text-sm font-semibold hover:bg-[#c3b0f6] hover:text-[#161924] transition-colors"
                >
                  <span>Explore Entrepreneurship</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* Beliefs Section ("Things I believe in.") */}
        <section aria-labelledby="beliefs-title" className="py-16 md:py-24 space-y-12">
          <div className="space-y-3">
            <span className="block uppercase text-[13px] tracking-[2px] font-semibold text-[#b7b5c6]">
              A few things I live by
            </span>
            <h2
              id="beliefs-title"
              className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-[#f2f0f7]"
            >
              Things I believe in<span className="text-[#c3b0f6]">.</span>
            </h2>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {BELIEFS.map((belief) => (
              <li key={belief.number} className="border-t border-white/15 pt-6 space-y-3">
                <span aria-hidden="true" className="block font-mono-tabular text-sm text-[#c3b0f6]">
                  {belief.number}
                </span>
                <p className="text-lg text-[#f2f0f7] leading-relaxed">{belief.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};

