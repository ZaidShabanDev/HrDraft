import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GridLines, SectionHeading, SegmentedControl, Stack } from '../../components';
import { useCurrentUser } from '../auth/AuthProvider';
import { useIsPhone } from '../../hooks/useBreakpoint';
import type { ToolCategory } from '../../types/domain';
import { TOOL_CATEGORIES, toolsByCategory } from './toolRegistry';
import type { ToolDefinition } from './toolTypes';
import './tools.css';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function ToolsHomePage() {
  const isPhone = useIsPhone();
  const [category, setCategory] = useState<ToolCategory>('Recruiting');
  const firstName = useCurrentUser().displayName.split(' ')[0] ?? '';

  return (
    <div className="page-pad">
      <Stack gap={7}>
        <div className="tools-intro">
          <div className="tools-intro-copy">
            <h6 className="kicker-accent">
              {greeting()}, {firstName}
            </h6>
            <h2 className="tools-heading">Pick a document to draft.</h2>
            {!isPhone ? (
              <p className="text-muted tools-lede">
                Fill a short form, press generate, edit the draft. Everything pulls your benefits,
                DEI statement and comp bands from the company profile.
              </p>
            ) : null}
          </div>
          {!isPhone ? (
            <Link className="btn btn-secondary tools-profile-link" to="/profile">
              Company profile →
            </Link>
          ) : null}
        </div>

        {/* Phone shows one category at a time — two stacked 7-row lists would be
            a long scroll with no overview. */}
        {isPhone ? (
          <>
            <SegmentedControl
              label="Tool category"
              options={TOOL_CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={category}
              fullWidth
              onChange={(v) => setCategory(v as ToolCategory)}
            />
            <ToolList tools={toolsByCategory(category)} />
          </>
        ) : (
          TOOL_CATEGORIES.map((cat) => {
            const tools = toolsByCategory(cat);
            return (
              <Stack gap={3} key={cat}>
                <SectionHeading title={cat} meta={`${tools.length} tools`} />
                <GridLines className="tool-grid">
                  {tools.map((tool) => (
                    <ToolCard key={tool.toolKey} tool={tool} />
                  ))}
                  {cat === 'Onboarding' ? <MoreDomainsCard /> : null}
                </GridLines>
              </Stack>
            );
          })
        )}
      </Stack>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolDefinition }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="tool-card"
      onClick={() => navigate(`/tools/${tool.toolKey}`)}
    >
      <span className="text-muted tool-card-number">{tool.displayNumber}</span>
      <h4 className="tool-card-title">{tool.title}</h4>
      <p className="text-muted tool-card-blurb">{tool.blurb}</p>
      <span className="tool-card-open">
        Open{' '}
        <span aria-hidden="true">→</span>
      </span>
    </button>
  );
}

/** Placeholder cell from the design — signals the roadmap without promising a date. */
function MoreDomainsCard() {
  return (
    <div className="tool-card tool-card-later">
      <span className="text-muted tool-card-number">LATER</span>
      <h4 className="tool-card-title text-muted">More domains</h4>
      <p className="text-muted tool-card-blurb">
        Performance, comp, compliance — added one at a time after v1.
      </p>
    </div>
  );
}

function ToolList({ tools }: { tools: ToolDefinition[] }) {
  const navigate = useNavigate();
  return (
    <div className="tool-list">
      {tools.map((tool) => (
        <button
          key={tool.toolKey}
          type="button"
          className="tool-list-row"
          onClick={() => navigate(`/tools/${tool.toolKey}`)}
        >
          <span className="text-muted tool-list-number">{tool.displayNumber}</span>
          <span className="tool-list-main">
            <span className="tool-list-title">{tool.title}</span>
            <span className="text-muted tool-list-blurb">{tool.shortBlurb}</span>
          </span>
          <span className="tool-list-chevron" aria-hidden="true">
            →
          </span>
        </button>
      ))}
    </div>
  );
}
