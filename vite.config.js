import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pathToFileURL } from 'node:url'
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
        res.setHeader('Content-Type', name.endsWith('.json') ? 'application/json' : 'text/plain; charset=utf-8')
        res.end(FILES[name]())
      })
    },
    async generateBundle() {
      const { FILES } = await load()
      for (const [fileName, make] of Object.entries(FILES)) {
        this.emitFile({ type: 'asset', fileName, source: make() })
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
