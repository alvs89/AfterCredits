const fs = require('fs');
let code = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

// Add Maximize2, Minimize2 to lucide imports
code = code.replace(
  /import \{ X, Star, Calendar, Edit2, Save \} from 'lucide-react';/,
  `import { X, Star, Calendar, Edit2, Save, Maximize2, Minimize2 } from 'lucide-react';`
);

// Add isMaximized state
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'summary' \| 'review' \| 'notes'>\('summary'\);/,
  `const [activeTab, setActiveTab] = useState<'summary' | 'review' | 'notes'>('summary');\n  const [isMaximized, setIsMaximized] = useState(false);`
);

// Update max-w-4xl to dynamic
code = code.replace(
  /"w-full max-w-4xl max-h-\[90vh\] overflow-hidden rounded-2xl shadow-2xl transition-colors relative border flex flex-col md:flex-row",/g,
  `"w-full overflow-hidden shadow-2xl transition-all relative border flex flex-col md:flex-row",\n          isMaximized ? "max-w-[100vw] h-[100vh] max-h-[100vh] rounded-none border-none" : "max-w-6xl max-h-[90vh] rounded-2xl",`
);

// Add Maximize/Minimize button next to close button (Desktop)
const closeBtnRegex = /<button \s*onClick=\{onClose\}\s*className=\{cn\("absolute top-6 right-6 p-2 rounded transition-colors border z-10 hidden md:block", isDarkMode \? "bg-white\/5 hover:bg-white\/10 border-white\/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-900"\)\}\s*>\s*<X className=\{cn\("w-4 h-4", isDarkMode \? "text-white\/50" : "text-neutral-500"\)\} \/>\s*<\/button>/g;

const closeBtnReplacement = `<div className="absolute top-6 right-6 z-10 hidden md:flex gap-2">
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className={cn("p-2 rounded transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-900")}
            >
              {isMaximized ? (
                <Minimize2 className={cn("w-4 h-4", isDarkMode ? "text-white/50" : "text-neutral-500")} />
              ) : (
                <Maximize2 className={cn("w-4 h-4", isDarkMode ? "text-white/50" : "text-neutral-500")} />
              )}
            </button>
            <button 
              onClick={onClose}
              className={cn("p-2 rounded transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-900")}
            >
              <X className={cn("w-4 h-4", isDarkMode ? "text-white/50" : "text-neutral-500")} />
            </button>
          </div>`;

code = code.replace(closeBtnRegex, closeBtnReplacement);

fs.writeFileSync('src/components/ViewEntryModal.tsx', code);
