import type { ElementType, ReactNode } from 'react';

export interface PanelProps {
  children: ReactNode;
  /** Adds the 4px brand top edge used on standalone panels. */
  accentTop?: boolean;
  as?: ElementType;
}

export function Panel({ children, accentTop = false, as: Tag = 'section' }: PanelProps) {
  return <Tag className={`panel${accentTop ? ' panel-accent' : ''}`}>{children}</Tag>;
}

export interface PanelHeaderProps {
  title: ReactNode;
  trailing?: ReactNode;
}

export function PanelHeader({ title, trailing }: PanelHeaderProps) {
  return (
    <div className="panel-header">
      <span className="panel-title">{title}</span>
      {trailing}
    </div>
  );
}

export interface PaperProps {
  children: ReactNode;
  /** Grid paper over navy, for dark chrome panels. */
  dark?: boolean;
  className?: string;
}

/**
 * The graph-paper ground.
 *
 * Inside the app shell there is already exactly one paper layer, on
 * `.app-content` — don't add another, because two layers paint their grids from
 * different origins and the lines won't line up. This is for surfaces outside
 * the shell (the login screen) and for the dark variant on navy chrome.
 */
export function Paper({ children, dark = false, className = '' }: PaperProps) {
  return <div className={`${dark ? 'paper-dark' : 'paper'} ${className}`.trim()}>{children}</div>;
}

export interface GridLinesProps {
  children: ReactNode;
  /** Extra class for the column-count rule, e.g. "tool-grid". */
  className?: string;
}

/**
 * Grid whose cell separators are drawn as a 1px gap over a divider-colored
 * ground. Per-cell borders leave a stray trailing line when the column count
 * changes, and this layout reflows at three breakpoints.
 */
export function GridLines({ children, className = '' }: GridLinesProps) {
  return <div className={`gridlines ${className}`.trim()}>{children}</div>;
}

export function Rule() {
  return <hr className="hr" />;
}

export type TagTone = 'accent' | 'neutral' | 'outline' | 'on-dark';

const TAG_CLASS: Record<TagTone, string> = {
  accent: 'tag-accent',
  neutral: 'tag-neutral',
  outline: 'tag-outline',
  'on-dark': 'tag-on-dark',
};

export function Tag({ tone = 'accent', children }: { tone?: TagTone; children: ReactNode }) {
  return <span className={`tag ${TAG_CLASS[tone]}`}>{children}</span>;
}

export interface SectionHeadingProps {
  title: string;
  meta?: string;
  trailing?: ReactNode;
}

/** h6 + count over a 2px rule — the pattern above each tool group. */
export function SectionHeading({ title, meta, trailing }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <h6>{title}</h6>
      {meta ? <span className="text-muted section-heading-meta">{meta}</span> : null}
      {trailing ? <span className="section-heading-trailing">{trailing}</span> : null}
    </div>
  );
}

export interface StackProps {
  children: ReactNode;
  gap?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  className?: string;
}

/** Vertical flow with a token gap. Saves an inline style on every page. */
export function Stack({ children, gap = 5, className = '' }: StackProps) {
  return (
    <div className={`stack stack-${gap} ${className}`.trim()}>{children}</div>
  );
}
