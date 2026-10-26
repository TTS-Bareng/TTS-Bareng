import SwiftUI
import WidgetKit
import AppIntents

#if canImport(AppIntents) && compiler(>=6.0)

// MARK: - App Intents for Instant Deep Linking
@available(iOS 18.0, *)
public struct OpenDailyRushIntent: AppIntent {
    public static var title: LocalizedStringResource = "Mulai Daily Rush"
    public static var openAppWhenRun: Bool = true

    public init() {}

    @MainActor
    public func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: "group.com.syntheticae.ttsbareng") ?? UserDefaults.standard
        defaults.set("rush", forKey: "tts_pending_widget_action")
        defaults.synchronize()
        return .result()
    }
}

@available(iOS 18.0, *)
public struct OpenScanQrIntent: AppIntent {
    public static var title: LocalizedStringResource = "Pindai QR Mabar"
    public static var openAppWhenRun: Bool = true

    public init() {}

    @MainActor
    public func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: "group.com.syntheticae.ttsbareng") ?? UserDefaults.standard
        defaults.set("scan", forKey: "tts_pending_widget_action")
        defaults.synchronize()
        return .result()
    }
}

@available(iOS 18.0, *)
public struct OpenContinuePlayIntent: AppIntent {
    public static var title: LocalizedStringResource = "Lanjutkan Bab TTS"
    public static var openAppWhenRun: Bool = true

    public init() {}

    @MainActor
    public func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: "group.com.syntheticae.ttsbareng") ?? UserDefaults.standard
        defaults.set("play", forKey: "tts_pending_widget_action")
        defaults.synchronize()
        return .result()
    }
}

// MARK: - 1. Control Center: Mulai Daily Rush
@available(iOS 18.0, *)
public struct DailyRushControlWidget: ControlWidget {
    public let kind: String = "TTSDailyRushControlWidget"

    public init() {}

    public var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: kind) {
            ControlWidgetButton(action: OpenDailyRushIntent()) {
                Label("Daily Rush", systemImage: "bolt.fill")
            }
        }
        .displayName("Mulai Daily Rush")
        .description("Buka langsung kuis kilat 60 detik kata Nusantara.")
    }
}

// MARK: - 2. Control Center: Pindai QR Mabar
@available(iOS 18.0, *)
public struct ScanQrControlWidget: ControlWidget {
    public let kind: String = "TTSScanQrControlWidget"

    public init() {}

    public var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: kind) {
            ControlWidgetButton(action: OpenScanQrIntent()) {
                Label("Pindai QR", systemImage: "qrcode.viewfinder")
            }
        }
        .displayName("Pindai QR Mabar")
        .description("Buka kamera scanner untuk gabung ruangan mabar teman seketika.")
    }
}

// MARK: - 3. Control Center: Lanjutkan Bab TTS
@available(iOS 18.0, *)
public struct ContinuePlayControlWidget: ControlWidget {
    public let kind: String = "TTSContinuePlayControlWidget"

    public init() {}

    public var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: kind) {
            ControlWidgetButton(action: OpenContinuePlayIntent()) {
                Label("Main TTS", systemImage: "play.rectangle.fill")
            }
        }
        .displayName("Lanjutkan Bab TTS")
        .description("Lanjutkan teka-teki silang terakhir yang sedang dimainkan.")
    }
}

#endif
