import React from 'react';
import { Download, Printer } from 'lucide-react';
import { RESUME_DATA, CASE_STUDIES, CaseStudy } from '../data/portfolioData';

interface ResumeViewProps {
  onOpenCase: (study: CaseStudy) => void;
  onOpenProjects: () => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({ onOpenCase, onOpenProjects }) => {
  return (
    <section
      aria-label="Resume"
      className="bg-[#0f121b] text-[#f2f0f7] min-h-[calc(100vh-6rem)] py-12 md:py-16"
    >
      <div className="max-w-[1280px] mx-auto px-[6%] space-y-12">
        {/* Resume Hero */}
        <div className="space-y-6 border-b border-white/15 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="uppercase text-[13px] tracking-[2px] font-semibold text-[#b7b5c6]">
                Resume
              </div>
              <h1 className="font-display text-[clamp(48px,7vw,92px)] font-medium leading-[1.06] tracking-[-0.055em] text-[#f2f0f7]">
                {RESUME_DATA.name}
                <span className="text-[#c3b0f6]">.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#b7b5c6] max-w-[44ch] leading-relaxed">
                {RESUME_DATA.intro}
              </p>
            </div>

            <div className="no-print flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#b7b2c9] bg-[#161924] text-sm font-medium text-[#f2f0f7] hover:bg-[#eee9fa] hover:text-[#161924] transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <a
                href={RESUME_DATA.pdfUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c3b0f6] text-[#161924] text-sm font-semibold hover:bg-[#d7c9fb] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download resume (PDF)</span>
              </a>
            </div>
          </div>

          <div
            aria-label="Contact details"
            className="flex flex-wrap items-center gap-6 text-sm text-[#d2cfe0]"
          >
            <a
              href={`mailto:${RESUME_DATA.email}`}
              className="underline underline-offset-4 hover:text-[#c3b0f6]"
            >
              {RESUME_DATA.email}
            </a>
            <a
              href={RESUME_DATA.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[#c3b0f6]"
            >
              LinkedIn
            </a>
            <a
              href={`tel:${RESUME_DATA.phone.replace(/[^+\d]/g, '')}`}
              className="underline underline-offset-4 hover:text-[#c3b0f6]"
            >
              {RESUME_DATA.phone}
            </a>
          </div>
        </div>

        {/* Layout: Sticky Section Nav + Resume Content */}
        <div className="print-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <aside className="no-print lg:col-span-3 lg:sticky lg:top-28">
            <nav aria-label="Resume sections" className="flex flex-row flex-wrap lg:flex-col gap-3">
              <a href="#ventures" className="text-sm text-[#c3b0f6] font-medium hover:text-white">
                NightShift AI &amp; Ventures
              </a>
              <a href="#experience" className="text-sm text-[#b7b5c6] hover:text-[#c3b0f6]">
                Experience
              </a>
              <a href="#education" className="text-sm text-[#b7b5c6] hover:text-[#c3b0f6]">
                Education
              </a>
              <a href="#selected-projects" className="text-sm text-[#b7b5c6] hover:text-[#c3b0f6]">
                Selected projects
              </a>
              <a href="#skills" className="text-sm text-[#b7b5c6] hover:text-[#c3b0f6]">
                Skills &amp; interests
              </a>
            </nav>
          </aside>

          <div className="lg:col-span-9 space-y-8">
            {/* NightShift AI & Entrepreneurship Highlight */}
            <section
              id="ventures"
              className="rounded-2xl border border-[#c3b0f6]/35 bg-gradient-to-br from-[#191c2d] via-[#141825] to-[#111420] p-6 sm:p-9 space-y-6"
            >
              <div className="space-y-1">
                <div className="uppercase text-[11px] tracking-[1.8px] font-semibold text-[#c3b0f6]">
                  Founder &amp; startup ecosystem work
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#f2f0f7]">
                  NightShift AI &amp; Entrepreneurship
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <article className="rounded-xl border border-white/12 bg-[#0e111a] p-5 space-y-2">
                  <div className="text-xs uppercase tracking-[1.4px] font-semibold text-[#c3b0f6]">
                    Yale Tsai CITY Launchpad
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">NightShift AI</h3>
                  <p className="text-sm text-[#d2cfe0] leading-relaxed">
                    Founder · Selected into Tsai CITY’s Launchpad incubator building practical
                    overnight AI agent workflows for lean teams and fast research synthesis.
                  </p>
                </article>

                <article className="rounded-xl border border-white/12 bg-[#0e111a] p-5 space-y-2">
                  <div className="text-xs uppercase tracking-[1.4px] font-semibold text-[#c3b0f6]">
                    Singapore &amp; France
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">ClearCarbon</h3>
                  <p className="text-sm text-[#d2cfe0] leading-relaxed">
                    Cofounder, Head of GTM &amp; Product Marketing · Led 20+ customer interviews and
                    repositioned emissions software around cost savings for EU carbon compliance.
                  </p>
                </article>

                <article className="rounded-xl border border-white/12 bg-[#0e111a] p-5 space-y-2">
                  <div className="text-xs uppercase tracking-[1.4px] font-semibold text-[#c3b0f6]">
                    INSEAD Campus Leadership
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    Entrepreneurs@INSEAD &amp; Women’s Mentorship
                  </h3>
                  <p className="text-sm text-[#d2cfe0] leading-relaxed">
                    Founder · Launched INSEAD’s entrepreneurship club and cross-cohort women’s
                    mentorship network connecting builders across Europe and Asia.
                  </p>
                </article>

                <article className="rounded-xl border border-white/12 bg-[#0e111a] p-5 space-y-2">
                  <div className="text-xs uppercase tracking-[1.4px] font-semibold text-[#c3b0f6]">
                    Yale University · 300+ Builders
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">SideQuest Yale</h3>
                  <p className="text-sm text-[#d2cfe0] leading-relaxed">
                    Founder &amp; President · Grew a campus community of 300+ makers and
                    co-organized the Jackpot Hackathon with Base44 and Corgi.
                  </p>
                </article>
              </div>
            </section>

            {/* Experience */}
            <section
              id="experience"
              className="rounded-2xl border border-white/15 bg-[#141825] p-6 sm:p-9 space-y-8"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#f2f0f7]">
                Experience
              </h2>

              <div className="space-y-8">
                {RESUME_DATA.experience.map((job) => (
                  <article
                    key={job.company}
                    className="border-t border-white/10 pt-6 first:border-t-0 first:pt-0 space-y-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">
                          {job.company}
                        </h3>
                        <p className="text-sm font-medium text-[#c3b0f6]">{job.role}</p>
                      </div>
                      <div className="text-xs sm:text-sm text-[#b7b5c6] sm:text-right">
                        <span className="font-medium text-[#f2f0f7]">{job.date}</span>
                        <span className="block text-xs text-[#9c99ad]">{job.location}</span>
                      </div>
                    </div>
                    <p className="text-sm italic text-[#b7b5c6]">{job.context}</p>
                    <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-[#d2cfe0] leading-relaxed">
                      {job.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            {/* Education */}
            <section
              id="education"
              className="rounded-2xl border border-white/15 bg-[#141825] p-6 sm:p-9 space-y-8"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#f2f0f7]">
                Education
              </h2>

              <div className="space-y-7">
                {RESUME_DATA.education.map((edu) => (
                  <article
                    key={edu.school}
                    className="border-t border-white/10 pt-6 first:border-t-0 first:pt-0 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">
                          {edu.school}
                        </h3>
                        <p className="text-sm text-[#c3b0f6]">{edu.degree}</p>
                      </div>
                      <div className="text-xs sm:text-sm text-[#b7b5c6] sm:text-right">
                        <span className="font-medium text-[#f2f0f7]">{edu.date}</span>
                        {edu.location && (
                          <span className="block text-xs text-[#9c99ad]">{edu.location}</span>
                        )}
                      </div>
                    </div>
                    {edu.bullets.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-[#d2cfe0] leading-relaxed">
                        {edu.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* Selected Projects */}
            <section
              id="selected-projects"
              className="rounded-2xl border border-white/15 bg-[#141825] p-6 sm:p-9 space-y-5"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#f2f0f7]">
                Selected projects
              </h2>
              <div className="space-y-4">
                {CASE_STUDIES.slice(0, 2).map((study) => (
                  <article key={study.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => onOpenCase(study)}
                      className="text-base font-medium text-white underline underline-offset-4 hover:text-[#c3b0f6]"
                    >
                      {study.title}
                    </button>
                    <p className="text-sm text-[#b7b5c6]">{study.summary}</p>
                  </article>
                ))}
              </div>
              <div>
                <button
                  type="button"
                  onClick={onOpenProjects}
                  className="text-sm font-medium text-[#c3b0f6] underline underline-offset-4 hover:text-white"
                >
                  Explore all projects
                </button>
              </div>
            </section>

            {/* Skills & Interests */}
            <section
              id="skills"
              className="rounded-2xl border border-white/15 bg-[#141825] p-6 sm:p-9 space-y-5"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#f2f0f7]">
                Skills &amp; interests
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {RESUME_DATA.skills.map((skill) => (
                  <div key={skill.label} className="space-y-1">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[#c3b0f6]">
                      {skill.label}
                    </dt>
                    <dd className="text-sm sm:text-base text-[#d2cfe0] leading-relaxed">
                      {skill.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};
