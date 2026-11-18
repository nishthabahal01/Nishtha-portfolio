import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const MIND_UPLOADS_DIR = path.join(UPLOADS_DIR, 'mind');
const LINKS_FILE = path.join(DATA_DIR, 'case-links.json');
const MIND_PHOTOS_FILE = path.join(DATA_DIR, 'mind-photos.json');

interface MindUploadedPhoto {
  id: string;
  slotId?: string;
  url: string;
  fileName: string;
  caption: string;
  alt: string;
  uploadedAt: string;
}

interface MindNodePhotos {
  slots: Record<string, MindUploadedPhoto>;
  extra: MindUploadedPhoto[];
}

type MindPhotosMap = Record<string, MindNodePhotos>;

interface GitHubSession {
  accessToken: string;
  user: {
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
  };
  createdAt: number;
}

const githubSessions = new Map<string, GitHubSession>();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MIND_UPLOADS_DIR)) {
    fs.mkdirSync(MIND_UPLOADS_DIR, { recursive: true });
  }
}

function readMindPhotos(): MindPhotosMap {
  try {
    ensureDataDir();
    if (fs.existsSync(MIND_PHOTOS_FILE)) {
      return JSON.parse(fs.readFileSync(MIND_PHOTOS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to read mind photos:', err);
  }
  return {};
}

function writeMindPhotos(data: MindPhotosMap) {
  ensureDataDir();
  fs.writeFileSync(MIND_PHOTOS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function readCaseLinks(): Record<string, { githubUrl?: string; githubRepoName?: string; lovableUrl?: string }> {
  try {
    ensureDataDir();
    if (fs.existsSync(LINKS_FILE)) {
      const raw = fs.readFileSync(LINKS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read case links:', err);
  }
  return {};
}

function writeCaseLinks(links: Record<string, { githubUrl?: string; githubRepoName?: string; lovableUrl?: string }>) {
  ensureDataDir();
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2), 'utf-8');
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = decodeURIComponent(part.slice(idx + 1).trim());
      result[key] = val;
    }
  }
  return result;
}

function getAppBaseUrl(req: express.Request): string {
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl && envUrl !== 'MY_APP_URL') {
    return envUrl.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  ensureDataDir();
  app.use(express.json({ limit: '25mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // 1. GitHub OAuth status & callback URL info
  app.get('/api/auth/github/status', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
    const oauthConfigured = Boolean(
      clientId &&
        clientSecret &&
        clientId !== 'MY_GITHUB_CLIENT_ID' &&
        clientSecret !== 'MY_GITHUB_CLIENT_SECRET'
    );
    const baseUrl = getAppBaseUrl(req);
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = (req.headers['x-github-session'] as string) || cookies.gh_session;
    const session = sessionId ? githubSessions.get(sessionId) : undefined;

    res.json({
      oauthConfigured,
      callbackUrl: `${baseUrl}/auth/callback`,
      connected: Boolean(session),
      user: session?.user ?? null,
    });
  });

  // 2. Construct GitHub OAuth Authorization URL
  app.get('/api/auth/github/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

    if (
      !clientId ||
      !clientSecret ||
      clientId === 'MY_GITHUB_CLIENT_ID' ||
      clientSecret === 'MY_GITHUB_CLIENT_SECRET'
    ) {
      res.status(400).json({
        error: 'GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are not configured yet.',
      });
      return;
    }

    const baseUrl = getAppBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/callback`;
    const state = crypto.randomBytes(16).toString('hex');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user repo',
      state,
    });

    res.json({
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    });
  });

  // 3. GitHub OAuth Callback (handles trailing slash variations & popup postMessage)
  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const code = req.query.code as string | undefined;
    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

    if (!code || !clientId || !clientSecret) {
      res.status(400).send('<p>Missing authorization code or GitHub OAuth configuration.</p>');
      return;
    }

    try {
      const baseUrl = getAppBaseUrl(req);
      const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${baseUrl}/auth/callback`,
        }),
      });

      const tokenData = (await tokenResp.json()) as { access_token?: string; error?: string };
      if (!tokenData.access_token) {
        res.status(400).send(`<p>GitHub OAuth failed: ${tokenData.error || 'No token returned'}</p>`);
        return;
      }

      const userResp = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'nishtha-portfolio-app',
        },
      });
      const userData = (await userResp.json()) as GitHubSession['user'];

      const sessionId = crypto.randomBytes(24).toString('hex');
      githubSessions.set(sessionId, {
        accessToken: tokenData.access_token,
        user: {
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
        },
        createdAt: Date.now(),
      });

      res.cookie('gh_session', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24,
      });

      const safePayload = JSON.stringify({
        type: 'GITHUB_OAUTH_SUCCESS',
        sessionId,
        user: {
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
        },
      });

      res.send(`<!doctype html>
<html>
  <body style="font-family:sans-serif;padding:24px;background:#0e1018;color:#f3f4f6;">
    <p>Connected to GitHub as @${userData.login}. Closing window…</p>
    <script>
      if (window.opener) {
        window.opener.postMessage(${safePayload}, '*');
        window.close();
      } else {
        window.location.href = '/projects/';
      }
    </script>
  </body>
</html>`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.status(500).send('<p>Failed to complete GitHub authentication.</p>');
    }
  });

  // 4. Fetch authenticated user's GitHub repositories
  app.get('/api/github/repos', async (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = (req.headers['x-github-session'] as string) || cookies.gh_session;
    const session = sessionId ? githubSessions.get(sessionId) : undefined;

    if (!session) {
      res.status(401).json({ error: 'Not authenticated with GitHub.' });
      return;
    }

    try {
      const reposResp = await fetch(
        'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator',
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'nishtha-portfolio-app',
          },
        }
      );

      if (!reposResp.ok) {
        res.status(reposResp.status).json({ error: 'Unable to fetch GitHub repositories.' });
        return;
      }

      const repos = (await reposResp.json()) as Array<{
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        homepage: string | null;
        description: string | null;
        private: boolean;
        updated_at: string;
      }>;

      res.json({
        user: session.user,
        repos: repos.map((r) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          htmlUrl: r.html_url,
          homepage: r.homepage,
          description: r.description,
          isPrivate: r.private,
          updatedAt: r.updated_at,
        })),
      });
    } catch (error) {
      console.error('GitHub repos fetch error:', error);
      res.status(500).json({ error: 'Failed to load GitHub repositories.' });
    }
  });

  // 5. Public GitHub username repository lookup (works without OAuth setup)
  app.get('/api/github/public-repos', async (req, res) => {
    const username = ((req.query.username as string) || '').trim();
    if (!username || !/^[a-zA-Z0-9-]+$/.test(username)) {
      res.status(400).json({ error: 'Please provide a valid GitHub username.' });
      return;
    }

    try {
      const [userResp, reposResp] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'nishtha-portfolio-app',
          },
        }),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=50&sort=updated`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              'User-Agent': 'nishtha-portfolio-app',
            },
          }
        ),
      ]);

      if (userResp.status === 404) {
        res.status(404).json({ error: `GitHub user "${username}" not found.` });
        return;
      }

      if (!reposResp.ok) {
        res.status(reposResp.status).json({ error: 'Failed to load public GitHub repositories.' });
        return;
      }

      const userData = (await userResp.json()) as GitHubSession['user'];
      const repos = (await reposResp.json()) as Array<{
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        homepage: string | null;
        description: string | null;
        private: boolean;
        updated_at: string;
      }>;

      res.json({
        user: {
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
        },
        repos: repos.map((r) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          htmlUrl: r.html_url,
          homepage: r.homepage,
          description: r.description,
          isPrivate: r.private,
          updatedAt: r.updated_at,
        })),
      });
    } catch (error) {
      console.error('Public GitHub lookup error:', error);
      res.status(500).json({ error: 'Unable to reach GitHub right now.' });
    }
  });

  // 6. Persist / retrieve case study GitHub & Lovable links
  app.get('/api/case-links', (_req, res) => {
    res.json(readCaseLinks());
  });

  app.post('/api/case-links', (req, res) => {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ error: 'Invalid links payload.' });
      return;
    }
    writeCaseLinks(incoming);
    res.json({ ok: true, links: incoming });
  });

  // 7. Retrieve / upload / delete Mind node photos (Education, Family, Travel, SideQuest Yale, etc.)
  app.get('/api/mind-photos', (_req, res) => {
    res.json(readMindPhotos());
  });

  app.post('/api/mind-photos', (req, res) => {
    const { nodeId, slotId, fileName, caption, alt, dataUrl } = req.body as {
      nodeId?: string;
      slotId?: string;
      fileName?: string;
      caption?: string;
      alt?: string;
      dataUrl?: string;
    };

    const safeNodeId = (nodeId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safeNodeId || !dataUrl) {
      res.status(400).json({ error: 'Missing nodeId or image data.' });
      return;
    }

    const match = /^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Unsupported image format. Please use JPG, PNG, or WEBP.' });
      return;
    }

    const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    const baseRaw = (fileName || 'photo').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
    const id = crypto.randomBytes(6).toString('hex');
    const savedName = `${baseRaw.slice(0, 48)}-${id}.${ext}`;

    const nodeDir = path.join(MIND_UPLOADS_DIR, safeNodeId);
    if (!fs.existsSync(nodeDir)) {
      fs.mkdirSync(nodeDir, { recursive: true });
    }

    const filePath = path.join(nodeDir, savedName);
    fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));

    const photoRecord: MindUploadedPhoto = {
      id,
      slotId: slotId?.replace(/[^a-zA-Z0-9_-]/g, ''),
      url: `/uploads/mind/${safeNodeId}/${savedName}`,
      fileName: fileName || savedName,
      caption: caption?.trim() || fileName?.replace(/\.[^.]+$/, '') || 'Photo',
      alt: alt?.trim() || caption?.trim() || 'Mind gallery photo',
      uploadedAt: new Date().toISOString(),
    };

    const current = readMindPhotos();
    if (!current[safeNodeId]) {
      current[safeNodeId] = { slots: {}, extra: [] };
    }

    if (photoRecord.slotId) {
      current[safeNodeId].slots[photoRecord.slotId] = photoRecord;
    } else {
      current[safeNodeId].extra.push(photoRecord);
    }

    writeMindPhotos(current);
    res.json({ ok: true, photos: current, photo: photoRecord });
  });

  app.delete('/api/mind-photos', (req, res) => {
    const { nodeId, slotId, photoId } = req.body as {
      nodeId?: string;
      slotId?: string;
      photoId?: string;
    };
    const safeNodeId = (nodeId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safeNodeId) {
      res.status(400).json({ error: 'Missing nodeId.' });
      return;
    }

    const current = readMindPhotos();
    const entry = current[safeNodeId];
    if (!entry) {
      res.json({ ok: true, photos: current });
      return;
    }

    const removeDiskFile = (urlPath?: string) => {
      if (!urlPath?.startsWith('/uploads/mind/')) return;
      const diskPath = path.join(UPLOADS_DIR, urlPath.replace(/^\/uploads\//, ''));
      if (diskPath.startsWith(MIND_UPLOADS_DIR) && fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (err) {
          console.warn('Could not delete old file:', err);
        }
      }
    };

    if (slotId && entry.slots[slotId]) {
      removeDiskFile(entry.slots[slotId].url);
      delete entry.slots[slotId];
    } else if (photoId) {
      const idx = entry.extra.findIndex((p) => p.id === photoId);
      if (idx > -1) {
        removeDiskFile(entry.extra[idx].url);
        entry.extra.splice(idx, 1);
      }
    }

    writeMindPhotos(current);
    res.json({ ok: true, photos: current });
  });

  // Mount Vite middleware in dev or serve built dist in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nishtha portfolio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
