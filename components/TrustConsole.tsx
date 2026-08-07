"use client";
import { useState } from "react";
const rows = [
  ["Anonymous visitor", "Adult public page", "View only", "Allowed"],
  ["Anonymous visitor", "Under-18 page", "No access", "Blocked"],
  ["Adult member", "Under-18 member", "Discover / request", "Separated"],
  ["Accepted friends", "Either page", "Message", "Allowed"],
  ["Any non-friend", "Any member", "Private message", "Blocked"],
  ["Search engine", "Adult opt-in page", "Index", "Allowed"],
  ["Search engine", "Minor or opt-out page", "Index", "Blocked"],
];
export function TrustConsole() {
  const [age, setAge] = useState<"adult" | "minor">("minor"),
    [visibility, setVisibility] = useState<"private" | "friends" | "public">(
      "private",
    ),
    [blocked, setBlocked] = useState(false);
  const effective =
    age === "minor" && visibility === "public" ? "private" : visibility;
  return (
    <div className="trust-console">
      <div className="trust-simulator">
        <p className="eyebrow">TEST THE DEFAULTS</p>
        <h2>Trust is a state you can inspect.</h2>
        <div className="trust-controls">
          <label>
            Account age group
            <select
              value={age}
              onChange={(e) => {
                const value = e.target.value as typeof age;
                setAge(value);
                if (value === "minor") setVisibility("private");
              }}
            >
              <option value="minor">Under 18</option>
              <option value="adult">Adult</option>
            </select>
          </label>
          <label>
            Page audience
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as typeof visibility)
              }
            >
              <option value="private">Only me</option>
              <option value="friends">Friends only</option>
              <option value="public" disabled={age === "minor"}>
                Everyone
              </option>
            </select>
          </label>
          <label className="trust-check">
            <input
              type="checkbox"
              checked={blocked}
              onChange={(e) => setBlocked(e.target.checked)}
            />{" "}
            Viewer is blocked
          </label>
        </div>
        <div
          className={`trust-result ${blocked ? "deny" : "allow"}`}
          aria-live="polite"
        >
          <b>
            {blocked
              ? "ACCESS DENIED"
              : effective === "public"
                ? "PUBLIC WITH OPT-IN CONTROLS"
                : effective === "friends"
                  ? "ACCEPTED FRIENDS ONLY"
                  : "OWNER ONLY"}
          </b>
          <p>
            {blocked
              ? "The viewer cannot see or interact with this page. Blocking stays private."
              : age === "minor"
                ? "Minor protections remain enforced at the database boundary; public visibility and adult discovery are unavailable."
                : "Adult members choose page visibility, discovery, indexing, and guestbook access separately."}
          </p>
        </div>
      </div>
      <div className="trust-matrix">
        <p className="eyebrow">ENFORCEMENT MATRIX</p>
        {rows.map(([viewer, target, action, result]) => (
          <div key={viewer + target + action}>
            <span>{viewer}</span>
            <span>{target}</span>
            <span>{action}</span>
            <b
              className={
                result === "Blocked" || result === "Separated"
                  ? "deny-text"
                  : ""
              }
            >
              {result}
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}
