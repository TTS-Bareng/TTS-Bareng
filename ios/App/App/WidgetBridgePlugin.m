#import <Capacitor/Capacitor.h>

CAP_PLUGIN(WidgetBridgePlugin, "WidgetBridge",
    CAP_PLUGIN_METHOD(updateSnapshot, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(reloadWidgets, CAPPluginReturnPromise);
)
