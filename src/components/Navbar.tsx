import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type ActiveRoute = 'home' | 'projects' | 'mind' | 'resume';

interface NavbarProps {
  activeRoute: ActiveRoute;
  onNavigate: (route: ActiveRoute) => void;
  isDarkHeader: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeRoute, onNavigate, isDarkHeader }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLink = (route: ActiveRoute) => {
    setMobileOpen(false);
    onNavigate(route);
  };

  const linkClass = (active: boolean) => {
    if (isDarkHeader) {
      return `whitespace-nowrap shrink-0 text-[15px] py-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6] rounded-sm ${
        active
          ? 'text-[#f2f0f7] border-b-2 border-[#c3b0f6]'
          : 'text-[#b7b5c6] hover:text-[#c3b0f6]'
      }`;
    }
    return `whitespace-nowrap shrink-0 text-[15px] py-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2448f5] rounded-sm ${
      active
        ? 'text-[#202020] border-b-2 border-[#2448f5]'
        : 'text-[#666666] hover:text-[#2448f5]'
    }`;
  };

  return (
    <header
      className={`no-print sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
        isDarkHeader
          ? 'bg-[#161924]/92 border-white/15 text-[#f2f0f7] backdrop-blur-md'
          : 'bg-[#fafafa]/92 border-[#dedede] text-[#202020] backdrop-blur-md'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-[6%] h-20 md:h-24 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleLink('home')}
          aria-label="Nishtha home"
          className={`font-display text-[25px] font-extrabold tracking-[-1px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 rounded-sm ${
            isDarkHeader
              ? 'text-[#f2f0f7] focus-visible:ring-[#c3b0f6]'
              : 'text-[#202020] focus-visible:ring-[#2448f5]'
          }`}
        >
          nishtha<span className={isDarkHeader ? 'text-[#c3b0f6]' : 'text-[#2448f5]'}>.</span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
          <button
            type="button"
            onClick={() => handleLink('home')}
            aria-current={activeRoute === 'home' ? 'page' : undefined}
            className={linkClass(activeRoute === 'home')}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleLink('projects')}
            aria-current={activeRoute === 'projects' ? 'page' : undefined}
            className={linkClass(activeRoute === 'projects')}
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => handleLink('mind')}
            aria-current={activeRoute === 'mind' ? 'page' : undefined}
            className={linkClass(activeRoute === 'mind')}
          >
            Mind
          </button>
          <button
            type="button"
            onClick={() => handleLink('resume')}
            aria-current={activeRoute === 'resume' ? 'page' : undefined}
            className={linkClass(activeRoute === 'resume')}
          >
            Resume
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {activeRoute === 'mind' ? (
            <button
              type="button"
              onClick={() => handleLink('home')}
              className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-full border border-[#b7b2c9] text-[#f2f0f7] hover:bg-[#eee9fa] hover:text-[#222334] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3b0f6]"
            >
              Outside world
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleLink('mind')}
              className={`hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-full border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 ${
                isDarkHeader
                  ? 'border-[#b7b2c9] text-[#f2f0f7] hover:bg-[#eee9fa] hover:text-[#222334] focus-visible:ring-[#c3b0f6]'
                  : 'border-[#202020] text-[#202020] hover:bg-[#202020] hover:text-white focus-visible:ring-[#2448f5]'
              }`}
            >
              Inside my mind
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className={`md:hidden border-t px-[6%] py-4 flex flex-col gap-1 ${
            isDarkHeader
              ? 'bg-[#161924] border-white/15 text-[#f2f0f7]'
              : 'bg-[#fafafa] border-[#dedede] text-[#202020]'
          }`}
        >
          <button
            type="button"
            onClick={() => handleLink('home')}
            className="w-full text-left py-2.5 text-base min-h-[44px]"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleLink('projects')}
            className="w-full text-left py-2.5 text-base min-h-[44px]"
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => handleLink('mind')}
            className="w-full text-left py-2.5 text-base min-h-[44px]"
          >
            Mind
          </button>
          <button
            type="button"
            onClick={() => handleLink('resume')}
            className="w-full text-left py-2.5 text-base min-h-[44px]"
          >
            Resume
          </button>
        </div>
      )}
    </header>
  );
};
