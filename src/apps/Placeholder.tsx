import type { AppProps } from "./registry";

/** Stand-in for apps that haven't been built yet. */
export function placeholder(name: string) {
  function Placeholder(_props: AppProps) {
    return (
      <div className="app-placeholder">
        <h2>{name} is still compiling</h2>
        <p>This app gets built in a later step. Check back soon.</p>
      </div>
    );
  }
  return Placeholder;
}
