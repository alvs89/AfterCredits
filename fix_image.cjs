const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

// Add fullscreen image state
content = content.replace(
  `const [isMaximized, setIsMaximized] = useState(false);`,
  `const [isMaximized, setIsMaximized] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);`
);

// Add click handler for images in Quill
const clickHandler = `  const handleQuillClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLImageElement) {
      setFullscreenImage(e.target.src);
    }
  };`;
  
content = content.replace(
  `useEffect(() => {`,
  clickHandler + '\n\n  useEffect(() => {'
);

// Attach onClick to custom-quill-container
content = content.replace(
  `<div className="flex-1 flex flex-col pb-8 pr-4 custom-quill-container min-h-0">`,
  `<div className="flex-1 flex flex-col pb-8 pr-4 custom-quill-container min-h-0" onClick={handleQuillClick}>`
);

// Add fullscreen image modal at the end of the return statement
const imageModal = `
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[70]"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain pointer-events-none"
          />
        </div>
      )}
`;

content = content.replace(
  `    </div>
  );
}`,
  `    </div>
      ${imageModal}
    </div>
  );
}`
);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
