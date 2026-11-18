import React from 'react';
import { ExternalLink, Github, FileDown, Link2 } from 'lucide-react';
import { CASE_STUDIES, CaseStudy, CaseLinksMap } from '../data/portfolioData';

interface ProjectsSectionProps {
  onSelectProject: (project: CaseStudy) => void;
  caseLinks: CaseLinksMap;
  onOpenConnect: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
  caseLinks,
  onOpenConnect,
}) => {
  return (
    <section
      id="projects"
      aria-label="Projects"
      className="bg-[#0f121b] text-[#f2f0f7] min-h-[calc(100vh-6rem)]"
    >
      <div className="max-w-[1280px] mx-auto px-[6%] py-14 md:py-20 space-y-12">
        {/* Intro Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/15 pb-8">
          <div className="space-y-4">
            <div className="uppercase text-[13px] tracking-[2px] font-semibold text-[#b7b5c6]">
              Selected work
            </div>
            <h1 className="font-display text-[clamp(48px,7vw,92px)] font-medium leading-[1.06] tracking-[-0.055em] text-[#f2f0f7]">
              Projects<span className="text-[#c3b0f6]">.</span>
            </h1>
            <p className="text-lg text-[#b7b5c6] max-w-[46ch] leading-relaxed">
              Things I’ve built across consumer AI, 3D engineering proxies, smart packaging, and GTM
              automation.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenConnect}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#b7b2c9] bg-[#161924] text-sm font-medium text-[#f2f0f7] hover:bg-[#eee9fa] hover:text-[#161924] transition-colors whitespace-nowrap shrink-0 self-start md:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6]"
          >
            <Link2 className="w-4 h-4" />
            <span>Connect GitHub &amp; Lovable</span>
          </button>
        </div>

        {/* All 5 Dark Editorial Project Cards */}
        <div className="space-y-12">
          {CASE_STUDIES.map((project) => {
            const custom = caseLinks[project.id] || {};
            const lovableUrl =
              custom.lovableUrl !== undefined ? custom.lovableUrl : project.defaultLovableUrl;
            const githubUrl = custom.githubUrl;

            return (
              <article
                key={project.id}
                style={{
                  backgroundImage: `linear-gradient(145deg, rgba(24, 28, 42, 0.96) 0%, rgba(16, 19, 30, 0.98) 100%)`,
                  borderColor: 'rgba(255, 255, 255, 0.14)',
                }}
                className="rounded-[24px] border p-6 sm:p-9 lg:p-10 space-y-7 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]"
              >
                {/* Top Metadata Line */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="uppercase text-[12px] sm:text-[13px] tracking-[2px] font-semibold text-[#b7b5c6]">
                    {project.eyebrow}
                  </span>
                  <span
                    style={{
                      borderColor: `${project.pastelBorder}44`,
                      backgroundColor: `${project.accentColor}22`,
                    }}
                    className="text-[13px] font-medium text-[#e9e6f6] border rounded-full px-3.5 py-1"
                  >
                    {project.label}
                  </span>
                </div>

                {/* Preview Image OR Workflow Preview */}
                {project.isWorkflowPreview ? (
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="w-full text-left rounded-[14px] border border-white/12 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-br from-[#191d2d] to-[#121521] hover:border-[#c3b0f6]/40 transition-colors cursor-pointer"
                  >
                    <div className="col-span-full uppercase text-[12px] tracking-[2px] font-semibold text-[#c3b0f6]">
                      Workflow · AI-assisted outreach
                    </div>
                    <div className="p-4 sm:p-5 rounded-xl bg-[#0d1018]/90 border border-white/10 space-y-1">
                      <strong className="block text-lg font-medium text-[#f2f0f7]">
                        Target account
                      </strong>
                      <span className="block text-sm text-[#b7b5c6]">Offer + company context</span>
                    </div>
                    <div className="p-4 sm:p-5 rounded-xl bg-[#0d1018]/90 border border-white/10 space-y-1">
                      <strong className="block text-lg font-medium text-[#f2f0f7]">
                        Ranked prospects
                      </strong>
                      <span className="block text-sm text-[#b7b5c6]">
                        Relevance + likely pain points
                      </span>
                    </div>
                    <div className="p-4 sm:p-5 rounded-xl bg-[#0d1018]/90 border border-white/10 space-y-1">
                      <strong className="block text-lg font-medium text-[#f2f0f7]">
                        Human verification
                      </strong>
                      <span className="block text-sm text-[#b7b5c6]">
                        LinkedIn search + message review
                      </span>
                    </div>
                  </button>
                ) : project.imageSrc ? (
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    aria-label={`View ${project.title} case study`}
                    className="block w-full max-w-[840px] rounded-[14px] overflow-hidden border border-white/15 bg-[#0a0c13] cursor-pointer group"
                  >
                    <img
                      src={project.imageSrc}
                      alt={project.imageAlt || project.title}
                      loading="lazy"
                      className="w-full aspect-video object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </button>
                ) : null}

                {/* Title & Summary */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6] rounded-sm"
                  >
                    <h2 className="font-display text-[clamp(30px,4.5vw,56px)] font-medium leading-[1.15] tracking-[-0.045em] text-[#f2f0f7] group-hover:text-[#d0bdfb] transition-colors">
                      {project.title}
                      <span className="text-[#c3b0f6]">.</span>
                    </h2>
                  </button>
                  <p className="text-lg sm:text-xl text-[#b7b5c6] max-w-[56ch] leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                {/* Bottom Links Row (Tags + Lovable + GitHub + PDF + Case Study) */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <span className="text-[13px] text-[#9c99ad]">
                    {project.tags.join(' · ')}
                  </span>

                  <div className="flex flex-wrap items-center gap-4">
                    {lovableUrl && (
                      <a
                        href={lovableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d0bdfb] underline underline-offset-4 hover:text-white transition-colors whitespace-nowrap"
                      >
                        <span>{project.lovableLabel || 'View Lovable app'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {githubUrl ? (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d0bdfb] underline underline-offset-4 hover:text-white transition-colors whitespace-nowrap"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>{custom.githubRepoName || 'GitHub Repo'}</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenConnect}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b7b5c6] hover:text-[#d0bdfb] underline underline-offset-4 whitespace-nowrap"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Link GitHub repo</span>
                      </button>
                    )}

                    {project.pdfUrl && (
                      <a
                        href={project.pdfUrl}
                        download
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d0bdfb] underline underline-offset-4 hover:text-white transition-colors whitespace-nowrap"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className="px-5 py-2.5 rounded-full border border-[#b7b2c9] text-sm font-medium text-[#f2f0f7] hover:bg-[#eee9fa] hover:text-[#161924] transition-colors whitespace-nowrap"
                    >
                      Read the case study
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
