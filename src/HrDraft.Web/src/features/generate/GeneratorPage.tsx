import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BrandLogo,
  Button,
  DockedActionBar,
  ProgressBar,
  Rule,
  Skeleton,
  Stack,
  Tag,
  useToast,
} from '../../components';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { mockProfileContributions, mockRecentRuns } from '../../mocks/mockData';
import { getTool } from '../tools/toolRegistry';
import type { ToolFormValues } from '../tools/toolTypes';
import { ProfileRail, ProfileStrip, ProfileSummaryBlock } from './ProfileContext';
import './generate.css';

export function GeneratorPage() {
  const { toolKey } = useParams<{ toolKey: string }>();
  // Keyed so switching tools remounts with that tool's defaults — the route is
  // the same, so without this the previous tool's values would carry over.
  return <GeneratorForm key={toolKey} toolKey={toolKey} />;
}

function GeneratorForm({ toolKey }: { toolKey: string | undefined }) {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const toast = useToast();

  const tool = getTool(toolKey);
  const [values, setValues] = useState<ToolFormValues>(tool?.defaultValues ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  if (!tool) {
    return (
      <div className="page-pad">
        <h2>Tool not found</h2>
        <p className="text-muted">
          No tool matches “{toolKey}”. <Link to="/">Back to tools</Link>.
        </p>
      </div>
    );
  }

  const { FormComponent } = tool;
  const isPhone = breakpoint === 'phone';
  const isDesktop = breakpoint === 'desktop';

  const generate = () => {
    const found = tool.validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setGenerating(true);
    // Phase 2 replaces this with the streamed SSE call. The delay stands in for
    // it so the skeleton and progress states are reviewable now.
    window.setTimeout(() => {
      setGenerating(false);
      navigate(`/tools/${tool.toolKey}/result/41`);
    }, 1600);
  };

  const actions = (
    <>
      {/* On phone the docked bar stretches the first button — see .docked-bar. */}
      <Button variant="primary" onClick={generate} loading={generating} loadingLabel="Generating…">
        Generate draft
      </Button>
      <Button
        variant="secondary"
        disabled={generating}
        onClick={() => toast.show({ message: 'Inputs saved.', tone: 'success' })}
      >
        {isPhone ? 'Save' : 'Save inputs'}
      </Button>
      {!isPhone ? (
        <span className="text-muted generate-eta">~{tool.estimatedSeconds} seconds</span>
      ) : null}
    </>
  );

  return (
    <>
      <div className="generate-header chrome-pad">
        <div className="breadcrumb">
          {!isPhone ? (
            <>
              <BrandLogo surface="light" size="sm" />
              <Link className="text-muted breadcrumb-link" to="/">
                Tools
              </Link>
              <span className="text-muted" aria-hidden="true">
                /
              </span>
            </>
          ) : (
            <button
              type="button"
              className="generate-back"
              aria-label="Back to tools"
              onClick={() => navigate('/')}
            >
              <span aria-hidden="true">←</span>
            </button>
          )}
          <span className="breadcrumb-current">
            {isPhone ? tool.title : `${tool.title} generator`}
          </span>
        </div>
        <Tag tone={isPhone ? 'on-dark' : 'outline'}>
          {isPhone ? '1 of 2' : 'Step 1 of 2 — inputs'}
        </Tag>
      </div>

      <div className="layout-rail layout-rail-form">
        <div className="layout-main page-pad">
          <Stack gap={5}>
            {/* Tablet keeps the profile context inline above the form; the design
                drops the rail entirely at that width. */}
            {breakpoint === 'tablet' ? (
              <ProfileStrip contributions={mockProfileContributions} />
            ) : null}

            <FormComponent
              value={values}
              onChange={setValues}
              errors={errors}
              disabled={generating}
            />

            {isPhone ? <ProfileSummaryBlock contributions={mockProfileContributions} /> : null}

            {generating ? (
              <Stack gap={3}>
                <ProgressBar
                  label="Generating draft"
                  caption={`Drafting sections… about ${tool.estimatedSeconds} seconds`}
                />
                <Skeleton blocks={2} />
              </Stack>
            ) : null}

            {/* Sits at the bottom of the column — see .generate-footer. On phone
                the same actions live in the docked bar instead. */}
            {!isPhone ? (
              <div className="generate-footer">
                <Rule />
                <div className="generate-actions">{actions}</div>
              </div>
            ) : null}
          </Stack>
        </div>

        {isDesktop ? (
          <ProfileRail contributions={mockProfileContributions} recentRuns={mockRecentRuns} />
        ) : null}
      </div>

      {isPhone ? <DockedActionBar>{actions}</DockedActionBar> : null}
    </>
  );
}
