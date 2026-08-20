import React, { useEffect, useState } from 'react';
import { useData } from '../../lib/data-context';
import { MediaEntry } from '../../types';
import { X, Clock, RotateCcw, AlertTriangle, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ConfirmModal } from '../common/ConfirmModal';

export function VersionHistoryModal({ 
  entry, 
  isOpen, 
  onClose, 
  isDarkMode 
}: { 
  entry: MediaEntry, 
  isOpen: boolean, 
  onClose: () => void, 
  isDarkMode: boolean 
}) {
  const { getVersions, updateEntry } = useData();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [versionToRestore, setVersionToRestore] = useState<any>(null);
  const [versionToPreview, setVersionToPreview] = useState<any>(null);

  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html.replace(/<\/p>|<\/div>|<\/h[1-6]>/gi, ' ').replace(/<br\s*\/?>/gi, ' ');
    return (tmp.textContent || tmp.innerText || "").replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
  };

  const getDiff = (current: any, previous: any) => {
    if (!previous) return [{ field: 'Initial Version', oldValue: null, newValue: null }];
    
    const changes: any[] = [];
    const fieldsToCheck = ['title', 'status', 'rating', 'type', 'platform', 'summary', 'review', 'notes', 'journal'];
    
    for (const field of fieldsToCheck) {
      let currVal = current[field];
      let prevVal = previous[field];
      
      if (field === 'journal') {
        const currJournal = Array.isArray(currVal) ? currVal : [];
        const prevJournal = Array.isArray(prevVal) ? prevVal : [];
        
        const currStr = currJournal.map(j => `${j.title || 'Untitled'}: ${stripHtml(j.content || '')}`).join(' | ');
        const prevStr = prevJournal.map(j => `${j.title || 'Untitled'}: ${stripHtml(j.content || '')}`).join(' | ');
        
        if (currStr !== prevStr) {
          changes.push({
            field: 'Journal/Review',
            oldValue: prevStr || 'Empty',
            newValue: currStr || 'Empty'
          });
        }
      } else if (field === 'summary' || field === 'notes' || field === 'review') {
        const currStr = stripHtml(currVal || '');
        const prevStr = stripHtml(prevVal || '');
        if (currStr !== prevStr) {
          changes.push({
            field: field.charAt(0).toUpperCase() + field.slice(1),
            oldValue: prevStr || 'Empty',
            newValue: currStr || 'Empty'
          });
        }
      } else {
        if (currVal !== prevVal) {
          changes.push({ 
            field: field.charAt(0).toUpperCase() + field.slice(1), 
            oldValue: prevVal, 
            newValue: currVal 
          });
        }
      }
    }
    
    return changes.length > 0 ? changes : [{ field: 'No visible changes', oldValue: null, newValue: null }];
  };

  useEffect(() => {
    if (isOpen && entry.id) {
      setLoading(true);
      getVersions(entry.id).then(v => {
        setVersions(v);
        setLoading(false);
      });
    }
  }, [isOpen, entry.id]);

  if (!isOpen) return null;

  const handleRestore = async () => {
    if (versionToRestore && entry.id) {
      const { id, userId, createdAt, updatedAt, deletedAt, ...restData } = versionToRestore.data;
      await updateEntry(entry.id, { ...restData, updatedAt: new Date().toISOString() });
      setVersionToRestore(null);
      onClose(); // Close history modal to see the restored entry
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={cn(
        "relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden",
        isDarkMode ? "bg-[#1A1D24] text-white" : "bg-white text-neutral-900"
      )}>
        <div className={cn(
          "px-6 py-4 border-b flex items-center justify-between shrink-0",
          isDarkMode ? "border-white/10" : "border-neutral-200"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isDarkMode ? "bg-[#3B82F6]/20 text-[#3B82F6]" : "bg-[#3B82F6]/10 text-[#3B82F6]"
            )}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Version History</h2>
              <p className={cn("text-xs", isDarkMode ? "text-white/60" : "text-neutral-500")}>
                View and restore past versions of "{entry.title}"
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDarkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              No previous versions found.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {versions.map((v, index) => {
                const isCurrent = index === 0;
                const prevVersion = versions[index + 1];
                const diff = getDiff(v.data, prevVersion?.data);
                
                return (
                  <div 
                    key={v.id} 
                    className={cn(
                      "p-4 rounded-xl border flex flex-col gap-3 transition-colors",
                      isDarkMode 
                        ? (isCurrent ? "border-[#3B82F6]/50 bg-[#3B82F6]/5" : "border-white/10 bg-white/5 hover:bg-white/10") 
                        : (isCurrent ? "border-[#3B82F6]/50 bg-[#3B82F6]/5" : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100")
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {new Date(v.timestamp).toLocaleString()}
                        </span>
                        {isCurrent && (
                          <span className={cn(
                            "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                            isDarkMode ? "bg-[#3B82F6]/20 text-[#3B82F6]" : "bg-[#3B82F6]/10 text-[#3B82F6]"
                          )}>
                            Current
                          </span>
                        )}
                      </div>
                      {!isCurrent && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setVersionToPreview(v)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                              isDarkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
                            )}
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                          <button
                            onClick={() => setVersionToRestore(v)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                              isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-neutral-200 hover:bg-neutral-300 text-neutral-900"
                            )}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className={cn(
                      "text-xs p-3 rounded-lg flex flex-col gap-2 overflow-hidden",
                      isDarkMode ? "bg-black/20" : "bg-white border"
                    )}>
                      <div className="flex flex-col gap-1.5">
                        {diff.map((change, i) => (
                          <div key={i} className="flex flex-col">
                            {change.field === 'Initial Version' || change.field === 'No visible changes' ? (
                              <span className="opacity-60 italic">{change.field}</span>
                            ) : (
                              <div className="flex items-start gap-1.5">
                                <span className={cn("font-bold", isDarkMode ? "text-white/70" : "text-neutral-600")}>{change.field}:</span>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 opacity-80 break-words flex-1 min-w-0">
                                  <span className="line-through text-red-500/80 truncate max-w-[200px] sm:max-w-[150px]">
                                    {String(change.oldValue || 'None').substring(0, 50)}{String(change.oldValue || '').length > 50 ? '...' : ''}
                                  </span>
                                  <span className="hidden sm:inline shrink-0">→</span>
                                  <span className="text-green-500/90 truncate max-w-[200px] sm:max-w-[150px]">
                                    {String(change.newValue || 'None').substring(0, 50)}{String(change.newValue || '').length > 50 ? '...' : ''}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {versionToPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={cn(
            "relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden",
            isDarkMode ? "bg-[#1A1D24] text-white" : "bg-white text-neutral-900"
          )}>
            <div className={cn(
              "px-6 py-4 border-b flex items-center justify-between shrink-0",
              isDarkMode ? "border-white/10" : "border-neutral-200"
            )}>
              <h2 className="text-xl font-bold">Preview: {new Date(versionToPreview.timestamp).toLocaleString()}</h2>
              <button 
                onClick={() => setVersionToPreview(null)}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDarkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-1">Title</h3>
                  <p className="font-medium">{versionToPreview.data.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-1">Status</h3>
                  <p className="font-medium">{versionToPreview.data.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-1">Rating</h3>
                  <p className="font-medium">{versionToPreview.data.rating} / 10</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-1">Type & Platform</h3>
                  <p className="font-medium">{versionToPreview.data.type} • {versionToPreview.data.platform || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-2">Summary</h3>
                <div 
                  className={cn("p-4 rounded-lg custom-quill-container", isDarkMode ? "bg-white/5" : "bg-neutral-50")}>
                  <div className="ql-editor !p-0 whitespace-pre-wrap break-words overflow-hidden [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md text-sm" dangerouslySetInnerHTML={{ __html: versionToPreview.data.summary || '<p class="opacity-50 italic">No summary</p>' }} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-2">Review / Journal</h3>
                <div className="space-y-3">
                  {versionToPreview.data.journal && versionToPreview.data.journal.length > 0 ? (
                    versionToPreview.data.journal.map((j: any, i: number) => (
                      <div key={i} className={cn("p-4 rounded-lg", isDarkMode ? "bg-white/5" : "bg-neutral-50")}>
                        <h4 className="font-semibold mb-2">{j.title || `Page ${i + 1}`}</h4>
                        <div 
                          className="custom-quill-container">
                          <div className="ql-editor !p-0 whitespace-pre-wrap break-words overflow-hidden [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md text-sm" dangerouslySetInnerHTML={{ __html: j.content || '' }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={cn("p-4 rounded-lg", isDarkMode ? "bg-white/5" : "bg-neutral-50")}>
                      <p className="opacity-50 italic">No journal entries</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-2">Notes</h3>
                <div 
                  className={cn("p-4 rounded-lg custom-quill-container", isDarkMode ? "bg-white/5" : "bg-neutral-50")}>
                  <div className="ql-editor !p-0 whitespace-pre-wrap break-words overflow-hidden [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md text-sm" dangerouslySetInnerHTML={{ __html: versionToPreview.data.notes || '<p class="opacity-50 italic">No notes</p>' }} />
                </div>
              </div>
            </div>
            
            <div className={cn("p-4 border-t flex justify-end gap-3", isDarkMode ? "border-white/10" : "border-neutral-200")}>
              <button
                onClick={() => setVersionToPreview(null)}
                className={cn("px-4 py-2 rounded-lg font-semibold text-sm", isDarkMode ? "hover:bg-white/10" : "hover:bg-neutral-100")}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setVersionToRestore(versionToPreview);
                  setVersionToPreview(null);
                }}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              >
                Restore This Version
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmModal
        isOpen={!!versionToRestore}
        onClose={() => setVersionToRestore(null)}
        onConfirm={handleRestore}
        title="Restore Version"
        message={`Are you sure you want to restore this entry to the state it was in on ${versionToRestore ? new Date(versionToRestore.timestamp).toLocaleString() : ''}? Your current version will be saved as a new history record so you can always undo this action.`}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
