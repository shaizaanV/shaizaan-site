import { useState } from "react";
import { socials } from "../content/socials";
import { videos, type Video } from "../content/videos";
import { Compiling } from "./Compiling";
import type { AppProps } from "./registry";
import "./tv.css";

const channel = socials.find((s) => s.id === "youtube")!;
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function SubscribeLink({ primary = false }: { primary?: boolean }) {
  return (
    <a className={`bevel${primary ? " primary" : ""}`} href={channel.url} target="_blank" rel="noopener noreferrer">
      Subscribe on YouTube ↗<span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Curated YouTube videos. params = video id (#tv/<id>) picks what's on screen. */
export function Tv({ params, setParams }: AppProps) {
  if (videos.length === 0) {
    return (
      <Compiling icon="tv" title="New videos compiling…" actions={<SubscribeLink primary />}>
        <p>ShaizTV is releasing soon. Until then, everything's on YouTube at {channel.handle}.</p>
      </Compiling>
    );
  }

  const current = videos.find((v) => v.id === params) ?? videos[0]!;
  return (
    <div className="tv">
      <Screen key={current.id} video={current} />

      <div className="tv__now">
        <div>
          <p className="tv__label">Now showing</p>
          <h2>{current.title}</h2>
          {current.blurb && <p className="tv__blurb">{current.blurb}</p>}
        </div>
        <SubscribeLink />
      </div>

      {videos.length > 1 && (
        <section aria-labelledby="tv-channels">
          <h3 id="tv-channels" className="tv__label">
            Channels
          </h3>
          <ul className="tv__list">
            {videos.map((v, i) => (
              <li key={v.id}>
                <button
                  type="button"
                  className="tv__item"
                  aria-current={v.id === current.id ? "true" : undefined}
                  onClick={() => setParams(v.id)}
                >
                  <img src={thumb(v.id)} alt="" loading="lazy" />
                  <span className="tv__ch">CH {String(i + 1).padStart(2, "0")}</span>
                  <span className="tv__item-title">{v.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Shows the thumbnail until pressed; only then loads YouTube's player. */
function Screen({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="tv__set">
      <div className="tv__screen">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="tv__play" onClick={() => setPlaying(true)}>
            <img src={thumb(video.id)} alt="" />
            <span className="tv__play-btn" aria-hidden="true">
              ▶
            </span>
            <span className="sr-only">Play {video.title}</span>
          </button>
        )}
      </div>
    </div>
  );
}
