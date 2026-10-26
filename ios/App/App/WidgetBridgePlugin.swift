import Foundation
import Capacitor
import WidgetKit

@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "updateSnapshot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reloadWidgets", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPendingAction", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearPendingAction", returnType: CAPPluginReturnPromise)
    ]

    private let appGroupIdentifier = "group.com.syntheticae.ttsbareng"

    private var sharedDefaults: UserDefaults {
        return UserDefaults(suiteName: appGroupIdentifier) ?? UserDefaults.standard
    }

    /**
     * Updates the game snapshot in App Group UserDefaults.
     * This snapshot is read by SwiftUI WidgetKit widgets on Home Screen, Lock Screen, and Control Center.
     */
    @objc public func updateSnapshot(_ call: CAPPluginCall) {
        guard let snapshot = call.getObject("snapshot") else {
            call.reject("Data snapshot tidak valid")
            return
        }

        sharedDefaults.set(snapshot, forKey: "tts_widget_snapshot")
        if let jsonData = try? JSONSerialization.data(withJSONObject: snapshot, options: []) {
            sharedDefaults.set(jsonData, forKey: "tts_widget_snapshot_data")
        }
        sharedDefaults.set(Date().timeIntervalSince1970, forKey: "tts_widget_last_synced")
        sharedDefaults.synchronize()

        // Refresh all widget timelines
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve(["success": true])
    }

    /**
     * Forces WidgetKit to reload all timelines immediately.
     */
    @objc public func reloadWidgets(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve(["success": true])
    }

    /**
     * Retrieves any pending intent navigation action queued by iOS 18 Control Center or Lock Screen widgets.
     */
    @objc public func getPendingAction(_ call: CAPPluginCall) {
        let action = sharedDefaults.string(forKey: "tts_pending_widget_action")
        call.resolve(["action": action as Any])
    }

    /**
     * Clears processed widget navigation action.
     */
    @objc public func clearPendingAction(_ call: CAPPluginCall) {
        sharedDefaults.removeObject(forKey: "tts_pending_widget_action")
        sharedDefaults.synchronize()
        call.resolve(["success": true])
    }
}
