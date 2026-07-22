const fs = require('fs');

let content = fs.readFileSync('src/components/AddEntryModal.tsx', 'utf8');

// Add import for SearchableDropdown
if (!content.includes('SearchableDropdown')) {
  content = content.replace(
    /import \{ db \} from '\.\.\/db\/db';/,
    `import { db } from '../db/db';\nimport { SearchableDropdown } from './SearchableDropdown';`
  );
}

// Alphabetize PREDEFINED_GENRES
content = content.replace(
  /const PREDEFINED_GENRES = \[\s*'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',\s*'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',\s*'Thriller', 'Documentary'\s*\];/,
  `const PREDEFINED_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Documentary', 'Drama', 'Fantasy', 
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller'
];`
);

// Add customPlatforms state
content = content.replace(
  /const \[newGenre, setNewGenre\] = useState\(''\);/,
  `const [newGenre, setNewGenre] = useState('');
  const [customPlatforms, setCustomPlatforms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('customPlatforms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddPlatform = (platform: string) => {
    if (!customPlatforms.includes(platform) && !['Cineby', 'LokLok', 'Movie Box', 'Netflix', 'StreameX', 'Other'].includes(platform)) {
      const newCustom = [...customPlatforms, platform];
      setCustomPlatforms(newCustom);
      localStorage.setItem('customPlatforms', JSON.stringify(newCustom));
    }
    setFormData({ ...formData, platform });
  };`
);

// Replace Type select
const typeSelectRegex = /<select\s+value=\{formData\.type\}\s+onChange=\{e => setFormData\(\{ \.\.\.formData, type: e\.target\.value as MediaType \}\)\}\s+className=\{cn\([\s\S]*?<\/select>/;

const typeSelectReplacement = `<SearchableDropdown 
                    value={formData.type as string}
                    onChange={(val) => setFormData({ ...formData, type: val as MediaType })}
                    isDarkMode={isDarkMode}
                    options={Object.values(MediaType).map(t => ({ value: t, label: formatMediaType(t) }))}
                  />`;

content = content.replace(typeSelectRegex, typeSelectReplacement);

// Replace Status select
const statusSelectRegex = /<select\s+value=\{formData\.status\}\s+onChange=\{e => setFormData\(\{ \.\.\.formData, status: e\.target\.value as WatchStatus \}\)\}\s+className=\{cn\([\s\S]*?<\/select>/;

const statusSelectReplacement = `<SearchableDropdown 
                    value={formData.status as string}
                    onChange={(val) => setFormData({ ...formData, status: val as WatchStatus })}
                    isDarkMode={isDarkMode}
                    options={Object.values(WatchStatus).map(s => ({ value: s, label: formatWatchStatus(s) }))}
                  />`;

content = content.replace(statusSelectRegex, statusSelectReplacement);

// Replace Platform input
const platformInputRegex = /<input\s+type="text"\s+placeholder="e\.g\. Netflix, Cinema"\s+value=\{formData\.platform\}\s+onChange=\{e => setFormData\(\{ \.\.\.formData, platform: e\.target\.value \}\)\}\s+className=\{cn\([\s\S]*?<\/div>/;

const platformReplacement = `<SearchableDropdown
                    value={formData.platform || ''}
                    onChange={(val) => setFormData({ ...formData, platform: val })}
                    isDarkMode={isDarkMode}
                    allowAdd={true}
                    onAdd={handleAddPlatform}
                    placeholder="Select or Add Platform..."
                    options={[
                      ...['Cineby', 'LokLok', 'Movie Box', 'Netflix', 'StreameX'].map(p => ({ value: p, label: p })),
                      ...customPlatforms.map(p => ({ value: p, label: p })),
                      { value: 'Other', label: 'Other' }
                    ]}
                  />
                </div>`;

content = content.replace(platformInputRegex, platformReplacement);

fs.writeFileSync('src/components/AddEntryModal.tsx', content);
