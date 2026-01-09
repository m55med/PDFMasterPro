module.exports = {
  dependencies: {
    // Temporarily disable react-native-fs due to CocoaPods CDN issues
    'react-native-fs': {
      platforms: {
        ios: null, // Disable for iOS
      },
    },
  },
};
