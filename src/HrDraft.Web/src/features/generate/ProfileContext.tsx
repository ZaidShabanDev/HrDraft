import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Rule } from '../../components';
import { revealHeight } from '../../lib/motion';
import type { ProfileContribution } from '../../types/domain';

/**
 * "What the company profile contributed" in its three forms. The design shows
 * the same information three ways rather than hiding it below 1280px — it is on
 * the always-shown list, because it is why the output sounds like the company.
 */

export interface ProfileRailProps {
  contributions: ProfileContribution[];
  recentRuns: { generationId: number; label: string }[];
}

/** Desktop: a 360px side rail. */
export function ProfileRail({ contributions, recentRuns }: ProfileRailProps) {
  return (
    <aside className="profile-rail" aria-label="Company profile context">
      <h6>Pulled from company profile</h6>
      <div className="profile-rail-list">
        {contributions.map((c) => (
          <div key={c.key} className="profile-rail-row">
            <span className={c.inUse ? '' : 'text-muted'}>{c.label}</span>
            {c.inUse ? (
              <span className="profile-in-use">✓ in use</span>
            ) : (
              <Link className="text-muted profile-edit-link" to="/profile">
                edit →
              </Link>
            )}
          </div>
        ))}
      </div>

      <Rule />

      <h6>Reuse a past run</h6>
      <div className="profile-rail-runs">
        {recentRuns.map((run) => (
          <button type="button" key={run.generationId} className="profile-run">
            {run.label}
          </button>
        ))}
        <Link to="/history" className="profile-history-link">
          All history →
        </Link>
      </div>
    </aside>
  );
}

/** Tablet: one horizontal strip above the form. */
export function ProfileStrip({ contributions }: { contributions: ProfileContribution[] }) {
  return (
    <div className="profile-strip">
      <h6>From company profile</h6>
      {contributions
        .filter((c) => c.inUse)
        .map((c) => (
          <span key={c.key} className="profile-in-use">
            ✓ {c.label}
          </span>
        ))}
      <Link to="/profile" className="profile-strip-link">
        Edit profile →
      </Link>
    </div>
  );
}

/** Phone: a collapsed summary that expands in place. */
export function ProfileSummaryBlock({ contributions }: { contributions: ProfileContribution[] }) {
  const [open, setOpen] = useState(false);
  const inUse = contributions.filter((c) => c.inUse);

  return (
    <div className="profile-block">
      <button
        type="button"
        className="profile-block-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <h6>From company profile</h6>
        <span className="text-muted profile-block-count">
          {inUse.length} items{' '}
          <span className="profile-block-caret" aria-hidden="true">
            ▾
          </span>
        </span>
      </button>

      {/* height: auto is the reason this is Motion and not CSS — a stylesheet
          can't interpolate to it. mode="wait" so the two states swap cleanly
          instead of both claiming height at once. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={open ? 'list' : 'summary'}
          className="profile-block-reveal"
          variants={revealHeight}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {open ? (
            <div className="profile-block-list">
              {contributions.map((c) => (
                <span key={c.key} className={c.inUse ? 'profile-in-use' : 'text-muted'}>
                  {c.inUse ? `✓ ${c.label}` : c.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted profile-block-summary">
              {inUse.map((c) => c.label).join(', ')} — included automatically.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
