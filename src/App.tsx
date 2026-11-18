import { useCallback, useEffect, useState } from 'react';
import { Navbar, ActiveRoute } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { PersonalSection } from './components/PersonalSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ProjectModal } from './components/ProjectModal';
import { MindNetwork } from './components/MindNetwork';
import { ResumeView } from './components/ResumeView';
import { ConnectIntegrationsModal } from './components/ConnectIntegrationsModal';
import { Footer } from './components/Footer';
import { CASE_STUDIES, CaseLinksMap, CaseStudy } from './data/portfolioData';

function parseRoute(pathname: string): { route: ActiveRoute; caseSlug?: string } {
  const clean = pathname.toLowerCase().replace(/\/+$/, '');
  if (clean === '/mind') return { route: 'mind' };
  if (clean === '/resume') return { route: 'resume' };
  if (clean === '/projects') return { route: 'projects' };
  if (clean.startsWith('/projects/')) {
    const slug = clean.replace('/projects/', '');
    return { route: 'projects', caseSlug: slug };
  }
  return { route: 'home' };
}

export default function App() {
  const initial = parseRoute(window.location.pathname);
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>(initial.route);
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(() => {
    if (initial.caseSlug) {
      return CASE_STUDIES.find((c) => c.slug === initial.caseSlug) ?? null;
    }
    return null;
  });
  const [connectOpen, setConnectOpen] = useState(false);
  const [transitioningToMind, setTransitioningToMind] = useState(false);
  const [targetMindNode, setTargetMindNode] = useState<string | null>(null);

  const [caseLinks, setCaseLinks] = useState<CaseLinksMap>(() => {
    try {
      const saved = localStorage.getItem('nishtha_case_links');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load persisted case links from backend server
  useEffect(() => {
    fetch('/api/case-links')
      .then((r) => (r.ok ? r.json() : {}))
      .then((serverLinks: CaseLinksMap) => {
        if (serverLinks && Object.keys(serverLinks).length > 0) {
          setCaseLinks((prev) => {
            const merged = { ...prev, ...serverLinks };
            localStorage.setItem('nishtha_case_links', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseRoute(window.location.pathname);
      setActiveRoute(parsed.route);
      if (parsed.caseSlug) {
        setSelectedProject(CASE_STUDIES.find((c) => c.slug === parsed.caseSlug) ?? null);
      } else {
        setSelectedProject(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((route: ActiveRoute) => {
    setSelectedProject(null);

    if (route === 'mind') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) {
        setTransitioningToMind(true);
        window.setTimeout(() => {
          window.history.pushState({}, '', '/mind/');
          setActiveRoute('mind');
          window.scrollTo({ top: 0, behavior: 'auto' });
          setTransitioningToMind(false);
        }, 200);
        return;
      }
      window.history.pushState({}, '', '/mind/');
      setActiveRoute('mind');
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (route === 'projects') {
      window.history.pushState({}, '', '/projects/');
      setActiveRoute('projects');
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (route === 'resume') {
      window.history.pushState({}, '', '/resume/');
      setActiveRoute('resume');
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    window.history.pushState({}, '', '/');
    setActiveRoute('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleOpenMindNode = useCallback(
    (nodeId: string) => {
      setTargetMindNode(nodeId);
      navigate('mind');
    },
    [navigate]
  );

  const handleConsumeMindNode = useCallback(() => {
    setTargetMindNode(null);
  }, []);

  const handleOpenCase = useCallback((study: CaseStudy) => {
    window.history.pushState({}, '', `/projects/${study.slug}/`);
    setActiveRoute('projects');
    setSelectedProject(study);
  }, []);

  const handleCloseCase = useCallback(() => {
    setSelectedProject(null);
    window.history.pushState({}, '', '/projects/');
  }, []);

  const handleSaveCaseLinks = useCallback(async (updated: CaseLinksMap) => {
    setCaseLinks(updated);
    localStorage.setItem('nishtha_case_links', JSON.stringify(updated));
    try {
      await fetch('/api/case-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to persist links to server:', err);
    }
  }, []);

  const isDarkPage = true;

  return (
    <div
      className={`min-h-screen flex flex-col transition-opacity duration-200 bg-[#0f121b] text-[#f2f0f7] ${
        transitioningToMind ? 'opacity-20' : 'opacity-100'
      }`}
    >
      <Navbar activeRoute={activeRoute} onNavigate={navigate} isDarkHeader={isDarkPage} />

      <main className="flex-1">
        {activeRoute === 'mind' ? (
          <MindNetwork
            onExitMind={() => navigate('home')}
            onOpenCase={handleOpenCase}
            onOpenResume={() => navigate('resume')}
            caseLinks={caseLinks}
            initialNodeId={targetMindNode}
            onConsumeInitialNode={handleConsumeMindNode}
          />
        ) : activeRoute === 'projects' ? (
          <ProjectsSection
            onSelectProject={handleOpenCase}
            caseLinks={caseLinks}
            onOpenConnect={() => setConnectOpen(true)}
          />
        ) : activeRoute === 'resume' ? (
          <ResumeView
            onOpenCase={handleOpenCase}
            onOpenProjects={() => navigate('projects')}
          />
        ) : (
          <>
            <HomeHero
              onEnterMind={() => navigate('mind')}
              onExploreProjects={() => navigate('projects')}
            />
            <PersonalSection
              onOpenResume={() => navigate('resume')}
              onOpenMindNode={handleOpenMindNode}
            />
          </>
        )}
      </main>

      <Footer isDark={isDarkPage} onNavigate={navigate} />

      <ProjectModal
        project={selectedProject}
        onClose={handleCloseCase}
        caseLinks={caseLinks}
        onOpenConnect={() => setConnectOpen(true)}
      />

      <ConnectIntegrationsModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        caseLinks={caseLinks}
        onSaveCaseLinks={handleSaveCaseLinks}
      />
    </div>
  );
}
