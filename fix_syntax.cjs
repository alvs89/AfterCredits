const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

content = content.replace(
  `  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm", isMaximized ? "p-0" : "p-4")} onClick={handleClose}>`,
  `  return (
    <>
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm", isMaximized ? "p-0" : "p-4")} onClick={handleClose}>`
);

content = content.replace(
  `        </div>
      )}
    </div>
  );
}`,
  `        </div>
      )}
    </>
  );
}`
);

// We need to fix the extra </div> I added earlier that was completely wrong.
// The previous end of file was:
/*
      </div>
    </div>
            {fullscreenImage && (
...
      )}
    </div>
  );
}
*/
// It should be:
/*
      </div>
    </div>
            {fullscreenImage && (
...
      )}
    </>
  );
}
*/
content = content.replace(
  `        </div>
      </div>
    </div>
            {fullscreenImage && (`,
  `        </div>
      </div>
    </div>
            {fullscreenImage && (`
); // Wait, this doesn't fix the extra </div> if there is one.

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
