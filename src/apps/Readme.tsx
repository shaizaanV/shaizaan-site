import type { AppProps } from "./registry";

export function Readme({ open }: AppProps) {
  return (
    <div className="app-readme">
      <h2>Hi, I'm Shaizaan Valiyani.</h2>
      <p>Student, developer and aspiring engineer. I build software and engineering projects, then film the process on YouTube.</p>
      <p className="muted">Open any icon on the desktop, or start here:</p>
      <div className="btn-row">
        <button type="button" className="bevel primary" onClick={() => open("projects")}>
          Projects
        </button>
        <button type="button" className="bevel" onClick={() => open("tv")}>
          YouTube
        </button>
        <button type="button" className="bevel" onClick={() => open("mail")}>
          Contact
        </button>
      </div>
    </div>
  );
}
