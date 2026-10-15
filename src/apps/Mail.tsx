import { useEffect, useRef, useState } from "react";
import { email } from "../content/socials";
import type { AppProps } from "./registry";
import { SocialLinks } from "./SocialLinks";
import "./mail.css";

const QUICK_SUBJECTS = ["Collab idea", "Opportunity", "Question about a video", "Just saying hi"];

/** A retro compose window. Nothing is sent from the site: it hands off to the visitor's mail app. */
export function Mail(_props: AppProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const addressRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (message: string) => {
    setStatus(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus(""), 2500);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      flash("Copied!");
    } catch {
      // Clipboard blocked: select the address so Ctrl+C works.
      const range = document.createRange();
      if (addressRef.current) range.selectNodeContents(addressRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      flash("Selected. Press Ctrl+C to copy.");
    }
  };

  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  // URLSearchParams encodes spaces as "+", which mail apps show literally.
  const query = params.toString().replace(/\+/g, "%20");
  const mailto = `mailto:${email}${query ? `?${query}` : ""}`;

  return (
    <div className="mail">
      <div className="mail__field">
        <span className="mail__key">To</span>
        <span className="mail__address" ref={addressRef}>
          {email}
        </span>
        <button type="button" className="bevel mail__copy" onClick={copy}>
          Copy
        </button>
      </div>
      <p className="mail__status" role="status">
        {status}
      </p>

      <div className="mail__field mail__field--stack">
        <label className="mail__key" htmlFor="mail-subject">
          Subject
        </label>
        <input
          id="mail-subject"
          className="mail__input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What's up?"
        />
        <div className="mail__quick" role="group" aria-label="Quick subjects">
          {QUICK_SUBJECTS.map((q) => (
            <button key={q} type="button" className="bevel" aria-pressed={subject === q} onClick={() => setSubject(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mail__field mail__field--stack">
        <label className="mail__key" htmlFor="mail-body">
          Message
        </label>
        <textarea
          id="mail-body"
          className="mail__input"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Hey Shaizaan, …"
        />
      </div>

      <div className="btn-row">
        <a className="bevel primary" href={mailto}>
          Open in my mail app
        </a>
      </div>
      <p className="mail__note muted">This opens your own email app with everything filled in. Nothing is sent from this site.</p>

      <section className="mail__socials" aria-labelledby="mail-socials">
        <h3 id="mail-socials">Rather DM?</h3>
        <SocialLinks />
      </section>
    </div>
  );
}
