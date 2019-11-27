const notarize = require ('electron-notarize'). notarize;

module.exports = async (context) => {
    const {electronPlatformName} = context;
    if (electronPlatformName === 'darwin') {
        try {
            console.log ('Try notarize app');
            await notarize ({
                appBundleId: 'info.easydisplay.macos',
                appPath: './build/mac/EasyDisplay.app',
                appleApiKey: "7F4P5NWL7X",
                appleApiIssuer: "69a6de72-e7d0-47e3-e053-5b8c7c11a4d1",
            });
            console.log ('Success notarize');
        } catch (err) {
            console.log (err);
        }
    }
};
