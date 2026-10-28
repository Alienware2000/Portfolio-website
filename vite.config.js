import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pathToFileURL } from 'node:url'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

// Serves llms.txt, resume.md and resume.json generated from src/data/profile.js,
// and puts a plain-HTML copy of the profile plus schema.org data into index.html,
// so AI agents and crawlers can read everything without running JavaScript.
function agentReadable() {
  // In dev, load through Vite so edits to profile.js show up without a restart
  const load = (server) =>
    server
      ? server.ssrLoadModule('/scripts/agent-files.mjs')
      : import(pathToFileURL(resolve(process.cwd(), 'scripts/agent-files.mjs')).href)
  return {
    name: 'agent-readable',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const name = req.url.split('?')[0].slice(1)
        const { FILES } = await load(server)
        if (!FILES[name]) return next()
        const type = name.endsWith('.json') ? 'application/json' : name.endsWith('.xml') ? 'application/xml' : name.endsWith('.md') ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8'
        res.setHeader('Content-Type', type)
        res.end(FILES[name]())
      })
    },
    async generateBundle() {
      const { FILES } = await load()
      for (const [fileName, make] of Object.entries(FILES)) {
        this.emitFile({ type: 'asset', fileName, source: make() })
      }
    },
    // Each case study gets its own HTML file with its own title and share preview,
    // so a link pasted into Slack or iMessage shows that project, not the home page
    async writeBundle(options) {
      const { caseMeta } = await load()
      const dir = options.dir || 'dist'
      const base = await readFile(resolve(dir, 'index.html'), 'utf8')
      const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
      for (const m of caseMeta()) {
        const url = `https://davidantwi.vercel.app/work/${m.slug}`
        let html = base
          .replace(/<title>.*?<\/title>/, `<title>${esc(m.title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(m.description)}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
          .replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="article" />')
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(m.title)}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(m.description)}`)
          // The page's readable copy is this case study, not the home profile
          .replace(/<div id="static-profile">[\s\S]*?<\/div>/, `<div id="static-profile">\n${m.html}\n</div>`)
          .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(m.jsonLd)}</script>`)
          .replace('<link rel="alternate" type="text/markdown" href="/resume.md"', `<link rel="alternate" type="text/markdown" href="/work/${m.slug}.md"`)
          .replace('href="/work/' + m.slug + '.md" title="Full profile (Markdown)"', 'href="/work/' + m.slug + '.md" title="This case study (Markdown)"')
        html = html
          .replace(/(<meta property="og:image" content=")[^"]*/, `$1${m.image}`)
          .replace(/(<meta name="twitter:image" content=")[^"]*/, `$1${m.image}`)
        await mkdir(resolve(dir, 'work', m.slug), { recursive: true })
        await writeFile(resolve(dir, 'work', m.slug, 'index.html'), html)
      }
    },
    async transformIndexHtml(html, ctx) {
      const { toJsonLd, toStaticHtml } = await load(ctx.server)
      return html
        .replace('</head>', `  <script type="application/ld+json">${JSON.stringify(toJsonLd())}</script>\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">\n<div id="static-profile">\n${toStaticHtml()}\n</div>\n</div>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), agentReadable()],
})
