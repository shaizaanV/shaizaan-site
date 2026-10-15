import { SocialLinks } from "../apps/SocialLinks";

/** Desktop widget with every social link; sits under the windows, bottom-right. */
export function SocialsIsland() {
  return (
    <aside className="island" aria-labelledby="island-title">
      <h2 className="island__bar" id="island-title">
        Socials
      </h2>
      <div className="island__body">
        <SocialLinks />
      </div>
    </aside>
  );
}
