const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const MUST_HAVE = [
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
  'src/services/settingsService.ts',
];

let hasError = false;
console.log('\n🤖 MAYA ROBOT CHECKER - SDK 57 APK\n');

MUST_HAVE.forEach(file => {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    console.log(`❌ MISSING: ${file}`);
    hasError = true;
  } else {
    console.log(`✅ OK: ${file}`);
  }
});

console.log('\n🔍 Checking Icon Imports...');
const srcFiles = [];
function walk(dir){
  if(!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.tsx') || p.endsWith('.ts')) srcFiles.push(p);
  });
}
walk(path.join(ROOT, 'src'));

srcFiles.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  if(/from\s+['"]@expo\/vector-icons\/\w+['"]/.test(code)){
    console.log(`❌ BAD ICON IMPORT in ${path.relative(ROOT, file)}`);
    hasError = true;
  }
});

console.log('\n' + (hasError ? '🔴 ROBOT FAILED' : '🟢 ROBOT PASSED - EAS Build pass করবে'));
process.exit(hasError ? 1 : 0);
