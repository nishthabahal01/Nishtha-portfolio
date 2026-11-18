import React, { useEffect, useState } from 'react';
import { X, Github, ExternalLink, Check, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { CASE_STUDIES, CaseLinksMap } from '../data/portfolioData';

export interface GitHubRepoItem {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  homepage: string | null;
  description: string | null;
  isPrivate: boolean;
  updatedAt: string;
}

export interface GitHubUserInfo {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

interface ConnectIntegrationsModalProps {
  open: boolean;
  onClose: () => void;
  caseLinks: CaseLinksMap;
  onSaveCaseLinks: (updated: CaseLinksMap) => Promise<void>;
}

export const ConnectIntegrationsModal: React.FC<ConnectIntegrationsModalProps> = ({
  open,
  onClose,
  caseLinks,
  onSaveCaseLinks,
}) => {
  const [oauthConfigured, setOauthConfigured] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState('');
  const [ghSessionId, setGhSessionId] = useState<string | null>(() =>
    localStorage.getItem('nishtha_gh_session')
  );
  const [ghUser, setGhUser] = useState<GitHubUserInfo | null>(null);
  const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
  const [usernameInput, setUsernameInput] = useState('nishthabahal');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [draftLinks, setDraftLinks] = useState<CaseLinksMap>(caseLinks);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setDraftLinks(caseLinks);
  }, [caseLinks, open]);

  useEffect(() => {
    if (!open) return;
    fetch('/api/auth/github/status', {
      headers: ghSessionId ? { 'x-github-session': ghSessionId } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        setOauthConfigured(Boolean(data.oauthConfigured));
        setCallbackUrl(data.callbackUrl || `${window.location.origin}/auth/callback`);
        if (data.connected && data.user) {
          setGhUser(data.user);
          fetchAuthenticatedRepos(ghSessionId);
        }
      })
      .catch(() => {});
  }, [open, ghSessionId]);

  const fetchAuthenticatedRepos = async (sessionIdOverride?: string | null) => {
    const sid = sessionIdOverride ?? ghSessionId;
    setLoadingRepos(true);
    setStatusError(null);
    try {
      const resp = await fetch('/api/github/repos', {
        headers: sid ? { 'x-github-session': sid } : {},
      });
      if (!resp.ok) throw new Error('Unable to load GitHub repositories.');
      const data = await resp.json();
      setGhUser(data.user);
      setRepos(data.repos || []);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'GitHub error');
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        const sid = event.data.sessionId as string | undefined;
        if (sid) {
          localStorage.setItem('nishtha_gh_session', sid);
          setGhSessionId(sid);
        }
        if (event.data.user) {
          setGhUser(event.data.user);
        }
        fetchAuthenticatedRepos(sid);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleOAuthConnect = async () => {
    setStatusError(null);
    try {
      const resp = await fetch('/api/auth/github/url');
      const data = await resp.json();
      if (!resp.ok || !data.url) {
        setStatusError(data.error || 'GitHub OAuth is not configured yet.');
        return;
      }
      const popup = window.open(data.url, 'github_oauth_popup', 'width=640,height=720');
      if (!popup) {
        setStatusError('Popup was blocked. Please allow popups for this site and try again.');
      }
    } catch {
      setStatusError('Could not initiate GitHub OAuth flow.');
    }
  };

  const handleFetchPublicUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = usernameInput.trim();
    if (!cleaned) return;
    setLoadingRepos(true);
    setStatusError(null);
    try {
      const resp = await fetch(`/api/github/public-repos?username=${encodeURIComponent(cleaned)}`);
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Unable to load repositories for that user.');
      }
      setGhUser(data.user);
      setRepos(data.repos || []);
      if ((data.repos || []).length === 0) {
        setStatusError(
          `Found @${data.user.login}, but this account has 0 public repositories. Use "Connect with GitHub OAuth" above to access private repositories.`
        );
      }
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleAutoMatchRepos = () => {
    if (repos.length === 0) return;
    const keywords: Record<string, string[]> = {
      'aditis-wardrobe': ['wardrobe', 'saree', 'outfit', 'closet', 'aditi'],
      'hoarding-wind-simulator': ['wind', 'hoarding', 'billboard', 'vision-engine', 'simulator'],
      'loreal-brandstorm': ['loreal', 'brandstorm', 'auralis', 'scent', 'nfc', 'beauty'],
      'gtm-prospect-finder': ['gtm', 'prospect', 'outreach-finder', 'sales'],
      'climate-outreach': ['climate', 'saas', 'outbound', 'clay', 'n8n'],
    };

    const next = { ...draftLinks };
    CASE_STUDIES.forEach((c) => {
      const kws = keywords[c.id] || [];
      const match = repos.find((repo) => {
        const hay = `${repo.name} ${repo.description || ''}`.toLowerCase();
        return kws.some((k) => hay.includes(k));
      });
      if (match) {
        next[c.id] = {
          ...next[c.id],
          githubUrl: match.htmlUrl,
          githubRepoName: match.fullName,
          lovableUrl:
            next[c.id]?.lovableUrl ||
            (match.homepage && match.homepage.includes('lovable') ? match.homepage : c.defaultLovableUrl),
        };
      }
    });
    setDraftLinks(next);
  };

  const updateCaseField = (
    caseId: string,
    field: 'githubUrl' | 'githubRepoName' | 'lovableUrl',
    value: string
  ) => {
    setDraftLinks((prev) => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        [field]: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await onSaveCaseLinks(draftLinks);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-integrations-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#121520] text-[#f2f0f7] border border-white/15 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 bg-[#161924] border-b border-white/15">
          <div>
            <h2 id="connect-integrations-title" className="font-display text-xl sm:text-2xl font-semibold text-white">
              Connect GitHub &amp; Lovable to Cases
            </h2>
            <p className="text-xs sm:text-sm text-[#b7b5c6] mt-0.5">
              Attach your GitHub repositories and Lovable live app URLs to each case study.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close integration settings"
            className="w-10 h-10 rounded-lg inline-flex items-center justify-center border border-white/15 bg-[#181c2b] hover:bg-[#232940] text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* GitHub Connection Box */}
          <div className="rounded-xl border border-white/15 bg-[#161924] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0d1018] border border-white/15 text-white flex items-center justify-center">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-white">GitHub Account</h3>
                  <p className="text-xs text-[#b7b5c6]">
                    {ghUser
                      ? `Loaded @${ghUser.login} (${repos.length} repositories)`
                      : 'Connect via GitHub OAuth for private/public repos, or lookup a username'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {oauthConfigured ? (
                  <button
                    type="button"
                    onClick={handleOAuthConnect}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c3b0f6] text-[#161924] text-xs sm:text-sm font-semibold hover:bg-[#d7c9fb] transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>{ghUser ? 'Reconnect GitHub OAuth' : 'Connect with GitHub OAuth'}</span>
                  </button>
                ) : (
                  <span className="text-xs text-[#b7b5c6] border border-white/15 px-3 py-1.5 rounded-lg bg-[#0e111a]">
                    OAuth env keys optional
                  </span>
                )}
              </div>
            </div>

            {/* Public Username Lookup */}
            <form onSubmit={handleFetchPublicUser} className="flex flex-wrap items-center gap-2.5">
              <label className="sr-only" htmlFor="gh-username-input">
                GitHub username
              </label>
              <input
                id="gh-username-input"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter GitHub username (e.g. nishthabahal)"
                className="flex-1 min-w-[220px] px-3.5 py-2 rounded-lg border border-white/15 text-sm bg-[#0d1018] text-white placeholder:text-[#8c869a] focus:outline-none focus:ring-2 focus:ring-[#c3b0f6]"
              />
              <button
                type="submit"
                disabled={loadingRepos}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#b7b2c9] text-sm font-medium text-[#f2f0f7] hover:bg-[#eee9fa] hover:text-[#161924] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRepos ? 'animate-spin' : ''}`} />
                <span>Load Public Repos</span>
              </button>

              {repos.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoMatchRepos}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#231f3b] border border-[#c3b0f6]/35 text-[#d0bdfb] text-sm font-medium hover:bg-[#2d274b] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-match to cases</span>
                </button>
              )}
            </form>

            {!oauthConfigured && (
              <div className="rounded-lg bg-[#0e111a] border border-white/10 p-3.5 text-xs text-[#b7b5c6] space-y-1">
                <div className="font-medium text-white">
                  Want 1-click private + public repo access via GitHub OAuth?
                </div>
                <p>
                  Create a GitHub OAuth App at{' '}
                  <a
                    href="https://github.com/settings/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#d0bdfb] hover:text-white"
                  >
                    github.com/settings/developers
                  </a>{' '}
                  with callback URL{' '}
                  <code className="px-1.5 py-0.5 rounded bg-[#161924] border border-white/15 text-[#f2f0f7]">
                    {callbackUrl || `${window.location.origin}/auth/callback`}
                  </code>{' '}
                  and add <code className="font-mono text-[#e4e1ef]">GITHUB_CLIENT_ID</code> &amp;{' '}
                  <code className="font-mono text-[#e4e1ef]">GITHUB_CLIENT_SECRET</code> in Secrets.
                  Or paste any GitHub &amp; Lovable URLs directly below.
                </p>
              </div>
            )}

            {statusError && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-950/50 border border-amber-400/30 px-3.5 py-2.5 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}
          </div>

          {/* Case Study Link Mapping List */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-white">
              Case Study Links (GitHub &amp; Lovable)
            </h3>
            <div className="space-y-4">
              {CASE_STUDIES.map((study) => {
                const entry = draftLinks[study.id] || {};
                const lovableVal =
                  entry.lovableUrl !== undefined ? entry.lovableUrl : study.defaultLovableUrl || '';
                const githubVal = entry.githubUrl || '';

                return (
                  <div
                    key={study.id}
                    className="rounded-xl border border-white/12 bg-[#161924] p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-display font-semibold text-base text-white">
                        {study.index}. {study.title}
                      </div>
                      <span className="text-xs text-[#b7b5c6]">{study.label}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* GitHub Repo Picker + Input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-[#d2cfe0]">
                          GitHub Repository URL
                        </label>
                        {repos.length > 0 && (
                          <select
                            aria-label={`Select GitHub repo for ${study.title}`}
                            value={githubVal}
                            onChange={(e) => {
                              const selected = repos.find((r) => r.htmlUrl === e.target.value);
                              updateCaseField(study.id, 'githubUrl', e.target.value);
                              updateCaseField(
                                study.id,
                                'githubRepoName',
                                selected ? selected.fullName : ''
                              );
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/15 bg-[#0d1018] text-white text-xs mb-1"
                          >
                            <option value="">-- Choose from loaded GitHub repos --</option>
                            {repos.map((r) => (
                              <option key={r.id} value={r.htmlUrl}>
                                {r.fullName} {r.isPrivate ? '(private)' : ''}
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          type="url"
                          value={githubVal}
                          onChange={(e) => updateCaseField(study.id, 'githubUrl', e.target.value)}
                          placeholder="https://github.com/username/repo"
                          className="w-full px-3 py-2 rounded-lg border border-white/15 bg-[#0d1018] text-white placeholder:text-[#8c869a] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c3b0f6]"
                        />
                      </div>

                      {/* Lovable Live App URL */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-[#d2cfe0]">
                          Lovable App / Prototype URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={lovableVal}
                            onChange={(e) => updateCaseField(study.id, 'lovableUrl', e.target.value)}
                            placeholder="https://your-project.lovable.app/"
                            className="flex-1 px-3 py-2 rounded-lg border border-white/15 bg-[#0d1018] text-white placeholder:text-[#8c869a] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c3b0f6]"
                          />
                          {lovableVal && (
                            <a
                              href={lovableVal}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open Lovable link for ${study.title}`}
                              className="px-2.5 py-2 rounded-lg border border-white/15 bg-[#0d1018] hover:bg-[#1e2336] inline-flex items-center justify-center"
                            >
                              <ExternalLink className="w-4 h-4 text-[#c3b0f6]" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Bar */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-white/20 text-sm text-[#d2cfe0] hover:bg-white/10"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#c3b0f6] text-[#161924] text-sm font-semibold hover:bg-[#d7c9fb] transition-colors disabled:opacity-60"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved to Cases</span>
                </>
              ) : (
                <span>{saving ? 'Saving…' : 'Save Case Links'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
