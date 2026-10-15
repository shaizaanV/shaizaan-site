import { tracks } from "../content/tracks";
import { songs } from "../os/songs";
import { useSound } from "../os/sound";
import type { AppProps } from "./registry";
import "./jukebox.css";

const BARS = 12;

export function Jukebox(_props: AppProps) {
  const sound = useSound();
  const playing = songs.find((s) => s.id === sound.song);

  return (
    <div className="jukebox">
      <section className="radio" aria-labelledby="radio-title">
        <h2 id="radio-title">Shaizintosh Radio</h2>
        <p className="muted">Original chiptunes, made for this OS.</p>

        <div className={`radio__lcd${playing ? " is-playing" : ""}`}>
          <p className="radio__now" role="status">
            {playing ? `▶ ${playing.title} · ${playing.bpm} BPM` : "■ Stopped"}
          </p>
          <div className="radio__viz" aria-hidden="true">
            {Array.from({ length: BARS }, (_, i) => (
              <i key={i} style={{ animationDelay: `${(i * 137) % 600}ms` }} />
            ))}
          </div>
        </div>

        <ul className="radio__songs">
          {songs.map((song) => {
            const isPlaying = sound.song === song.id;
            return (
              <li key={song.id}>
                <button
                  type="button"
                  className="bevel radio__song"
                  aria-pressed={isPlaying}
                  onClick={() => (isPlaying ? sound.stopSong() : sound.playSong(song.id))}
                >
                  <span className="radio__icon" aria-hidden="true">
                    {isPlaying ? "■" : "▶"}
                  </span>
                  <span>
                    <span className="radio__title">{song.title}</span>
                    <span className="radio__vibe">{song.vibe}</span>
                  </span>
                  <span className="sr-only">{isPlaying ? "Stop" : "Play"}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {!sound.on && <p className="radio__hint muted">Sound is off. Pressing play turns it on.</p>}
      </section>

      <section className="onrepeat" aria-labelledby="onrepeat-title">
        <h3 id="onrepeat-title">On repeat</h3>
        <p className="muted">Songs I keep coming back to.</p>
        <ol className="onrepeat__list">
          {tracks.map((t) => (
            <li key={t.title}>
              <span className="onrepeat__title">
                {t.title}
                {t.artist && <span className="muted"> · {t.artist}</span>}
              </span>
              {t.spotify && (
                <a className="bevel onrepeat__link" href={t.spotify} target="_blank" rel="noopener noreferrer">
                  Spotify ↗<span className="sr-only"> (opens {t.title} in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
