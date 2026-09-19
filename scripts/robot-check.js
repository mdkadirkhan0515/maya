const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
let fail = false;

console.log('\n🤖 MAYA CHECK - Files & Code\n');

// তোমার প্রজেক্টে যা থাকতেই হবে
const FILES = [
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

FILES.forEach(f => {
  if (fs.existsSync(path.join(ROOT, f))) {
    console.log(`✅ ${f}`);
  } else {
    console.log(`❌ MISSING: ${f}`);
    fail = true;
  }
});

// কোড চেক - ভুল icon import আছে কিনা
console.log('\n🔍 Code Check:');

function checkDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      const code = fs.readFileSync(full, 'utf8');
      if (/from ['"]@expo\/vector-icons\/\w+['"]/.test(code)) {
        console.log(`❌ BAD IMPORT: ${path.relative(ROOT, full)}`);
        fail = true;
      }
      if (code.includes('expo-router')) {
        console.log(`❌ expo-router FOUND: ${path.relative(ROOT, full)}`);
        fail = true;
      }
    }
  });
}

checkDir(path.join(ROOT, 'src'));

console.log(fail ? '\n🔴 FAILED' : '\n🟢 PASSED - সব ফাইল ও কোড ঠিক আছে');
process.exit(fail ? 1 : 0);
