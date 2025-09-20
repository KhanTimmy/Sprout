const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push("cjs");

defaultConfig.transformer = {
  ...defaultConfig.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

defaultConfig.resolver = {
  ...defaultConfig.resolver,
  alias: {
    ...defaultConfig.resolver.alias,
  },
  enableSymlinks: true,
};

if (process.env.NODE_ENV === 'development') {
  defaultConfig.transformer = {
    ...defaultConfig.transformer,
    unstable_allowRequireContext: true,
  };
}

module.exports = defaultConfig;
