// Builds the machine-readable versions of the site from src/data/profile.js,
// so people, search engines, and AI agents all read the same facts.
import * as data from "../src/data/profile.js";

const SITE = "https://davidantwi.vercel.app";
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// "Jul 2026" -> "2026-07"; "Present"/"Now" -> undefined
const iso = (text) => {
  const m = /([A-Za-z]{3})[a-z]*\s+(\d{4})/.exec(text || "");
  if (!m) return undefined;
  return `${m[2]}-${String(MONTHS.indexOf(m[1].toLowerCase()) + 1).padStart(2, "0")}`;
};
// Set in profile.js whenever "Building now" changes: the "current as of" date for agents
const UPDATED = data.updated;
const AGENT_LINKS = [
  ["/llms.txt", "Profile for AI agents (Markdown, start here)"],
  ["/llms-full.txt", "Everything in one file: profile, every case study, and current work"],
  ["/resume.md", "Full profile (Markdown)"],
  ["/resume.json", "Full profile (JSON Resume schema)"],
  ["/sitemap.xml", "Every page"],
];
// Every current role (the hero's "Now" line only shows three)
const CURRENT = [
  ...data.experience.filter((j) => j.active).map((j) => `${j.role}, ${j.org}`),
  ...data.leadership.filter((g) => g.active).map((g) => `${g.role}, ${g.org}`),
];
const range = (dates) => dates.split("→").map((d) => d.trim());
const links = (p) => [p.live && `[live](${p.live})`, p.code && `[code](${p.code})`].filter(Boolean).join(" · ");

export function toMarkdown() {
  const { profile: p, experience, leadership, projects, achievements, skills, education, about } = data;
  const out = [];
  out.push(`# ${p.name}`, "", `> ${p.role}. ${p.focus}. ${p.school}. ${p.status}.`, "", p.tagline, "", `Last updated: ${UPDATED}`, "");
  out.push("## Currently", "", ...CURRENT.map((n) => `- ${n}`), "");
  out.push("## Contact", "", `- Email: ${p.email}`, `- Website: ${SITE}`, `- GitHub: ${p.github}`, `- LinkedIn: ${p.linkedin}`, `- X: ${p.x}`, `- Resume (PDF): ${SITE}${p.resume}`, `- Location: ${p.location}`, "");
  out.push("## Experience", "");
  for (const j of experience) {
    out.push(`### ${j.role}, ${j.org} (${j.start} to ${j.end})`, "", j.context, "", ...j.bullets.map((b) => `- ${b}`), "", `Stack: ${j.stack.join(", ")}`, "");
  }
  out.push(`## Building now (as of ${UPDATED})`, "", ...data.building.map((b) => `- **${b.tag}${b.org ? ` (${b.org})` : ""}:** ${b.text}`), "");
  out.push("## Leadership and activities", "");
  for (const g of leadership) out.push(`- **${g.role}, ${g.org}** (${range(g.dates).join(" to ")}): ${g.text}`);
  out.push("", "## Projects", "");
  for (const pr of projects) {
    out.push(`### ${pr.title}`, "", pr.description, "");
    if (pr.award) out.push(`Recognition: ${pr.award}`, "");
    if (pr.metric) out.push(`Scale: ${pr.metric}`, "");
    if (pr.highlights) out.push(...pr.highlights.map((h) => `- ${h}`), "");
    if (pr.case) out.push(`Case study: ${SITE}/work/${pr.slug} (Markdown: ${SITE}/work/${pr.slug}.md)`, "");
    out.push(`Tech: ${pr.tags.join(", ")}${links(pr) ? `. Links: ${links(pr)}` : ""}`, "");
  }
  out.push("## Awards", "", ...achievements.map((a) => `- ${a.title}, ${a.event} (${a.year}): ${a.detail}`), "");
  out.push("## Skills", "", ...skills.map((s) => `- ${s.title}: ${s.items.join(", ")}`), "- Spoken languages: English (native), French (working)", "");
  out.push("## Education", "", ...education.map((e) => `- ${e.school}, ${e.degree} (${e.dates})${e.detail ? `. ${e.detail}` : ""}`), "");
  out.push("## About", "", ...about, "");
  return out.join("\n");
}

// The llmstxt.org shape: who, the key facts, and links. Detail lives in llms-full.txt.
export function toLlmsTxt() {
  const { profile: p, experience, achievements } = data;
  const wins = achievements.filter((a) => a.tier === "gold");
  return [
    `# ${p.name}`,
    "",
    `> ${p.role}, ${p.school}. ${p.status}. ${p.tagline}`,
    "",
    `Current as of ${UPDATED}. Everything here is generated from the data that renders the site. Contact: ${p.email}.`,
    "",
    "## At a glance",
    "",
    ...data.stats.map((st) => `- ${st.value} ${st.label}`),
    "",
    "## Currently",
    "",
    ...CURRENT.map((n) => `- ${n}`),
    "",
    "## Experience",
    "",
    ...experience.map((j) => `- ${j.role}, ${j.org} (${j.start} to ${j.end})`),
    "",
    "## Building now",
    "",
    ...data.building.map((b) => `- **${b.tag}${b.org ? ` (${b.org})` : ""}:** ${b.text}`),
    "",
    "## Case studies",
    "",
    ...data.caseStudies.map((c) => `- [${c.title}](${SITE}/work/${c.slug}.md): ${c.case.oneLiner}`),
    "",
    "## Awards",
    "",
    ...wins.map((a) => `- ${a.title}, ${a.event} (${a.year}): ${a.detail}`),
    "",
    "## More",
    "",
    ...AGENT_LINKS.filter(([href]) => href !== "/llms.txt").map(([href, label]) => `- [${label}](${SITE}${href})`),
    `- [Resume, PDF](${SITE}${p.resume})`,
    `- [GitHub](${p.github}) · [LinkedIn](${p.linkedin}) · [X](${p.x})`,
    "",
  ].join("\n");
}

// https://jsonresume.org/schema
// One file with everything, for agents that would rather not follow links
export function toLlmsFull() {
  return [toMarkdown(), "---", "", "# Case studies", "", ...data.caseStudies.flatMap((pr) => [toCaseMarkdown(pr), "---", ""])].join("\n");
}

export function toSitemap() {
  const urls = ["/", ...data.caseStudies.map((pr) => `/work/${pr.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${UPDATED}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`;
}

export function toJsonResume() {
  const { profile: p, experience, leadership, projects, achievements, skills, education } = data;
  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: p.name,
      label: p.role,
      email: p.email,
      url: SITE,
      summary: p.tagline,
      location: { city: "New Haven", region: "CT", countryCode: "US" },
      profiles: [
        { network: "GitHub", username: p.github.split("/").pop(), url: p.github },
        { network: "LinkedIn", url: p.linkedin },
        { network: "X", username: p.x.split("/").pop(), url: p.x },
      ],
    },
    work: experience.map((j) => ({
      name: j.org,
      position: j.role,
      description: j.context,
      startDate: iso(j.start),
      endDate: iso(j.end),
      highlights: j.bullets,
      keywords: j.stack,
    })),
    volunteer: leadership.map((g) => {
      const [start, end] = range(g.dates);
      return { organization: g.org, position: g.role, startDate: iso(start), endDate: iso(end), summary: g.text };
    }),
    education: education.map((e) => ({ institution: e.school, area: e.degree, endDate: iso(e.dates), courses: e.detail ? [e.detail] : [] })),
    awards: achievements.map((a) => ({ title: a.title, awarder: a.event, date: a.year, summary: a.detail })),
    skills: skills.map((s) => ({ name: s.title, keywords: s.items })),
    languages: [
      { language: "English", fluency: "Native" },
      { language: "French", fluency: "Limited working" },
    ],
    projects: projects.map((pr) => ({
      name: pr.title,
      description: pr.description,
      highlights: [...(pr.award ? [pr.award] : []), ...(pr.metric ? [pr.metric] : []), ...(pr.highlights || [])],
      keywords: pr.tags,
      url: pr.live || pr.code,
      repository: pr.code,
      type: pr.category,
    })),
    meta: { canonical: `${SITE}/resume.json`, lastModified: new Date().toISOString().slice(0, 10) },
  };
}

// schema.org Person, embedded in the page head for search engines and agents
export function toJsonLd() {
  const { profile: p, experience, skills } = data;
  const current = experience.find((j) => j.active);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    url: SITE,
    email: `mailto:${p.email}`,
    jobTitle: p.role,
    description: p.tagline,
    image: `${SITE}/images/image.png`,
    sameAs: [p.github, p.linkedin, p.x],
    alumniOf: { "@type": "CollegeOrUniversity", name: "Yale University" },
    worksFor: current && { "@type": "Organization", name: current.org },
    affiliation: experience.filter((j) => j.active).map((j) => ({ "@type": "Organization", name: j.org })),
    dateModified: UPDATED,
    knowsAbout: skills.flatMap((s) => s.items),
  };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Plain HTML placed inside #root so the page has real content before (or without)
// JavaScript. React replaces it as soon as the app mounts.
export function toStaticHtml() {
  const { profile: p, experience, leadership, projects, achievements, skills, education } = data;
  const li = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  return [
    `<h1>${esc(p.name)}</h1>`,
    `<p>${esc(p.role)}. ${esc(p.school)}. ${esc(p.status)}.</p>`,
    `<p>${esc(p.tagline)}</p>`,
    `<p><a href="mailto:${p.email}">${p.email}</a> · <a href="${p.github}">GitHub</a> · <a href="${p.linkedin}">LinkedIn</a> · <a href="${p.x}">X</a> · <a href="${p.resume}">Resume (PDF)</a></p>`,
    `<p>For AI agents (last updated ${UPDATED}): ${AGENT_LINKS.map(([href, label]) => `<a href="${href}">${href}</a> (${esc(label)})`).join(" · ")}</p>`,
    "<h2>Currently</h2>",
    li(CURRENT.map(esc)),
    "<h2>Selected work (case studies)</h2>",
    li(data.caseStudies.map((pr) => `<a href="/work/${pr.slug}">${esc(pr.title)}</a>: ${esc(pr.case.oneLiner)} (<a href="/work/${pr.slug}.md">Markdown</a>)`)),
    `<h2>Building now (as of ${UPDATED})</h2>`,
    li(data.building.map((b) => `<strong>${esc(b.tag)}${b.org ? ` (${esc(b.org)})` : ""}</strong>: ${esc(b.text)}`)),
    "<h2>Experience</h2>",
    ...experience.map((j) => `<h3>${esc(j.role)}, ${esc(j.org)} (${esc(j.start)} to ${esc(j.end)})</h3><p>${esc(j.context)}</p>${li(j.bullets.map(esc))}`),
    "<h2>Projects</h2>",
    li(projects.map((pr) => `<strong>${esc(pr.title)}</strong>: ${esc(pr.description)}${pr.award ? ` (${esc(pr.award)})` : ""}${pr.metric ? ` (${esc(pr.metric)})` : ""}${pr.live ? ` <a href="${pr.live}">Live</a>` : ""}${pr.code ? ` <a href="${pr.code}">Code</a>` : ""}`)),
    "<h2>Leadership</h2>",
    li(leadership.map((g) => `<strong>${esc(g.role)}, ${esc(g.org)}</strong>: ${esc(g.text)}`)),
    "<h2>Awards</h2>",
    li(achievements.map((a) => `${esc(a.title)}, ${esc(a.event)} (${esc(a.year)})`)),
    "<h2>Skills</h2>",
    li(skills.map((s) => `${esc(s.title)}: ${esc(s.items.join(", "))}`)),
    "<h2>Education</h2>",
    li(education.map((e) => `${esc(e.school)}, ${esc(e.degree)} (${esc(e.dates)})`)),
  ].join("\n");
}

// One project as a standalone write-up: same sections as the case study page
export function toCaseMarkdown(pr) {
  const c = pr.case;
  const out = [`# ${pr.title}`, "", `> ${c.oneLiner}`, "", c.scope, ""];
  if (pr.award) out.push(`Recognition: ${pr.award}`, "");
  if (pr.metric) out.push(`Scale: ${pr.metric}`, "");
  if (c.results?.length) out.push("## Results", "", ...c.results.map((r) => `- ${r.value} ${r.label}`), "");
  out.push("## The problem", "", c.problem, "", "## What I built", "", ...c.built.map((b) => `- ${b}`), "", "## The hard part", "", c.hardPart, "");
  if (c.arch) {
    const name = Object.fromEntries(c.arch.nodes.map((n) => [n.id, n.label]));
    out.push("## How it fits together", "", ...c.arch.edges.map((e) => `- ${name[e.from]} -> ${name[e.to]}${e.label ? ` (${e.label})` : ""}`));
    out.push("", `Parts David built: ${c.arch.nodes.filter((n) => n.mine).map((n) => n.label).join(", ")}.`, "");
    if (c.arch.caption) out.push(c.arch.caption, "");
  }
  if (c.decisions?.length) out.push("## Decisions", "", ...c.decisions.map((d) => `- ${d}`), "");
  if (c.media?.length) out.push("## Videos", "", ...c.media.map((m) => `- ${m.caption} (${SITE}${m.video})`), "");
  if (c.next) out.push("## What's next", "", c.next, "");
  out.push(`Tech: ${pr.tags.join(", ")}${links(pr) ? `. Links: ${links(pr)}` : ""}`, "", `Page: ${SITE}/work/${pr.slug}`, "");
  return out.join("\n");
}

// Plain HTML of one case study for /work/<slug>, so it reads fully without JavaScript
export function toCaseHtml(pr) {
  const c = pr.case;
  const li = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  const out = [`<h1>${esc(pr.title)}</h1>`, `<p>${esc(c.oneLiner)}</p>`, `<p>${esc(c.scope)}</p>`];
  if (pr.award) out.push(`<p>Recognition: ${esc(pr.award)}</p>`);
  if (pr.metric) out.push(`<p>Scale: ${esc(pr.metric)}</p>`);
  if (c.results?.length) out.push("<h2>Results</h2>", li(c.results.map((r) => `${r.value} ${r.label}`)));
  out.push("<h2>The problem</h2>", `<p>${esc(c.problem)}</p>`, "<h2>What I built</h2>", li(c.built), "<h2>The hard part</h2>", `<p>${esc(c.hardPart)}</p>`);
  if (c.arch) {
    const name = Object.fromEntries(c.arch.nodes.map((n) => [n.id, n.label]));
    out.push("<h2>How it fits together</h2>", li(c.arch.edges.map((e) => `${name[e.from]} to ${name[e.to]}${e.label ? ` (${e.label})` : ""}`)));
    if (c.arch.caption) out.push(`<p>${esc(c.arch.caption)}</p>`);
  }
  if (c.decisions?.length) out.push("<h2>Decisions</h2>", li(c.decisions));
  if (c.next) out.push("<h2>What's next</h2>", `<p>${esc(c.next)}</p>`);
  out.push(`<p>Tech: ${esc(pr.tags.join(", "))}.${pr.live ? ` <a href="${pr.live}">Live</a>` : ""}${pr.code ? ` <a href="${pr.code}">Code</a>` : ""}</p>`);
  out.push(`<p>By <a href="/">${esc(data.profile.name)}</a> (${esc(data.profile.email)}). Markdown version: <a href="/work/${pr.slug}.md">/work/${pr.slug}.md</a>. Full profile: <a href="/llms.txt">/llms.txt</a>.</p>`);
  return out.join("\n");
}

// Share previews: per-project title and description for /work/<slug>
export function caseMeta() {
  return data.caseStudies.map((pr) => ({
    slug: pr.slug,
    title: `${pr.title} | David Antwi`,
    description: pr.case.oneLiner,
    image: `${SITE}/og/${pr.slug}.jpg`,
    html: toCaseHtml(pr),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: pr.title,
      description: pr.case.oneLiner,
      url: `${SITE}/work/${pr.slug}`,
      author: { "@type": "Person", name: data.profile.name, url: SITE },
      keywords: pr.tags.join(", "),
      dateModified: UPDATED,
    },
  }));
}

export const FILES = {
  "llms.txt": toLlmsTxt,
  "llms-full.txt": toLlmsFull,
  "sitemap.xml": toSitemap,
  "resume.md": toMarkdown,
  "resume.json": () => JSON.stringify(toJsonResume(), null, 2),
  ...Object.fromEntries(data.caseStudies.map((pr) => [`work/${pr.slug}.md`, () => toCaseMarkdown(pr)])),
  "robots.txt": () => `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n\n# AI agents: start at ${SITE}/llms.txt (everything in one file: ${SITE}/llms-full.txt)\n`,
};
