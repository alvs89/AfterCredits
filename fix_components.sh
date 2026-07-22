# Fix AddEntryModal
sed -i 's/import { cn } from "..\/lib\/utils";/import { cn, formatMediaType, formatWatchStatus } from "..\/lib\/utils";/g' src/components/AddEntryModal.tsx
sed -i 's/{t.replace(\/_\/g, '"'"' '"'"')}/{t === "type" ? formatMediaType(t) : formatWatchStatus(t)}/g' src/components/AddEntryModal.tsx
