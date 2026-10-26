import SwiftUI
import WidgetKit

// MARK: - 1. Streak Api Nusantara Widget
public struct StreakFlameWidget: Widget {
    public let kind: String = "TTSStreakFlameWidget"

    public init() {}

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            StreakFlameView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://home"))
        }
        .configurationDisplayName("Streak Api Nusantara")
        .description("Pantau kobaran streak harian dan status perisai beku Anda.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

struct StreakFlameView: View {
    let entry: TTSWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        TTSWidgetShell {
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .center) {
                    ZStack {
                        Circle()
                            .fill(Color.orange.opacity(0.2))
                            .frame(width: 26, height: 26)
                        Image(systemName: "flame.fill")
                            .foregroundColor(.orange)
                            .font(.system(size: 14, weight: .bold))
                    }
                    Text("STREAK")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.orange)
                        .tracking(1)
                    Spacer(minLength: 0)
                    if entry.snapshot.streakShields > 0 {
                        HStack(spacing: 3) {
                            Image(systemName: "shield.fill")
                                .font(.system(size: 8))
                            Text("\(entry.snapshot.streakShields)")
                                .font(.system(size: 9.5, weight: .bold))
                        }
                        .foregroundColor(.cyan)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2.5)
                        .background(Color.cyan.opacity(0.15))
                        .cornerRadius(6)
                    }
                }

                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(entry.snapshot.streak)")
                        .font(.system(size: family == .systemSmall ? 36 : 42, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("Hari")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.gray)
                }

                Spacer(minLength: 0)

                if family == .systemMedium {
                    HStack {
                        Text(entry.snapshot.streakShields > 0 ? "🛡️ Terlindungi perisai beku" : "⚠️ Mainkan 1 bab sebelum 23:59")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(entry.snapshot.streakShields > 0 ? .cyan : .yellow)
                            .lineLimit(1)
                            .minimumScaleFactor(0.85)
                        Spacer(minLength: 0)
                        Text("Bab \(entry.snapshot.currentLevel)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white.opacity(0.8))
                    }
                } else {
                    Text("Jaga apimu!")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                        .minimumScaleFactor(0.85)
                }
            }
        } background: {
            LinearGradient(
                colors: [Color(red: 0.14, green: 0.09, blue: 0.05), Color(red: 0.08, green: 0.05, blue: 0.04)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - 2. Radar Daily Rush Widget
public struct DailyRushRadarWidget: Widget {
    public let kind: String = "TTSDailyRushRadarWidget"

    public init() {}

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            DailyRushRadarView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://rush"))
        }
        .configurationDisplayName("Tantangan Harian (Daily Rush)")
        .description("Kuis kilat 60 detik kata Nusantara setiap hari.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

struct DailyRushRadarView: View {
    let entry: TTSWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        TTSWidgetShell {
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .center, spacing: 6) {
                    ZStack {
                        Circle()
                            .fill(Color.yellow.opacity(0.2))
                            .frame(width: 24, height: 24)
                        Image(systemName: "bolt.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 13, weight: .bold))
                    }
                    Text("DAILY RUSH")
                        .font(.system(size: 9.5, weight: .black))
                        .foregroundColor(.yellow)
                        .tracking(0.8)
                    Spacer(minLength: 0)
                    Text("60s")
                        .font(.system(size: 8.5, weight: .bold))
                        .foregroundColor(.yellow)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(Color.yellow.opacity(0.15))
                        .cornerRadius(5)
                }

                Spacer(minLength: 0)

                if entry.snapshot.dailyRushCompleted {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                                .font(.system(size: 16))
                            Text("Tuntas!")
                                .font(.system(size: family == .systemSmall ? 15 : 18, weight: .black))
                                .foregroundColor(.white)
                                .lineLimit(1)
                        }
                        Text("Skor: \(entry.snapshot.dailyRushScore) Poin ⭐")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.white.opacity(0.75))
                            .lineLimit(1)
                    }
                } else {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(family == .systemSmall ? "Kuis Kilat" : "Tantangan Harian")
                            .font(.system(size: family == .systemSmall ? 16 : 19, weight: .black))
                            .foregroundColor(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.85)
                        Text(family == .systemSmall ? "Tantang 60 detik" : "Asah otak 60 detik & raih skor harian.")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .lineLimit(family == .systemSmall ? 1 : 2)
                            .minimumScaleFactor(0.85)
                    }
                }

                Spacer(minLength: 0)

                HStack(spacing: 3) {
                    Text(entry.snapshot.dailyRushCompleted ? "Reset besok 00:00" : "Main Sekarang")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(entry.snapshot.dailyRushCompleted ? .gray : .yellow)
                        .lineLimit(1)
                        .minimumScaleFactor(0.85)
                    if !entry.snapshot.dailyRushCompleted {
                        Image(systemName: "arrow.right")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.yellow)
                    }
                    Spacer(minLength: 0)
                }
            }
        } background: {
            LinearGradient(
                colors: [Color(red: 0.08, green: 0.10, blue: 0.18), Color(red: 0.04, green: 0.06, blue: 0.10)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - 3. Progres Peta 500 Bab Jelajah Nusantara
public struct JelajahNusantaraWidget: Widget {
    public let kind: String = "TTSJelajahNusantaraWidget"

    public init() {}

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            JelajahNusantaraView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://level=\(entry.snapshot.currentLevel)"))
        }
        .configurationDisplayName("Jelajah 500 Bab Nusantara")
        .description("Pantau petualangan teka-teki silang Anda melintasi 12 Alam Nusantara.")
        .supportedFamilies([.systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

struct JelajahNusantaraView: View {
    let entry: TTSWidgetEntry

    var body: some View {
        TTSWidgetShell {
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .center) {
                    ZStack {
                        Circle()
                            .fill(Color.emerald.opacity(0.2))
                            .frame(width: 26, height: 26)
                        Image(systemName: "map.fill")
                            .foregroundColor(.emerald)
                            .font(.system(size: 13, weight: .bold))
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text("JELAJAH NUSANTARA")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(.emerald)
                        Text(entry.snapshot.currentRealmName)
                            .font(.system(size: 9.5, weight: .medium))
                            .foregroundColor(.white.opacity(0.65))
                            .lineLimit(1)
                    }
                    Spacer(minLength: 0)
                    HStack(spacing: 3) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 10))
                        Text("\(entry.snapshot.stars)")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(Color.yellow.opacity(0.15))
                    .cornerRadius(6)
                }

                Spacer(minLength: 0)

                VStack(alignment: .leading, spacing: 3) {
                    Text("Bab \(entry.snapshot.currentLevel)")
                        .font(.system(size: 12.5, weight: .bold))
                        .foregroundColor(.emerald)
                    Text(entry.snapshot.currentLevelTitle)
                        .font(.system(size: 19, weight: .black))
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.85)
                }

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.white.opacity(0.12))
                            .frame(height: 5)
                        Capsule()
                            .fill(Color.emerald)
                            .frame(width: max(10, geo.size.width * CGFloat(min(1.0, Double(entry.snapshot.currentLevel) / 500.0))), height: 5)
                    }
                }
                .frame(height: 5)

                HStack {
                    Text("\(entry.snapshot.currentLevel) / 500 Bab Tuntas")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white.opacity(0.6))
                    Spacer(minLength: 0)
                    Text("Lanjutkan Bab →")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.emerald)
                }
            }
        } background: {
            LinearGradient(
                colors: [Color(red: 0.06, green: 0.12, blue: 0.09), Color(red: 0.04, green: 0.07, blue: 0.05)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - 4. Peringkat ELO & Liga Mabar Nasional
public struct EloRankWidget: Widget {
    public let kind: String = "TTSEloRankWidget"

    public init() {}

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            EloRankView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://arena"))
        }
        .configurationDisplayName("Peringkat ELO & Liga Mabar")
        .description("Status kompetitif ELO duel kata dan peringkat nasional Anda.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

struct EloRankView: View {
    let entry: TTSWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        TTSWidgetShell {
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .center) {
                    ZStack {
                        Circle()
                            .fill(Color.purple.opacity(0.2))
                            .frame(width: 24, height: 24)
                        Image(systemName: "trophy.fill")
                            .foregroundColor(.purple)
                            .font(.system(size: 13, weight: .bold))
                    }
                    Text("LIGA ELO")
                        .font(.system(size: 9.5, weight: .black))
                        .foregroundColor(.purple)
                        .tracking(0.8)
                    Spacer(minLength: 0)
                    if entry.snapshot.isVip {
                        Image(systemName: "crown.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 12))
                    }
                }

                Spacer(minLength: 0)

                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(entry.snapshot.eloRating)")
                        .font(.system(size: family == .systemSmall ? 32 : 38, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("ELO")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.purple)
                }

                Text(entry.snapshot.eloTier)
                    .font(.system(size: 11.5, weight: .bold))
                    .foregroundColor(.white.opacity(0.9))
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)

                Spacer(minLength: 0)

                Text("Tantang pemain online →")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.purple)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
            }
        } background: {
            LinearGradient(
                colors: [Color(red: 0.12, green: 0.08, blue: 0.16), Color(red: 0.07, green: 0.04, blue: 0.10)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - 5. Kata Hari Ini & Mini Crossword Leksikon
public struct WordOfTheDayWidget: Widget {
    public let kind: String = "TTSWordOfTheDayWidget"

    public init() {}

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            WordOfTheDayView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://home"))
        }
        .configurationDisplayName("Kata Hari Ini & KBBI")
        .description("Perkaya kosakata bahasa Indonesia baku Anda setiap hari.")
        .supportedFamilies([.systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

struct WordOfTheDayView: View {
    let entry: TTSWidgetEntry

    var body: some View {
        TTSWidgetShell {
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .center) {
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.2))
                            .frame(width: 26, height: 26)
                        Image(systemName: "character.book.closed.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 13, weight: .bold))
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text("KATA HARI INI")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(.blue)
                        Text(entry.snapshot.wordOfTheDay?.category ?? "Standar KBBI Daring")
                            .font(.system(size: 9.5, weight: .medium))
                            .foregroundColor(.white.opacity(0.65))
                            .lineLimit(1)
                    }
                    Spacer(minLength: 0)
                }

                Spacer(minLength: 0)

                // Word Crossword Tile Badges
                if let w = entry.snapshot.wordOfTheDay?.word {
                    HStack(spacing: 5) {
                        ForEach(Array(w.enumerated()), id: \.offset) { _, char in
                            Text(String(char))
                                .font(.system(size: 17, weight: .black, design: .monospaced))
                                .foregroundColor(.white)
                                .frame(width: 30, height: 30)
                                .background(Color.blue.opacity(0.25))
                                .cornerRadius(6)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 6)
                                        .stroke(Color.blue.opacity(0.6), lineWidth: 1)
                                )
                        }
                    }
                }

                if let clue = entry.snapshot.wordOfTheDay?.clue {
                    Text(clue)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.85))
                        .lineLimit(2)
                        .minimumScaleFactor(0.9)
                }

                Spacer(minLength: 0)

                HStack {
                    Text("Jelajahi Leksikon Lengkap →")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.blue)
                    Spacer(minLength: 0)
                }
            }
        } background: {
            LinearGradient(
                colors: [Color(red: 0.08, green: 0.10, blue: 0.14), Color(red: 0.04, green: 0.05, blue: 0.08)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// Emerald Color helper
private extension Color {
    static let emerald = Color(red: 0.10, green: 0.75, blue: 0.45)
}
