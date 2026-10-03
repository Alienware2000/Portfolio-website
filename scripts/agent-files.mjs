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
const range = (dates) => dates.split("→").map((d) => d.trim());
const links = (p) => [p.live && `[live](${p.live})`, p.code && `[code](${p.code})`].filter(Boolean).join(" · ");

export function toMarkdown() {
  const { profile: p, experience, leadership, projects, achievements, skills, education, about } = data;
  const out = [];
  out.push(`# ${p.name}`, "", `> ${p.role}. ${p.focus}. ${p.school}. ${p.status}.`, "", p.tagline, "");
  out.push("## Contact", "", `- Email: ${p.email}`, `- Website: ${SITE}`, `- GitHub: ${p.github}`, `- LinkedIn: ${p.linkedin}`, `- X: ${p.x}`, `- Resume (PDF): ${SITE}${p.resume}`, `- Location: ${p.location}`, "");
  out.push("## Experience", "");
  for (const j of experience) {
    out.push(`### ${j.role}, ${j.org} (${j.start} to ${j.end})`, "", j.context, "", ...j.bullets.map((b) => `- ${b}`), "", `Stack: ${j.stack.join(", ")}`, "");
  }
  out.push("## Leadership and activities", "");
  for (const g of leadership) out.push(`- **${g.role}, ${g.org}** (${range(g.dates).join(" to ")}): ${g.text}`);
  out.push("", "## Projects", "");
  for (const pr of projects) {
    out.push(`### ${pr.title}`, "", pr.description, "");
    if (pr.award) out.push(`Recognition: ${pr.award}`, "");
    if (pr.highlights) out.push(...pr.highlights.map((h) => `- ${h}`), "");
    out.push(`Tech: ${pr.tags.join(", ")}${links(pr) ? `. Links: ${links(pr)}` : ""}`, "");
  }
  out.push("## Awards", "", ...achievements.map((a) => `- ${a.title}, ${a.event} (${a.year}): ${a.detail}`), "");
  out.push("## Skills", "", ...skills.map((s) => `- ${s.title}: ${s.items.join(", ")}`), "- Spoken languages: English (native), French (working)", "");
  out.push("## Education", "", ...education.map((e) => `- ${e.school}, ${e.degree} (${e.dates})${e.detail ? `. ${e.detail}` : ""}`), "");
  out.push("## About", "", ...about, "");
  return out.join("\n");
}

export function toLlmsTxt() {
  const { profile: p } = data;
  return [
    `# ${p.name}`,
    "",
    `> Personal site of ${p.name}: ${p.role}, ${p.school}. ${p.status}.`,
    "",
    "The full profile below is generated from the same data that renders the site, so it is always current.",
    "",
    "## Machine-readable versions",
    "",
    `- [Full profile, Markdown](${SITE}/resume.md)`,
    `- [Full profile, JSON Resume schema](${SITE}/resume.json)`,
    `- [Resume, PDF](${SITE}${p.resume})`,
    "",
    "---",
    "",
    toMarkdown(),
  ].join("\n");
}

// https://jsonresume.org/schema
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
      highlights: [...(pr.award ? [pr.award] : []), ...(pr.highlights || [])],
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
    `<p><a href="mailto:${p.email}">${p.email}</a> · <a href="${p.github}">GitHub</a> · <a href="${p.linkedin}">LinkedIn</a> · <a href="${p.x}">X</a> · <a href="${p.resume}">Resume (PDF)</a> · <a href="/resume.md">Resume (Markdown)</a> · <a href="/resume.json">Resume (JSON)</a></p>`,
    "<h2>Experience</h2>",
    ...experience.map((j) => `<h3>${esc(j.role)}, ${esc(j.org)} (${esc(j.start)} to ${esc(j.end)})</h3><p>${esc(j.context)}</p>${li(j.bullets.map(esc))}`),
    "<h2>Projects</h2>",
    li(projects.map((pr) => `<strong>${esc(pr.title)}</strong>: ${esc(pr.description)}${pr.award ? ` (${esc(pr.award)})` : ""}${pr.live ? ` <a href="${pr.live}">Live</a>` : ""}${pr.code ? ` <a href="${pr.code}">Code</a>` : ""}`)),
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

export const FILES = {
  "llms.txt": toLlmsTxt,
  "resume.md": toMarkdown,
  "resume.json": () => JSON.stringify(toJsonResume(), null, 2),
  "robots.txt": () => `User-agent: *\nAllow: /\n\n# AI agents: a full Markdown profile is at ${SITE}/llms.txt\n`,
};
