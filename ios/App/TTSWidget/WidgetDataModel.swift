import Foundation
import SwiftUI
import WidgetKit

// MARK: - Word of the Day Model
public struct WidgetWordOfTheDay: Codable {
    public let word: String
    public let clue: String
    public let category: String?

    public init(word: String, clue: String, category: String? = nil) {
        self.word = word
        self.clue = clue
        self.category = category
    }
}

// MARK: - Game Snapshot Model
public struct TTSWidgetSnapshot: Codable {
    public let streak: Int
    public let streakShields: Int
    public let stars: Int
    public let currentLevel: Int
    public let currentLevelTitle: String
    public let currentRealmName: String
    public let eloRating: Int
    public let eloTier: String
    public let isVip: Bool
    public let dailyRushCompleted: Bool
    public let dailyRushScore: Int
    public let wordOfTheDay: WidgetWordOfTheDay?
    public let lastUpdated: String?

    public static var fallback: TTSWidgetSnapshot {
        return TTSWidgetSnapshot(
            streak: 7,
            streakShields: 1,
            stars: 120,
            currentLevel: 1,
            currentLevelTitle: "Pantai Losari",
            currentRealmName: "Alam Maritim Makassar",
            eloRating: 1100,
            eloTier: "Pendekar Kata",
            isVip: false,
            dailyRushCompleted: false,
            dailyRushScore: 0,
            wordOfTheDay: WidgetWordOfTheDay(
                word: "SEKATA",
                clue: "Satu pendapat atau seia sekata",
                category: "KBBI Nusantara"
            ),
            lastUpdated: nil
        )
    }
}

// MARK: - Timeline Entry
public struct TTSWidgetEntry: TimelineEntry {
    public let date: Date
    public let snapshot: TTSWidgetSnapshot

    public init(date: Date, snapshot: TTSWidgetSnapshot) {
        self.date = date
        self.snapshot = snapshot
    }
}

// MARK: - Data Manager (App Group UserDefaults)
public class WidgetDataManager {
    public static let shared = WidgetDataManager()
    private let appGroupIdentifier = "group.com.syntheticae.ttsbareng"

    private var sharedDefaults: UserDefaults {
        return UserDefaults(suiteName: appGroupIdentifier) ?? UserDefaults.standard
    }

    public func getSnapshot() -> TTSWidgetSnapshot {
        if let data = sharedDefaults.data(forKey: "tts_widget_snapshot_data"),
           let decoded = try? JSONDecoder().decode(TTSWidgetSnapshot.self, from: data) {
            return decoded
        }
        if let dict = sharedDefaults.dictionary(forKey: "tts_widget_snapshot"),
           let jsonData = try? JSONSerialization.data(withJSONObject: dict, options: []),
           let decoded = try? JSONDecoder().decode(TTSWidgetSnapshot.self, from: jsonData) {
            return decoded
        }
        return TTSWidgetSnapshot.fallback
    }
}

// MARK: - Shared Timeline Provider
public struct TTSWidgetProvider: TimelineProvider {
    public init() {}

    public func placeholder(in context: Context) -> TTSWidgetEntry {
        return TTSWidgetEntry(date: Date(), snapshot: TTSWidgetSnapshot.fallback)
    }

    public func getSnapshot(in context: Context, completion: @escaping (TTSWidgetEntry) -> Void) {
        let entry = TTSWidgetEntry(date: Date(), snapshot: WidgetDataManager.shared.getSnapshot())
        completion(entry)
    }

    public func getTimeline(in context: Context, completion: @escaping (Timeline<TTSWidgetEntry>) -> Void) {
        let currentSnapshot = WidgetDataManager.shared.getSnapshot()
        let currentDate = Date()
        let entry = TTSWidgetEntry(date: currentDate, snapshot: currentSnapshot)

        // Refresh every 30 minutes or when app updates
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: currentDate) ?? currentDate.addingTimeInterval(1800)
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}
