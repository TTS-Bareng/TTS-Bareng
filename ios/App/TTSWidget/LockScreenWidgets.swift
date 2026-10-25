import SwiftUI
import WidgetKit

// MARK: - 1. Lock Screen: Streak Flame Ring (Accessory Circular)
public struct LockScreenStreakWidget: Widget {
    public let kind: String = "TTSLockScreenStreakWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 1) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 13, weight: .bold))
                    Text("\(entry.snapshot.streak)")
                        .font(.system(size: 16, weight: .black, design: .rounded))
                }
            }
            .widgetURL(URL(string: "ttsbareng://home"))
        }
        .configurationDisplayName("Streak Api")
        .description("Hitungan streak harian di layar kunci.")
        .supportedFamilies([.accessoryCircular])
    }
}

// MARK: - 2. Lock Screen: Daily Rush Meter (Accessory Circular)
public struct LockScreenDailyRushWidget: Widget {
    public let kind: String = "TTSLockScreenDailyRushWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            ZStack {
                AccessoryWidgetBackground()
                if entry.snapshot.dailyRushCompleted {
                    VStack(spacing: 2) {
                        Image(systemName: "checkmark")
                            .font(.system(size: 14, weight: .black))
                        Text("TUNTAS")
                            .font(.system(size: 8, weight: .heavy))
                    }
                } else {
                    VStack(spacing: 2) {
                        Image(systemName: "bolt.fill")
                            .font(.system(size: 14, weight: .bold))
                        Text("RUSH")
                            .font(.system(size: 8, weight: .black))
                    }
                }
            }
            .widgetURL(URL(string: "ttsbareng://rush"))
        }
        .configurationDisplayName("Daily Rush Meter")
        .description("Status tantangan harian 60 detik di layar kunci.")
        .supportedFamilies([.accessoryCircular])
    }
}

// MARK: - 3. Lock Screen: Bab & Milestone Bintang (Accessory Rectangular)
public struct LockScreenBabProgressWidget: Widget {
    public let kind: String = "TTSLockScreenBabProgressWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 3) {
                    Image(systemName: "map.fill")
                        .font(.system(size: 9))
                    Text("BAB \(entry.snapshot.currentLevel) • NUSANTARA")
                        .font(.system(size: 9.5, weight: .black))
                }
                Text(entry.snapshot.currentLevelTitle)
                    .font(.system(size: 13, weight: .bold))
                    .lineLimit(1)
                HStack(spacing: 4) {
                    Text("⭐ \(entry.snapshot.stars) Bintang")
                        .font(.system(size: 9, weight: .medium))
                    Text("•")
                    Text("\(entry.snapshot.currentLevel)/500 Bab")
                        .font(.system(size: 9, weight: .medium))
                }
            }
            .widgetURL(URL(string: "ttsbareng://play"))
        }
        .configurationDisplayName("Bab Aktif & Bintang")
        .description("Progres bab TTS Nusantara di layar kunci.")
        .supportedFamilies([.accessoryRectangular])
    }
}

// MARK: - 4. Lock Screen: Peringkat ELO & Liga (Accessory Rectangular)
public struct LockScreenEloRankWidget: Widget {
    public let kind: String = "TTSLockScreenEloRankWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 3) {
                    Image(systemName: "trophy.fill")
                        .font(.system(size: 9))
                    Text("LIGA MABAR")
                        .font(.system(size: 9.5, weight: .black))
                    Spacer()
                    if entry.snapshot.isVip {
                        Image(systemName: "crown.fill")
                            .font(.system(size: 9))
                    }
                }
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(entry.snapshot.eloRating)")
                        .font(.system(size: 14, weight: .black, design: .rounded))
                    Text("ELO")
                        .font(.system(size: 9, weight: .bold))
                }
                Text(entry.snapshot.eloTier)
                    .font(.system(size: 9, weight: .medium))
                    .lineLimit(1)
            }
            .widgetURL(URL(string: "ttsbareng://arena"))
        }
        .configurationDisplayName("Peringkat ELO")
        .description("Rating duel kata kompetitif di layar kunci.")
        .supportedFamilies([.accessoryRectangular])
    }
}

// MARK: - 5. Lock Screen: Ticker Status Ringkas (Accessory Inline)
public struct LockScreenStatusInlineWidget: Widget {
    public let kind: String = "TTSLockScreenStatusInlineWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            ViewThatFits {
                Text("🔥 \(entry.snapshot.streak) Hari • Bab \(entry.snapshot.currentLevel) ⭐ \(entry.snapshot.stars)")
                Text("🔥 \(entry.snapshot.streak) Hari • Bab \(entry.snapshot.currentLevel)")
                Text("🔥 \(entry.snapshot.streak) Hari Streak")
            }
            .widgetURL(URL(string: "ttsbareng://home"))
        }
        .configurationDisplayName("Ticker Status Ringkas")
        .description("Satu baris status streak dan bab aktif di atas jam layar kunci.")
        .supportedFamilies([.accessoryInline])
    }
}
