const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// 1. যে ফাইল গুলো থাকতেই হবে
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
  'assets/icon.png',
  'assets/splash.png',
  'assets/adaptive-icon.png',
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

// 2. ভুল Icon Import চেক
console.log('\n🔍 Checking Icon Imports (SDK 57 APK Bug)...');
const srcFiles = [];
function walk(dir){
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.tsx') || p.endsWith('.ts')) srcFiles.push(p);
  });
}
if(fs.existsSync(path.join(ROOT, 'src'))) walk(path.join(ROOT, 'src'));

srcFiles.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  // পুরানো ভুল import: from '@expo/vector-icons/Feather'
  if(/from\s+['"]@expo\/vector-icons\/\w+['"]/.test(code)){
    console.log(`❌ BAD ICON IMPORT in ${path.relative(ROOT, file)} -> use { Feather } from '@expo/vector-icons'`);
    hasError = true;
  }
  // Expo Router এখনো আছে কিনা
  if(code.includes('expo-router') || code.includes('EXPO_ROUTER')){
    console.log(`❌ EXPO-ROUTER STILL FOUND in ${path.relative(ROOT, file)}`);
    hasError = true;
  }
});

// 3. package.json চেক
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
if(pkg.dependencies['expo-router']){
  console.log('❌ package.json এ এখনো expo-router আছে - APK তে মুছে দাও');
  hasError = true;
}
if(pkg.main && pkg.main.includes('expo-router')){
  console.log('❌ package.json main এখনো expo-router/entry - বদলে node_modules/expo/AppEntry.js করো');
  hasError = true;
}

console.log('\n' + (hasError ? '🔴 ROBOT FAILED: কিছু ফাইল বা path ঠিক নেই, উপরে ❌ গুলো ঠিক করো' : '🟢 ROBOT PASSED: সব src file, path, icon ঠিক আছে - EAS Build pass করবে'));

if (hasError) {
  process.exit(1); // GitHub Workflow কে Fail করাবে
} else {
  process.exit(0);
}
