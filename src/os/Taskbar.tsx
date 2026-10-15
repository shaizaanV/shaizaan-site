import { apps, appsById } from "../apps/registry";
import { OS_NAME } from "./brand";
import { useClock } from "./hooks";
import { Menu } from "./Menu";
import { PixelIcon } from "./PixelIcon";
import { useSound } from "./sound";
import { useWindows } from "./windowStore";

export function Taskbar() {
  const wm = useWindows();
  const sound = useSound();
  const time = useClock();

  return (
    <nav className="taskbar" aria-label="Taskbar">
      <Menu
        buttonClassName="bevel taskbar__start"
        placement="up"
        items={apps.map((app) => ({ label: app.label, onSelect: () => wm.open(app.id) }))}
      >
        <PixelIcon name="logo" size={18} />
        <span className="taskbar__start-label">{OS_NAME}</span>
      </Menu>

      <ul className="taskbar__tasks" aria-label="Open windows">
        {wm.windows.map((win) => {
          const front = wm.focused?.id === win.id;
          const app = appsById[win.id];
          return (
            <li key={win.id}>
              <button
                type="button"
                className="bevel task"
                aria-pressed={front}
                onClick={() => (front ? wm.minimize(win.id) : wm.open(win.id))}
              >
                <PixelIcon name={app.icon} size={14} />
                <span>{app.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="taskbar__tray bevel-in">
        <button
          type="button"
          className="bevel snd"
          aria-pressed={sound.on}
          aria-label="Sound"
          title={sound.on ? "Sound is on" : "Sound is off"}
          onClick={sound.toggle}
        >
          {sound.on ? "SND ON" : "SND OFF"}
        </button>
        <span className="taskbar__clock">{time}</span>
      </div>
    </nav>
  );
}
