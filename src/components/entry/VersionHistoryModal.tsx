import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Eye, History, RotateCcw, X } from 'lucide-react';
import type { EntryVersion, MediaEntry } from '../../types';
import { useData } from '../../lib/data-context';
import { cn, formatMediaType, formatWatchStatus } from '../../lib/utils';
import { ConfirmModal } from '../common/ConfirmModal';

type Snapshot = Record<string, any>;
type VersionChange = { field: string; oldValue: unknown; newValue: unknown };

const REVISION_WINDOW_MS = 3 * 1000;
const HISTORY_FIELDS = ['title', 'status', 'rating', 'type', 'platform', 'summary', 'review', 'notes', 'journal'] as const;

function stripHtml(html: string) {
  if (!html) return '';
  const element = document.createElement('div');
  element.innerHTML = html.replace(/<\/p>|<\/div>|<\/h[1-6]>/gi, ' ').replace(/<br\s*\/?>/gi, ' ');
  return (element.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
}

function journalText(value: unknown) {
  if (!Array.isArray(value)) return '';
  return value.map(page => `${page.title || 'Untitled'}: ${stripHtml(page.content || '')}`).join(' | ');
}

function journalChangeSummary(currentValue: unknown, previousValue: unknown) {
  const current = Array.isArray(currentValue) ? currentValue : [];
  const previous = Array.isArray(previousValue) ? previousValue : [];
  const changes: string[] = [];
  const pageCount = Math.max(current.length, previous.length);

  for (let index = 0; index < pageCount; index += 1) {
    const currentPage = current[index];
    const previousPage = previous[index];
    const pageName = currentPage?.title?.trim() || previousPage?.title?.trim() || `Page ${index + 1}`;

    if (!previousPage && currentPage) changes.push(`${pageName} added`);
    else if (previousPage && !currentPage) changes.push(`${pageName} removed`);
    else if (JSON.stringify(currentPage) !== JSON.stringify(previousPage)) changes.push(`${pageName} edited`);
  }

  return changes.join(', ');
}

function changedJournalPages(currentValue: unknown, previousValue: unknown) {
  const current = Array.isArray(currentValue) ? currentValue : [];
  const previous = Array.isArray(previousValue) ? previousValue : [];
  if (previous.length === 0) return current;
  return current.filter((page, index) => JSON.stringify(page) !== JSON.stringify(previous[index]));
}

function getChanges(current: Snapshot, previous?: Snapshot): VersionChange[] {
  if (!previous) return [];
  const changes: VersionChange[] = [];
  for (const field of HISTORY_FIELDS) {
    const currentValue = field === 'journal' ? journalText(current[field]) :
      ['summary', 'review', 'notes'].includes(field) ? stripHtml(current[field] || '') : current[field];
    const previousValue = field === 'journal' ? journalText(previous[field]) :
      ['summary', 'review', 'notes'].includes(field) ? stripHtml(previous[field] || '') : previous[field];
    if (JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
      changes.push({
        field: field === 'journal' ? 'Journal / Review' : field.charAt(0).toUpperCase() + field.slice(1),
        oldValue: previousValue || 'Empty',
        newValue: currentValue || 'Empty',
      });
    }
  }
  return changes;
}

function conciseValue(field: string, value: unknown) {
  if (value === null || value === undefined || value === '' || value === 'Empty') return 'Empty';
  const formatted = field === 'Status' ? formatWatchStatus(String(value)) : field === 'Type' ? formatMediaType(String(value)) : String(value);
  return formatted.length > 28 ? `${formatted.slice(0, 28)}…` : formatted;
}

function snapshotSignature(data: Snapshot) {
  return JSON.stringify(HISTORY_FIELDS.map(field => data[field] ?? null));
}

function consolidateVersions(versions: EntryVersion[]) {
  const result: EntryVersion[] = [];
  for (const version of versions) {
    const latestVisible = result[result.length - 1];
    if (!latestVisible) {
      result.push(version);
      continue;
    }
    if (snapshotSignature(latestVisible.data) === snapshotSignature(version.data)) continue;
    const closelySpaced = Math.abs(new Date(latestVisible.timestamp).getTime() - new Date(version.timestamp).getTime()) < REVISION_WINDOW_MS;
    const routineAutosaves = latestVisible.revisionKind === 'autosave' && version.revisionKind === 'autosave';
    if (closelySpaced && routineAutosaves) continue;
    result.push(version);
  }
  return result.slice(0, 40);
}

function formatRevisionTime(timestamp: string) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
  if (sameDay(date, today)) return `Today, ${time}`;
  if (sameDay(date, yesterday)) return `Yesterday, ${time}`;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(date);
}

function revisionLabel(version: EntryVersion, isCurrent: boolean) {
  if (isCurrent) return 'Current version';
  if (version.revisionKind === 'restore') return 'Restored version';
  if (version.revisionKind === 'before_restore') return 'Before restore';
  if (version.revisionKind === 'initial') return 'Original version';
  return 'Saved revision';
}

export function VersionHistoryModal({ entry, isOpen, onClose, onRestoreStart, isDarkMode }: {
  entry: MediaEntry;
  isOpen: boolean;
  onClose: () => void;
  onRestoreStart?: () => void;
  isDarkMode: boolean;
}) {
  const { getVersions, restoreVersion } = useData();
  const [versions, setVersions] = useState<EntryVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<EntryVersion | null>(null);
  const [versionToView, setVersionToView] = useState<EntryVersion | null>(null);

  const loadVersions = useCallback(async () => {
    if (!entry.id) return;
    setLoading(true);
    setError('');
    try {
      setVersions(await getVersions(entry.id));
    } catch (loadError) {
      console.error(loadError);
      setError('Version history could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [entry.id, getVersions]);

  useEffect(() => { if (isOpen) void loadVersions(); }, [isOpen, loadVersions]);
  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const visibleVersions = useMemo(() => consolidateVersions(versions), [versions]);
  const previewPages = useMemo(() => {
    if (!versionToView) return [];
    const versionIndex = visibleVersions.findIndex(version => version.id === versionToView.id);
    const previousVersion = versionIndex >= 0 ? visibleVersions[versionIndex + 1] : undefined;
    return changedJournalPages(versionToView.data.journal, previousVersion?.data?.journal);
  }, [versionToView, visibleVersions]);
  if (!isOpen) return null;

  const handleRestore = async () => {
    if (!versionToRestore) return;
    setRestoring(true);
    setError('');
    try {
      onRestoreStart?.();
      await restoreVersion(versionToRestore.id);
      setVersionToRestore(null);
      setVersionToView(null);
      setFeedback('Version restored');
      await loadVersions();
    } catch (restoreError: any) {
      console.error(restoreError);
      setError(restoreError?.message?.includes('restore_media_version')
        ? 'Apply the new version-history database migration before restoring.'
        : 'This version could not be restored. Your current content was not changed.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="version-history-title" className={cn(
        'relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl',
        isDarkMode ? 'border-white/10 bg-[#15181E] text-white' : 'border-neutral-200 bg-white text-neutral-900'
      )}>
        <header className={cn('flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6', isDarkMode ? 'border-white/10' : 'border-neutral-200')}>
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/15 text-[#3B82F6]"><History className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0">
              <h2 id="version-history-title" className="text-lg font-bold sm:text-xl">Version History</h2>
              <p className={cn('truncate text-xs sm:text-sm', isDarkMode ? 'text-white/55' : 'text-neutral-500')}>Meaningful revisions of “{entry.title}”</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close version history" className="rounded-lg p-2 opacity-60 transition hover:bg-neutral-500/15 hover:opacity-100"><X className="h-5 w-5" aria-hidden="true" /></button>
        </header>

        {feedback && <div role="status" className="mx-5 mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-500 sm:mx-6"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {feedback}</div>}
        {error && <div role="alert" className="mx-5 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 sm:mx-6">{error}</div>}

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center" aria-label="Loading version history"><div className="h-7 w-7 animate-spin rounded-full border-2 border-[#3B82F6]/30 border-t-[#3B82F6]" /></div>
          ) : visibleVersions.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center text-center"><Clock3 className="mb-3 h-8 w-8 opacity-35" aria-hidden="true" /><p className="font-semibold">No saved revisions yet</p><p className="mt-1 max-w-sm text-sm opacity-55">Meaningful changes will appear here automatically as you work.</p></div>
          ) : (
            <ol className="relative space-y-1 before:absolute before:bottom-5 before:left-[7px] before:top-5 before:w-px before:bg-neutral-500/25">
              {visibleVersions.map((version, index) => {
                const isCurrent = index === 0;
                const previous = visibleVersions[index + 1];
                const changes = getChanges(version.data, previous?.data);
                const primaryChange = changes[0];
                const changeSummary = primaryChange
                  ? `${primaryChange.field}: ${conciseValue(primaryChange.field, primaryChange.oldValue)} → ${conciseValue(primaryChange.field, primaryChange.newValue)}`
                  : version.revisionKind === 'initial' ? 'Entry created' : 'Saved content';
                const changedPages = journalChangeSummary(version.data.journal, previous?.data?.journal);
                const visibleChangeSummary = changedPages || changeSummary;
                return (
                  <li key={version.id} className="relative grid grid-cols-[16px_minmax(0,1fr)] gap-4 py-2">
                    <span className={cn('relative z-10 mt-5 h-[15px] w-[15px] rounded-full border-2', isCurrent ? 'border-[#3B82F6] bg-[#3B82F6] shadow-[0_0_0_4px_rgba(59,130,246,0.15)]' : isDarkMode ? 'border-neutral-500 bg-[#15181E]' : 'border-neutral-400 bg-white')} />
                    <article className={cn('rounded-xl border px-4 py-3.5 transition-colors sm:px-5', isCurrent ? 'border-[#3B82F6]/50 bg-[#3B82F6]/8' : isDarkMode ? 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100')}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{revisionLabel(version, isCurrent)}</h3>{isCurrent && <span className="rounded-full bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">Active</span>}</div>
                          <time dateTime={version.timestamp} className={cn('mt-0.5 block text-xs', isDarkMode ? 'text-white/50' : 'text-neutral-500')}>{formatRevisionTime(version.timestamp)}</time>
                          <p className={cn('mt-2 line-clamp-2 text-xs leading-relaxed', isDarkMode ? 'text-white/65' : 'text-neutral-600')}>{visibleChangeSummary}{!changedPages && changes.length > 1 ? ` +${changes.length - 1} more` : ''}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button onClick={() => setVersionToView(version)} aria-label={`View version from ${formatRevisionTime(version.timestamp)}`} className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition', isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-neutral-200')}><Eye className="h-3.5 w-3.5" aria-hidden="true" /> View</button>
                          {!isCurrent && <button onClick={() => setVersionToRestore(version)} aria-label={`Restore version from ${formatRevisionTime(version.timestamp)}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#3B82F6]/12 px-3 py-2 text-xs font-semibold text-[#3B82F6] transition hover:bg-[#3B82F6]/20"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Restore</button>}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <footer className={cn('border-t px-5 py-3 text-xs sm:px-6', isDarkMode ? 'border-white/10 text-white/45' : 'border-neutral-200 text-neutral-500')}>Autosaves are protected in the background. Only rapid typing updates are grouped together.</footer>
      </section>

      {versionToView && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6">
          <section role="dialog" aria-modal="true" aria-labelledby="version-preview-title" className={cn('flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl', isDarkMode ? 'border-white/10 bg-[#1A1D24] text-white' : 'border-neutral-200 bg-white text-neutral-900')}>
            <header className={cn('flex items-center justify-between border-b px-5 py-4', isDarkMode ? 'border-white/10' : 'border-neutral-200')}>
              <div><h2 id="version-preview-title" className="font-bold">Version preview</h2><p className="text-xs opacity-55">{formatRevisionTime(versionToView.timestamp)}</p></div>
              <button onClick={() => setVersionToView(null)} aria-label="Close version preview" className="rounded-lg p-2 opacity-60 hover:bg-neutral-500/15 hover:opacity-100"><X className="h-5 w-5" /></button>
            </header>
            <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <PreviewField label="Title" value={versionToView.data.title} />
                <PreviewField label="Status" value={formatWatchStatus(String(versionToView.data.status || ''))} />
                <PreviewField label="Rating" value={`${versionToView.data.rating ?? 0} / 10`} />
                <PreviewField label="Type & platform" value={`${formatMediaType(String(versionToView.data.type || ''))} • ${versionToView.data.platform || 'N/A'}`} />
              </div>
              <PreviewContent label="Summary" html={versionToView.data.summary} empty="No summary" isDarkMode={isDarkMode} />
              <PreviewContent label="Notes" html={versionToView.data.notes} empty="No notes" isDarkMode={isDarkMode} />
              <div><h3 className="mb-2 text-xs font-bold uppercase tracking-wider opacity-55">Changed review pages</h3><div className="space-y-3">
                {previewPages.length ? previewPages.map((page: any, index: number) => (
                  <div key={page.id || index} className={cn('rounded-lg p-4', isDarkMode ? 'bg-white/5' : 'bg-neutral-50')}><h4 className="mb-2 text-sm font-semibold">{page.title || `Page ${index + 1}`}</h4><div className="ql-editor !p-0 text-sm" dangerouslySetInnerHTML={{ __html: page.content || '' }} /></div>
                )) : <p className="rounded-lg p-4 text-sm italic opacity-45">No review-page changes in this revision</p>}
              </div></div>
            </div>
            <footer className={cn('flex justify-end gap-2 border-t p-4', isDarkMode ? 'border-white/10' : 'border-neutral-200')}>
              <button onClick={() => setVersionToView(null)} className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-neutral-500/10">Close</button>
              {versionToView.id !== visibleVersions[0]?.id && <button onClick={() => { setVersionToRestore(versionToView); setVersionToView(null); }} className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563EB]">Restore this version</button>}
            </footer>
          </section>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(versionToRestore)}
        onClose={() => { if (!restoring) setVersionToRestore(null); }}
        onConfirm={handleRestore}
        title="Make this version active?"
        message={versionToRestore ? `The revision from ${formatRevisionTime(versionToRestore.timestamp)} will become the active version. Your current content will remain available in history.` : ''}
        confirmLabel="Restore version"
        tone="primary"
        isLoading={restoring}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: unknown }) {
  return <div><h3 className="text-xs font-bold uppercase tracking-wider opacity-55">{label}</h3><p className="mt-1 text-sm font-medium">{String(value ?? 'N/A')}</p></div>;
}

function PreviewContent({ label, html, empty, isDarkMode }: { label: string; html: unknown; empty: string; isDarkMode: boolean }) {
  return <div><h3 className="mb-2 text-xs font-bold uppercase tracking-wider opacity-55">{label}</h3><div className={cn('rounded-lg p-4', isDarkMode ? 'bg-white/5' : 'bg-neutral-50')}>{html ? <div className="ql-editor !p-0 text-sm" dangerouslySetInnerHTML={{ __html: String(html) }} /> : <p className="text-sm italic opacity-45">{empty}</p>}</div></div>;
}
