module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@constants': './src/constants',
            '@screens': './src/screens',
            '@types': './src/types',
            '@context': './src/context',
            '@navigation': './src/navigation',
            '@utils': './src/utils'
          }
        }
      ]
    ]
  };
}; 