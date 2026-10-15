import { about } from "../content/about";
import { skills } from "../content/skills";
import { PixelIcon } from "../os/PixelIcon";
import type { AppProps } from "./registry";
import "./about.css";

export function About({ open }: AppProps) {
  return (
    <div className="about">
      <header className="about__head">
        <span className="about__avatar">
          <PixelIcon name="person" size={72} />
        </span>
        <div>
          <h2>{about.name}</h2>
          <p className="about__roles">{about.roles.join(" · ")}</p>
        </div>
      </header>

      <div className="about__bio">
        {about.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section aria-labelledby="about-inventory">
        <h3 id="about-inventory" className="about__label">
          Inventory <span className="muted">· skills equipped</span>
        </h3>
        <ul className="inventory">
          {skills.map((s) => (
            <li key={s.label} className="inventory__slot">
              <span className="inventory__icon" aria-hidden="true">
                {s.icon}
              </span>
              <span className="inventory__label">{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="btn-row">
        <button type="button" className="bevel primary" onClick={() => open("projects")}>
          See what I've built
        </button>
        <button type="button" className="bevel" onClick={() => open("mail")}>
          Say hi
        </button>
      </div>
    </div>
  );
}
