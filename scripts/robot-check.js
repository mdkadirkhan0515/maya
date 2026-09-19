const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const RULES = [
  'App.tsx',
  'app.json',
  'package.json',
  'babel.config.js',
  'src/constants/theme.ts',
  'src/types/bookTypes.ts',
  'src/components/Card.tsx',
  'src/components/Header.tsx',
  'src/components/InputBox.tsx',
  'src/components/SettingItem.tsx',
  'src/navigation/BottomTabNavigator.tsx',
  'src/screens/WordsScreen.tsx',
  'src/screens/LearnScreen.tsx',
  'src/screens/GuideScreen.tsx',
  'src/screens/SettingsScreen.tsx',
  'src/services/storageService.ts',
  'src/services/ttsService.ts',
  'src/services/githubService.ts',
  'src/services/settingsService.ts'
];

let fail = false;
RULES.forEach(f => {
  if (!fs.existsSync(path.join(ROOT, f))) fail = true;
});

process.exit(fail ? 1 : 0);
