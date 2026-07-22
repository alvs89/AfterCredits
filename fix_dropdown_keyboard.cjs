const fs = require('fs');

let code = fs.readFileSync('src/components/SearchableDropdown.tsx', 'utf8');

if (!code.includes('focusedIndex')) {
  // Add focusedIndex state
  code = code.replace(
    /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
    `const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);`
  );

  // Update effect to reset focusedIndex when search changes
  code = code.replace(
    /const filteredOptions = sortedOptions.filter\(opt =>/,
    `useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, isOpen]);
  
  const filteredOptions = sortedOptions.filter(opt =>`
  );

  // Update handleKeyDown
  code = code.replace(
    /onKeyDown=\{\(e\) => \{[\s\S]*?\}\}/,
    `onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[focusedIndex].value);
                  } else if (focusedIndex === filteredOptions.length && allowAdd) {
                    handleAdd();
                  } else if (filteredOptions.length > 0 && focusedIndex === -1) {
                    handleSelect(filteredOptions[0].value);
                  } else if (allowAdd && onAdd) {
                    handleAdd();
                  }
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setFocusedIndex(prev => Math.min(prev + 1, allowAdd && searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase()) ? filteredOptions.length : filteredOptions.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setFocusedIndex(prev => Math.max(prev - 1, 0));
                }
              }}`
  );
  
  // Assign refs and background colors based on focusedIndex for options
  code = code.replace(
    /filteredOptions\.map\(\(opt\) => \([\s\S]*?<button[\s\S]*?className=\{cn\([\s\S]*?"w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between",[\s\S]*?isDarkMode \? "hover:bg-white\/10 text-white" : "hover:bg-neutral-100 text-neutral-900"[\s\S]*?\)\}/,
    `filteredOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  ref={el => optionsRef.current[index] = el}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between transition-colors",
                    isDarkMode ? "text-white" : "text-neutral-900",
                    focusedIndex === index 
                      ? (isDarkMode ? "bg-white/10" : "bg-neutral-100") 
                      : (isDarkMode ? "hover:bg-white/10" : "hover:bg-neutral-100")
                  )}`
  );

  // Background for Add button
  code = code.replace(
    /<button\s+type="button"\s+onClick=\{handleAdd\}\s+className=\{cn\(\s*"w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 mt-1 border-t",\s*isDarkMode \? "hover:bg-white\/10 text-white border-white\/10" : "hover:bg-neutral-100 text-\[#3B82F6\] border-neutral-100"\s*\)\}\s*>/,
    `<button
                type="button"
                onMouseEnter={() => setFocusedIndex(filteredOptions.length)}
                onClick={handleAdd}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 mt-1 border-t transition-colors",
                  isDarkMode ? "text-white border-white/10" : "text-[#3B82F6] border-neutral-100",
                  focusedIndex === filteredOptions.length
                    ? (isDarkMode ? "bg-white/10" : "bg-neutral-100")
                    : (isDarkMode ? "hover:bg-white/10" : "hover:bg-neutral-100")
                )}
              >`
  );

  fs.writeFileSync('src/components/SearchableDropdown.tsx', code);
}
