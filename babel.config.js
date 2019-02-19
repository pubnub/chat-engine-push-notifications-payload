module.exports = {
    presets: [
        '@babel/preset-env',
        'module:metro-react-native-babel-preset'
    ],
    comments: false,
    plugins: [
        'add-module-exports',
        '@babel/plugin-proposal-class-properties'
    ],
    sourceMaps: true
};
