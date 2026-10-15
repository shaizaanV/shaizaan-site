import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "../content/projects";
import type { IconName } from "../os/icons";
import { PixelIcon } from "../os/PixelIcon";
import { Compiling } from "./Compiling";
import type { AppProps } from "./registry";
import "./projects.css";

type Category = Project["category"];

const CATEGORIES: Record<Category, { label: string; icon: IconName }> = {
  software: { label: "Software", icon: "code" },
  engineering: { label: "Engineering", icon: "gear" },
  personal: { label: "Personal", icon: "doc" },
};

const LINK_LABELS: Record<keyof Project["links"], string> = {
  demo: "Live demo",
  repo: "Source code",
  video: "Watch the video",
};

/** List of projects; params = project slug opens its detail view (#projects/<slug>). */
export function Projects({ params, setParams, open }: AppProps) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const lastOpened = useRef<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Coming back from a project: return focus to the row that opened it.
  useEffect(() => {
    if (params || !lastOpened.current) return;
    listRef.current?.querySelector<HTMLButtonElement>(`[data-slug="${lastOpened.current}"]`)?.focus();
  }, [params]);

  if (projects.length === 0) {
    return (
      <Compiling
        icon="folder"
        title="New projects compiling…"
        actions={
          <button type="button" className="bevel primary" onClick={() => open("tv")}>
            Open ShaizTV
          </button>
        }
      >
        <p>I'm writing these up right now. In the meantime, the builds live on YouTube.</p>
      </Compiling>
    );
  }

  if (params) {
    const project = projects.find((p) => p.slug === params);
    return project ? (
      <ProjectDetail project={project} onBack={() => setParams("")} />
    ) : (
      <div className="projects-missing">
        <h2>Project not found</h2>
        <p>That link points to a project that doesn't exist (or got renamed).</p>
        <button type="button" className="bevel" onClick={() => setParams("")}>
          See all projects
        </button>
      </div>
    );
  }

  const used = (Object.keys(CATEGORIES) as Category[]).filter((c) => projects.some((p) => p.category === c));
  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="projects">
      <header className="projects__head">
        <h2>Things I've built</h2>
        <p className="muted">
          {projects.length} {projects.length === 1 ? "project" : "projects"}. Open one for the full story.
        </p>
      </header>

      {used.length > 1 && (
        <div className="projects__filters" role="group" aria-label="Filter by category">
          {(["all", ...used] as const).map((c) => (
            <button key={c} type="button" className="bevel" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c === "all" ? "All" : CATEGORIES[c].label}
            </button>
          ))}
        </div>
      )}

      <ul className="projects__list" ref={listRef}>
        {shown.map((p) => (
          <li key={p.slug}>
            <button
              type="button"
              className="project-row"
              data-slug={p.slug}
              onClick={() => {
                lastOpened.current = p.slug;
                setParams(p.slug);
              }}
            >
              <PixelIcon name={CATEGORIES[p.category].icon} size={36} />
              <span className="project-row__text">
                <span className="project-row__title">
                  {p.title}
                  {p.draft && <span className="draft-tag">Draft</span>}
                </span>
                <span className="project-row__hook">{p.hook}</span>
              </span>
              <span className="project-row__cat">{CATEGORIES[p.category].label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), [project.slug]);

  const links = (Object.keys(LINK_LABELS) as (keyof Project["links"])[]).filter((k) => project.links[k]);

  return (
    <article className="project">
      <button type="button" className="bevel project__back" onClick={onBack}>
        ← All projects
      </button>

      <header className="project__head">
        <PixelIcon name={CATEGORIES[project.category].icon} size={48} />
        <div>
          <p className="project__cat">
            {CATEGORIES[project.category].label}
            {project.draft && <span className="draft-tag">Draft</span>}
          </p>
          <h2 ref={headingRef} tabIndex={-1}>
            {project.title}
          </h2>
          <p className="project__hook">{project.hook}</p>
        </div>
      </header>

      {project.image && <img className="project__image" src={project.image} alt={project.imageAlt} />}

      <dl className="project__facts">
        <dt>What I built</dt>
        <dd>{project.built}</dd>
        <dt>Why</dt>
        <dd>{project.why}</dd>
        <dt>Tech</dt>
        <dd>
          <ul className="chips" aria-label="Tech used">
            {project.tech.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </dd>
        <dt>My role</dt>
        <dd>{project.role}</dd>
      </dl>

      {links.length > 0 && (
        <div className="btn-row">
          {links.map((k, i) => (
            <a
              key={k}
              className={`bevel btn-link${i === 0 ? " primary" : ""}`}
              href={project.links[k]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {LINK_LABELS[k]} ↗<span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
