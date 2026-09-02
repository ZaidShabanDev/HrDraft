import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Banner,
  BrandLogo,
  Button,
  Dialog,
  DockedActionBar,
  IconButton,
  Menu,
  Rule,
  Stack,
  Tag,
  useToast,
} from '../../components';
import type { MenuAction } from '../../components';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { mockDraft } from '../../mocks/mockData';
import { getTool } from '../tools/toolRegistry';
import './generate.css';

type DraftTab = 'edit' | 'preview' | 'versions';

export function DraftResultPage() {
  const { toolKey } = useParams<{ toolKey: string }>();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const toast = useToast();

  const tool = getTool(toolKey);
  const draft = mockDraft;

  const [tab, setTab] = useState<DraftTab>('preview');
  const [markdown, setMarkdown] = useState(draft.outputMarkdown ?? '');
  const [reviewed, setReviewed] = useState(draft.isReviewed);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isPhone = breakpoint === 'phone';
  const isDesktop = breakpoint === 'desktop';

  const menuActions: MenuAction[] = [
    { id: 'duplicate', label: 'Duplicate & riff', onSelect: () => navigate(`/tools/${toolKey}`) },
    {
      id: 'rename',
      label: 'Rename',
      onSelect: () => toast.show({ message: 'Rename lands with the API.', tone: 'success' }),
    },
    {
      id: 'export',
      label: 'Export .docx',
      onSelect: () => toast.show({ message: 'Export lands with the API.', tone: 'success' }),
    },
    {
      id: 'delete',
      label: 'Delete draft',
      destructive: true,
      onSelect: () => setConfirmDelete(true),
    },
  ];

  const copy = () => {
    void navigator.clipboard.writeText(markdown);
    toast.show({ message: 'Copied to clipboard.', tone: 'success' });
  };

  const save = () => {
    toast.show({
      message: 'Saved to history.',
      tone: 'success',
      actionLabel: 'Undo',
      onAction: () => toast.show({ message: 'Save undone.', tone: 'success' }),
    });
  };

  return (
    <>
      <div className="generate-header chrome-pad">
        <div className="breadcrumb">
          {isPhone ? (
            <>
              <button
                type="button"
                className="generate-back"
                aria-label="Back"
                onClick={() => navigate(`/tools/${toolKey}`)}
              >
                <span aria-hidden="true">←</span>
              </button>
              <span className="breadcrumb-current">Draft ready</span>
            </>
          ) : (
            <>
              <BrandLogo surface="light" size="sm" />
              <Link className="text-muted breadcrumb-link" to="/">
                Tools
              </Link>
              <span className="text-muted" aria-hidden="true">
                /
              </span>
              <span className="breadcrumb-current">{tool?.title ?? 'Draft'}</span>
              <Tag tone="accent">Draft ready</Tag>
            </>
          )}
        </div>

        {isPhone ? (
          <div className="draft-menu-anchor">
            <IconButton
              label="Draft actions"
              variant="ghost"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span aria-hidden="true">⋯</span>
            </IconButton>
            <Menu
              open={menuOpen}
              label="Draft actions"
              actions={menuActions}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        ) : (
          <div className="draft-actions">
            <Button variant="secondary" onClick={copy}>
              Copy
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.show({ message: 'Export lands with the API.', tone: 'success' })}
            >
              Download .docx
            </Button>
            <Button variant="primary" onClick={save}>
              Save to history
            </Button>
            <div className="draft-menu-anchor">
              <IconButton
                label="More draft actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <span aria-hidden="true">⋯</span>
              </IconButton>
              <Menu
                open={menuOpen}
                label="Draft actions"
                actions={menuActions}
                onClose={() => setMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="layout-rail layout-rail-draft">
        <div className="layout-main">
          <div className="tabs draft-toolbar" role="tablist" aria-label="Draft view">
            <button
              type="button"
              role="tab"
              className="tab"
              aria-selected={tab === 'edit'}
              onClick={() => setTab('edit')}
            >
              Edit
            </button>
            <button
              type="button"
              role="tab"
              className="tab"
              aria-selected={tab === 'preview'}
              onClick={() => setTab('preview')}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              className="tab"
              aria-selected={tab === 'versions'}
              onClick={() => setTab('versions')}
            >
              Versions
            </button>
            {isDesktop ? (
              <span className="text-muted draft-toolbar-note">
                Editable — changes are yours to keep
              </span>
            ) : null}
          </div>

          <div className="draft-body">
            <Stack gap={4}>
              {/* On phone the review flag moves above the content — a banner below
                  the fold is a banner nobody reads. */}
              {!isDesktop && tool?.requiresHumanReview && !reviewed ? (
                <Banner kicker="Human check needed">
                  Comp and EEO wording vary by jurisdiction. Sign off before sending.
                </Banner>
              ) : null}

              {tab === 'edit' ? (
                <>
                  <label className="visually-hidden" htmlFor="draft-editor">
                    Draft markdown
                  </label>
                  <textarea
                    id="draft-editor"
                    className="draft-editor"
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                  />
                </>
              ) : tab === 'preview' ? (
                <div className="draft-markdown">
                  <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
                </div>
              ) : (
                <div className="draft-versions">
                  {draft.revisions.map((rev) => (
                    <div key={rev.generationRevisionId} className="draft-version-row">
                      <span>
                        Version {rev.versionNumber}
                        {rev.isModelOutput ? ' — generated' : ' — edited'}
                      </span>
                      <span className="text-muted">
                        {new Date(rev.createdUtc).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <p className="text-muted draft-rail-meta">
                    Every save keeps the previous text. The generated version is never
                    overwritten.
                  </p>
                </div>
              )}
            </Stack>
          </div>
        </div>

        {isDesktop ? (
          <aside className="draft-rail" aria-label="Draft actions and context">
            {tool?.requiresHumanReview ? (
              <Banner
                kicker={reviewed ? 'Reviewed' : 'Human check needed'}
                action={
                  reviewed ? null : (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setReviewed(true);
                        toast.show({ message: 'Marked as reviewed.', tone: 'success' });
                      }}
                    >
                      Mark reviewed
                    </Button>
                  )
                }
              >
                {reviewed
                  ? 'Signed off. This draft is cleared for external use.'
                  : 'Compensation and EEO wording vary by jurisdiction. Someone signs off before this goes external.'}
              </Banner>
            ) : null}

            {tool?.nextSteps?.length ? (
              <div>
                <h6>Next step</h6>
                <div className="draft-next-steps">
                  {tool.nextSteps.map((step) => (
                    <Button
                      key={step.toolKey}
                      variant="secondary"
                      block
                      onClick={() => navigate(`/tools/${step.toolKey}`)}
                    >
                      {step.label}
                    </Button>
                  ))}
                  <Button variant="ghost" onClick={() => navigate(`/tools/${toolKey}`)}>
                    Regenerate with changes
                  </Button>
                </div>
              </div>
            ) : null}

            <Rule />
            <p className="text-muted draft-rail-meta">
              Run {new Date(draft.createdUtc).toLocaleTimeString()} · saved to audit log · draft{' '}
              {draft.revisions.length} of {draft.revisions.length}
            </p>
          </aside>
        ) : null}
      </div>

      {isPhone ? (
        <DockedActionBar even>
          <Button variant="secondary" onClick={copy}>
            Copy
          </Button>
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </DockedActionBar>
      ) : null}

      <Dialog
        open={confirmDelete}
        kicker="Destructive"
        title="Delete this draft?"
        destructive
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Keep
            </Button>
            <Button
              variant="destructive-solid"
              onClick={() => {
                setConfirmDelete(false);
                toast.show({ message: 'Draft deleted.', tone: 'success' });
                navigate('/history');
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        The audit log keeps the record of who generated it, but the text is gone.
      </Dialog>
    </>
  );
}
