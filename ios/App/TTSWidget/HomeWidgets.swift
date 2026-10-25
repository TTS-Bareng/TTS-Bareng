import SwiftUI
import WidgetKit

// MARK: - 1. Streak Api Nusantara Widget
public struct StreakFlameWidget: Widget {
    public let kind: String = "TTSStreakFlameWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            StreakFlameView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://home"))
        }
        .configurationDisplayName("Streak Api Nusantara")
        .description("Pantau kobaran streak harian dan status perisai beku Anda.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct StreakFlameView: View {
    let entry: TTSWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.12, green: 0.08, blue: 0.05), Color(red: 0.07, green: 0.05, blue: 0.04)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(Color.orange.opacity(0.2))
                            .frame(width: 28, height: 28)
                        Image(systemName: "flame.fill")
                            .foregroundColor(.orange)
                            .font(.system(size: 15, weight: .bold))
                    }
                    Text("STREAK")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.orange)
                        .tracking(1)
                    Spacer()
                    if entry.snapshot.streakShields > 0 {
                        HStack(spacing: 2) {
                            Image(systemName: "shield.fill")
                                .font(.system(size: 9))
                            Text("\(entry.snapshot.streakShields)")
                                .font(.system(size: 10, weight: .bold))
                        }
                        .foregroundColor(.cyan)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.cyan.opacity(0.15))
                        .cornerRadius(8)
                    }
                }

                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(entry.snapshot.streak)")
                        .font(.system(size: family == .systemSmall ? 38 : 44, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("Hari")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.gray)
                }

                Spacer()

                if family == .systemMedium {
                    HStack {
                        Text(entry.snapshot.streakShields > 0 ? "🛡️ Terlindungi perisai beku" : "⚠️ Mainkan 1 bab sebelum 23:59")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(entry.snapshot.streakShields > 0 ? .cyan : .yellow)
                        Spacer()
                        Text("Bab \(entry.snapshot.currentLevel)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white.opacity(0.8))
                    }
                } else {
                    Text("Jaga apimu!")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.gray)
                }
            }
            .padding(14)
        }
    }
}

// MARK: - 2. Radar Daily Rush Widget
public struct DailyRushRadarWidget: Widget {
    public let kind: String = "TTSDailyRushRadarWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            DailyRushRadarView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://rush"))
        }
        .configurationDisplayName("Tantangan Harian (Daily Rush)")
        .description("Kuis kilat 60 detik kata Nusantara setiap hari.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct DailyRushRadarView: View {
    let entry: TTSWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.08, green: 0.10, blue: 0.16), Color(red: 0.04, green: 0.06, blue: 0.10)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(Color.yellow.opacity(0.2))
                            .frame(width: 28, height: 28)
                        Image(systemName: "bolt.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 15, weight: .bold))
                    }
                    Text("DAILY RUSH")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.yellow)
                        .tracking(1)
                    Spacer()
                }

                Spacer()

                if entry.snapshot.dailyRushCompleted {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                            .font(.system(size: 20))
                        Text("Tuntas Hari Ini")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.white)
                    }
                    Text("Skor: \(entry.snapshot.dailyRushScore) Poin ⭐")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.gray)
                } else {
                    Text("Tantangan Siap!")
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(.white)
                    Text("Asah otak 60 detik & raih skor harian.")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.gray)
                        .lineLimit(2)
                }

                Spacer()

                HStack {
                    Text(entry.snapshot.dailyRushCompleted ? "Reset besok 00:00" : "Ketuk untuk main →")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(entry.snapshot.dailyRushCompleted ? .gray : .yellow)
                    Spacer()
                }
            }
            .padding(14)
        }
    }
}

// MARK: - 3. Progres Peta 500 Bab Jelajah Nusantara
public struct JelajahNusantaraWidget: Widget {
    public let kind: String = "TTSJelajahNusantaraWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            JelajahNusantaraView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://level=\(entry.snapshot.currentLevel)"))
        }
        .configurationDisplayName("Jelajah 500 Bab Nusantara")
        .description("Pantau petualangan teka-teki silang Anda melintasi 12 Alam Nusantara.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

struct JelajahNusantaraView: View {
    let entry: TTSWidgetEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.06, green: 0.12, blue: 0.10), Color(red: 0.04, green: 0.07, blue: 0.06)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(Color.emerald.opacity(0.2))
                            .frame(width: 28, height: 28)
                        Image(systemName: "map.fill")
                            .foregroundColor(.emerald)
                            .font(.system(size: 14, weight: .bold))
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text("JELAJAH NUSANTARA")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(.emerald)
                        Text(entry.snapshot.currentRealmName)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    HStack(spacing: 3) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 11))
                        Text("\(entry.snapshot.stars)")
                            .font(.system(size: 12, weight: .black))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.yellow.opacity(0.15))
                    .cornerRadius(8)
                }

                Spacer()

                VStack(alignment: .leading, spacing: 4) {
                    Text("Bab \(entry.snapshot.currentLevel)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.emerald)
                    Text(entry.snapshot.currentLevelTitle)
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(.white)
                        .lineLimit(1)
                }

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.white.opacity(0.1))
                            .frame(height: 6)
                        Capsule()
                            .fill(Color.emerald)
                            .frame(width: max(12, geo.size.width * CGFloat(min(1.0, Double(entry.snapshot.currentLevel) / 500.0))), height: 6)
                    }
                }
                .frame(height: 6)

                HStack {
                    Text("\(entry.snapshot.currentLevel) / 500 Bab Tuntas")
                        .font(.system(size: 10.5, weight: .bold))
                        .foregroundColor(.gray)
                    Spacer()
                    Text("Lanjutkan Bab →")
                        .font(.system(size: 10.5, weight: .bold))
                        .foregroundColor(.emerald)
                }
            }
            .padding(14)
        }
    }
}

// MARK: - 4. Peringkat ELO & Liga Mabar Nasional
public struct EloRankWidget: Widget {
    public let kind: String = "TTSEloRankWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            EloRankView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://arena"))
        }
        .configurationDisplayName("Peringkat ELO & Liga Mabar")
        .description("Status kompetitif ELO duel kata dan peringkat nasional Anda.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct EloRankView: View {
    let entry: TTSWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.12, green: 0.08, blue: 0.16), Color(red: 0.07, green: 0.04, blue: 0.10)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(Color.purple.opacity(0.2))
                            .frame(width: 28, height: 28)
                        Image(systemName: "trophy.fill")
                            .foregroundColor(.purple)
                            .font(.system(size: 14, weight: .bold))
                    }
                    Text("LIGA ELO")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.purple)
                        .tracking(1)
                    Spacer()
                    if entry.snapshot.isVip {
                        Image(systemName: "crown.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 12))
                    }
                }

                Spacer()

                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(entry.snapshot.eloRating)")
                        .font(.system(size: family == .systemSmall ? 32 : 38, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("ELO")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.purple)
                }

                Text(entry.snapshot.eloTier)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white.opacity(0.9))

                Spacer()

                Text("Tantang pemain online →")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.purple)
            }
            .padding(14)
        }
    }
}

// MARK: - 5. Kata Hari Ini & Mini Crossword Leksikon
public struct WordOfTheDayWidget: Widget {
    public let kind: String = "TTSWordOfTheDayWidget"

    public var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TTSWidgetProvider()) { entry in
            WordOfTheDayView(entry: entry)
                .widgetURL(URL(string: "ttsbareng://home"))
        }
        .configurationDisplayName("Kata Hari Ini & KBBI")
        .description("Perkaya kosakata bahasa Indonesia baku Anda setiap hari.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

struct WordOfTheDayView: View {
    let entry: TTSWidgetEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.08, green: 0.10, blue: 0.14), Color(red: 0.04, green: 0.05, blue: 0.08)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.2))
                            .frame(width: 28, height: 28)
                        Image(systemName: "character.book.closed.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 14, weight: .bold))
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text("KATA HARI INI")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(.blue)
                        Text(entry.snapshot.wordOfTheDay?.category ?? "Standar KBBI Daring")
                            .font(.system(size: 9.5, weight: .medium))
                            .foregroundColor(.gray)
                    }
                    Spacer()
                }

                Spacer()

                // Word Crossword Tile Badges
                if let w = entry.snapshot.wordOfTheDay?.word {
                    HStack(spacing: 5) {
                        ForEach(Array(w.enumerated()), id: \.offset) { _, char in
                            Text(String(char))
                                .font(.system(size: 18, weight: .black, design: .monospaced))
                                .foregroundColor(.white)
                                .frame(width: 32, height: 32)
                                .background(Color.blue.opacity(0.3))
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
                }

                Spacer()

                HStack {
                    Text("Jelajahi Leksikon Lengkap →")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.blue)
                    Spacer()
                }
            }
            .padding(14)
        }
    }
}

// Emerald Color helper
private extension Color {
    static let emerald = Color(red: 0.10, green: 0.75, blue: 0.45)
}
