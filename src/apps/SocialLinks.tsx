import { socials } from "../content/socials";
import "./social-links.css";

const BADGES: Record<string, string> = {
  youtube: "YT",
  instagram: "IG",
  tiktok: "TT",
  x: "X",
  github: "GH",
};

/** Every social link as a row: badge, platform, handle. Opens in a new tab. */
export function SocialLinks() {
  return (
    <ul className="social-links">
      {socials.map((s) => (
        <li key={s.id}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className={`social-link social-link--${s.id}`}>
            <span className="social-link__badge" aria-hidden="true">
              {BADGES[s.id] ?? s.label.slice(0, 2).toUpperCase()}
            </span>
            <span className="social-link__name">{s.label}</span>
            <span className="social-link__handle">{s.handle}</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
