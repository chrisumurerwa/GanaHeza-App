const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Marks android.hardware.screen.portrait as optional so the app is available
 * on tablets, desktops, and Android XR devices on Google Play.
 */
module.exports = function withPortraitOptional(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest['uses-feature']) {
      manifest['uses-feature'] = [];
    }

    // Remove any existing portrait declaration
    manifest['uses-feature'] = manifest['uses-feature'].filter(
      (f) => f.$?.['android:name'] !== 'android.hardware.screen.portrait'
    );

    // Add it back as optional (required: false)
    manifest['uses-feature'].push({
      $: {
        'android:name': 'android.hardware.screen.portrait',
        'android:required': 'false',
      },
    });

    return config;
  });
};
