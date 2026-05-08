module.exports = () => ({
  name: 'GreenTorchApp',
  slug: 'greentorch-app',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'com.greentorchapp',
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
  },
});
