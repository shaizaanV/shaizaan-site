import { OS_NAME } from "../os/brand";
import { PixelIcon } from "../os/PixelIcon";
import "./compiling.css";
import type { AppProps } from "./registry";

/** Sad Floppy: shown when a share link points at something that doesn't exist. */
export function NotFound({ params, open, close }: AppProps) {
  return (
    <div className="compiling">
      <PixelIcon name="floppy" size={88} />
      <h2>File not found</h2>
      <p>
        {OS_NAME} couldn't find <code>#{params || "?"}</code>.
      </p>
      <p className="muted">It may have been moved, renamed, or eaten by the desk chicken.</p>
      <div className="btn-row" style={{ justifyContent: "center" }}>
        <button type="button" className="bevel primary" onClick={() => open("projects")}>
          See projects
        </button>
        <button type="button" className="bevel" onClick={close}>
          Close
        </button>
      </div>
    </div>
  );
}
