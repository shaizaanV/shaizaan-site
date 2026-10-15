import type { ReactNode } from "react";
import type { IconName } from "../os/icons";
import { PixelIcon } from "../os/PixelIcon";
import "./compiling.css";

interface CompilingProps {
  icon: IconName;
  title: string;
  children: ReactNode;
  /** Buttons/links shown under the text. */
  actions?: ReactNode;
}

/** "Still compiling" empty state for apps whose content hasn't been added yet. */
export function Compiling({ icon, title, children, actions }: CompilingProps) {
  return (
    <div className="compiling">
      <PixelIcon name={icon} size={64} />
      <h2>{title}</h2>
      <div className="compiling__bar" aria-hidden="true">
        <i />
      </div>
      {children}
      {actions && <div className="btn-row compiling__actions">{actions}</div>}
    </div>
  );
}
