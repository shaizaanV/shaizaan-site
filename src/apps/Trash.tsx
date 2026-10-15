import { useState } from "react";
import type { IconName } from "../os/icons";
import { PixelIcon } from "../os/PixelIcon";
import type { AppProps } from "./registry";
import "./trash.css";

interface TrashFile {
  name: string;
  size: string;
  icon: IconName;
  /** Shown in the status bar when opened (unless it opens an app). */
  note?: string;
}

const FILES: TrashFile[] = [
  { name: "old_site.zip", size: "1.2 MB", icon: "zip" },
  { name: "bugs.txt", size: "0 KB", icon: "doc", note: "bugs.txt is empty. As it should be." },
  { name: "sleep_schedule.dat", size: "??", icon: "doc", note: "sleep_schedule.dat is corrupted beyond repair." },
  { name: "homework_final_FINAL_v3.docx", size: "48 KB", icon: "doc", note: "Already submitted. Probably." },
];

export function Trash({ open }: AppProps) {
  const [status, setStatus] = useState(`${FILES.length} items`);

  const openFile = (file: TrashFile) => {
    if (file.name === "old_site.zip") {
      setStatus("Extracting old_site.zip…");
      open("oldsite");
    } else if (file.note) {
      setStatus(file.note);
    }
  };

  return (
    <div className="trash">
      <ul className="trash__files">
        {FILES.map((file) => (
          <li key={file.name}>
            <button type="button" className="trash__file" onClick={() => openFile(file)}>
              <PixelIcon name={file.icon} size={32} />
              <span className="trash__name">{file.name}</span>
              <span className="trash__size">{file.size}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="trash__bar">
        <p className="trash__status" role="status">
          {status}
        </p>
        <button type="button" className="bevel" onClick={() => setStatus("Some things are worth keeping.")}>
          Empty Trash
        </button>
      </div>
    </div>
  );
}
