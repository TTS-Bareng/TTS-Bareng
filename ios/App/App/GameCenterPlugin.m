#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(GameCenterPlugin, "GameCenterPlugin",
    CAP_PLUGIN_METHOD(authenticate, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(submitScore, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(unlockAchievement, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(showGameCenter, CAPPluginReturnPromise);
)
