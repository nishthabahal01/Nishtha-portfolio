import React, { useEffect } from 'react';
import { X, ExternalLink, Github, FileDown } from 'lucide-react';
import { CaseStudy, CaseLinksMap } from '../data/portfolioData';
import { WindProxySimulator } from './WindProxySimulator';

interface ProjectModalProps {
  project: CaseStudy | null;
  onClose: () => void;
  caseLinks: CaseLinksMap;
  onOpenConnect: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  caseLinks,
  onOpenConnect,
}) => {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const custom = caseLinks[project.id] || {};
  const lovableUrl =
    custom.lovableUrl !== undefined ? custom.lovableUrl : project.defaultLovableUrl;
  const githubUrl = custom.githubUrl;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#121520] text-[#f2f0f7] border border-white/15 shadow-2xl">
        {/* Moody Dark Case Hero */}
        <div
          style={{
            backgroundImage: `linear-gradient(135deg, ${project.accentColor}26 0%, #161924 65%, #121520 100%)`,
          }}
          className="px-6 sm:px-10 py-8 border-b border-white/15 space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="uppercase text-xs tracking-[2px] font-semibold text-[#b7b5c6]">
                {project.eyebrow} · {project.label}
              </div>
              <h2
                id="case-study-modal-title"
                className="font-display text-3xl sm:text-5xl font-medium tracking-tight text-white"
              >
                {project.title}
                <span className="text-[#c3b0f6]">.</span>
              </h2>
              <p className="text-base sm:text-lg text-[#c7c4d6] max-w-[58ch] leading-relaxed">
                {project.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close case study"
              className="w-10 h-10 rounded-full inline-flex items-center justify-center bg-[#181c2b] hover:bg-[#232940] text-[#f2f0f7] border border-white/15 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Links Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {lovableUrl ? (
              <a
                href={lovableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c3b0f6] text-[#161924] text-sm font-semibold hover:bg-[#d7c9fb] transition-colors"
              >
                <span>{project.lovableLabel || 'View live Lovable app'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-[#181c2b] text-[#e4e1ef] text-xs font-medium hover:bg-[#232940]"
              >
                <span>Add Lovable URL</span>
              </button>
            )}

            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#b7b2c9] bg-[#181c2b] text-[#f2f0f7] text-sm font-medium hover:bg-[#eee9fa] hover:text-[#161924] transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>{custom.githubRepoName || 'View on GitHub'}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-[#181c2b] text-[#e4e1ef] text-xs font-medium hover:bg-[#232940]"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Attach GitHub Repo</span>
              </button>
            )}

            {project.pdfUrl && (
              <a
                href={project.pdfUrl}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#b7b2c9] bg-[#181c2b] text-[#f2f0f7] text-sm font-medium hover:bg-[#eee9fa] hover:text-[#161924] transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            )}
          </div>

          {/* 3-Column Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-white/12 text-sm">
            <div>
              <span className="block uppercase text-[11px] tracking-[1.4px] text-[#9c99ad] mb-1">
                {project.meta.roleLabel}
              </span>
              <strong className="font-medium text-white">{project.meta.roleValue}</strong>
            </div>
            <div>
              <span className="block uppercase text-[11px] tracking-[1.4px] text-[#9c99ad] mb-1">
                {project.meta.forLabel}
              </span>
              <strong className="font-medium text-white">{project.meta.forValue}</strong>
            </div>
            <div>
              <span className="block uppercase text-[11px] tracking-[1.4px] text-[#9c99ad] mb-1">
                {project.meta.contextLabel}
              </span>
              <strong className="font-medium text-white">{project.meta.contextValue}</strong>
            </div>
          </div>
        </div>

        {/* Case Content Panels */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* 3-Step Visual Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {project.threeSteps.map((step) => (
              <div
                key={step.label}
                className="rounded-xl border border-white/12 bg-[#161924] p-5 space-y-2"
              >
                <span className="text-xs font-medium text-[#c3b0f6]">{step.label}</span>
                <h3 className="font-display text-lg font-medium text-white">{step.title}</h3>
                <p className="text-sm text-[#b7b5c6] leading-relaxed">{step.summary}</p>
              </div>
            ))}
          </div>

          {/* Screenshots / Figures */}
          {project.imageSrc && (
            <figure className="rounded-2xl border border-white/15 bg-[#0e111a] overflow-hidden">
              <img
                src={project.imageSrc}
                alt={project.imageAlt || project.title}
                className="w-full h-auto block"
              />
              {project.imageCaption && (
                <figcaption className="px-5 py-3.5 text-xs sm:text-sm text-[#b7b5c6] border-t border-white/10">
                  {project.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {project.hasWindProxySimulator && <WindProxySimulator />}

          {/* Story in Brief + Problem */}
          <div className="rounded-2xl border border-white/12 bg-[#161924] p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="font-display text-xl font-medium text-white">
                01 · The story in brief
              </h3>
              <p className="text-base text-[#d2cfe0] leading-relaxed">{project.storyInBrief}</p>
            </div>

            <div className="space-y-3 pt-5 border-t border-white/12">
              <h3 className="font-display text-xl font-medium text-white">
                02 · {project.problemTitle}
              </h3>
              <p className="text-base text-[#d2cfe0] leading-relaxed">{project.problemBody}</p>
              <blockquote className="font-display text-xl sm:text-2xl text-white leading-snug border-l-3 border-[#c3b0f6] pl-5 mt-4">
                {project.problemQuote}
              </blockquote>
            </div>
          </div>

          {/* Decisions & Tradeoffs Table */}
          <div className="rounded-2xl border border-white/12 bg-[#161924] p-6 sm:p-8 space-y-4">
            <h3 className="font-display text-xl font-medium text-white">
              03 · {project.decisionsTitle}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/15 text-xs text-[#c3b0f6]">
                    <th className="py-3 pr-4 font-medium w-[24%]">Decision</th>
                    <th className="py-3 px-4 font-medium w-[38%]">Reasoning</th>
                    <th className="py-3 pl-4 font-medium w-[38%]">Tradeoff / limit</th>
                  </tr>
                </thead>
                <tbody>
                  {project.decisions.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/10 align-top">
                      <th className="py-3.5 pr-4 font-medium text-white">{row.decision}</th>
                      <td className="py-3.5 px-4 text-[#d2cfe0]">{row.reasoning}</td>
                      <td className="py-3.5 pl-4 text-[#b7b5c6]">{row.tradeoff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Secondary Visual if present */}
          {project.secondaryImageSrc && (
            <figure className="rounded-2xl border border-white/15 bg-[#0e111a] overflow-hidden">
              <img
                src={project.secondaryImageSrc}
                alt={project.secondaryImageAlt || project.title}
                className="w-full h-auto block"
              />
              {project.secondaryImageCaption && (
                <figcaption className="px-5 py-3.5 text-xs sm:text-sm text-[#b7b5c6] border-t border-white/10">
                  {project.secondaryImageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Validation & Next Steps + Stack */}
          <div className="rounded-2xl border border-white/12 bg-[#161924] p-6 sm:p-8 space-y-5">
            <h3 className="font-display text-xl font-medium text-white">
              04 · Validation &amp; next steps
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-[#d2cfe0] leading-relaxed">
              {project.validationPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
            <p className="text-xs sm:text-sm text-[#b7b5c6] border-l-2 border-white/25 pl-4">
              {project.validationNote}
            </p>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1 rounded-full border border-white/15 bg-[#0e111a] text-[#d2cfe0]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
