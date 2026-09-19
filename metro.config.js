const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// তোমার @/* alias যাতে Metro ও বোঝে
config.resolver.sourceExts.push('cjs');

module.exports = config;
