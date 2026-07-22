const fs = require('fs');
let code = fs.readFileSync('src/components/SearchableDropdown.tsx', 'utf8');

code = code.replace(
  /setFocusedIndex\(-1\);\n  \}, \[searchQuery, isOpen\]\);/,
  `setFocusedIndex(-1);
  }, [searchQuery, isOpen]);

  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);`
);

fs.writeFileSync('src/components/SearchableDropdown.tsx', code);
