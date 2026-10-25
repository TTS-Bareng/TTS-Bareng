import WidgetKit
import SwiftUI

struct TTSHomeWidgets: WidgetBundle {
    var body: some Widget {
        StreakFlameWidget()
        DailyRushRadarWidget()
        JelajahNusantaraWidget()
        EloRankWidget()
        WordOfTheDayWidget()
    }
}

struct TTSLockScreenWidgets: WidgetBundle {
    var body: some Widget {
        LockScreenStreakWidget()
        LockScreenDailyRushWidget()
        LockScreenBabProgressWidget()
        LockScreenEloRankWidget()
        LockScreenStatusInlineWidget()
    }
}

#if canImport(AppIntents) && compiler(>=6.0)
@available(iOS 18.0, *)
struct TTSControlWidgets: WidgetBundle {
    var body: some Widget {
        DailyRushControlWidget()
        ScanQrControlWidget()
        ContinuePlayControlWidget()
    }
}
#endif

@main
struct TTSWidgetBundle: WidgetBundle {
    var body: some Widget {
        TTSHomeWidgets().body
        TTSLockScreenWidgets().body
        #if canImport(AppIntents) && compiler(>=6.0)
        if #available(iOS 18.0, *) {
            TTSControlWidgets().body
        }
        #endif
    }
}
