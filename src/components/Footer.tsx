import React from 'react';
import { ActiveRoute } from './Navbar';

interface FooterProps {
  isDark: boolean;
  onNavigate: (route: ActiveRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ isDark, onNavigate }) => {
  return (
    <footer
      className={`no-print border-t transition-colors duration-300 ${
        isDark
          ? 'bg-[#161924] border-white/15 text-[#b7b5c6]'
          : 'bg-[#fafafa] border-[#dedede] text-[#666666]'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-[6%] py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
        <span>© 2026 Nishtha</span>
        <div className="flex flex-wrap items-center gap-6">
          <span>Always curious. Always becoming.</span>
          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className={`underline underline-offset-4 ${
              isDark ? 'hover:text-white' : 'hover:text-[#2448f5]'
            }`}
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => onNavigate('resume')}
            className={`underline underline-offset-4 ${
              isDark ? 'hover:text-white' : 'hover:text-[#2448f5]'
            }`}
          >
            Resume
          </button>
        </div>
      </div>
      <p
        className={`text-[11px] text-center leading-relaxed px-4 pb-6 m-0 ${
          isDark ? 'text-[#8c869a]' : 'text-[#777777]'
        }`}
      >
        Drafted by Codex (OpenAI), based on the direction of Nishtha Bahal.
      </p>
    </footer>
  );
};
