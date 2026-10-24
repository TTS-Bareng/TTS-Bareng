import Foundation
import Capacitor
import GameKit

@objc(GameCenterPlugin)
public class GameCenterPlugin: CAPPlugin, GKGameCenterControllerDelegate {

    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true, completion: nil)
    }

    @objc func authenticate(_ call: CAPPluginCall) {
        let localPlayer = GKLocalPlayer.local
        localPlayer.authenticateHandler = { [weak self] (viewController, error) in
            if let vc = viewController {
                DispatchQueue.main.async {
                    self?.bridge?.viewController?.present(vc, animated: true, completion: nil)
                }
            } else if localPlayer.isAuthenticated {
                call.resolve([
                    "isAuthenticated": true,
                    "playerID": localPlayer.gamePlayerID,
                    "displayName": localPlayer.displayName,
                    "alias": localPlayer.alias
                ])
            } else {
                call.resolve([
                    "isAuthenticated": false,
                    "error": error?.localizedDescription ?? "Not authenticated"
                ])
            }
        }
    }

    @objc func submitScore(_ call: CAPPluginCall) {
        guard let leaderboardID = call.getString("leaderboardID"),
              let score = call.getInt("score") else {
            call.reject("Missing leaderboardID or score")
            return
        }

        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Local player is not authenticated")
            return
        }

        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local,
                                  leaderboardIDs: [leaderboardID]) { error in
            if let error = error {
                call.reject("Failed to submit score: \(error.localizedDescription)")
            } else {
                call.resolve(["success": true])
            }
        }
    }

    @objc func unlockAchievement(_ call: CAPPluginCall) {
        guard let achievementID = call.getString("achievementID") else {
            call.reject("Missing achievementID")
            return
        }
        let percentComplete = call.getDouble("percentComplete") ?? 100.0

        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Local player is not authenticated")
            return
        }

        let achievement = GKAchievement(identifier: achievementID)
        achievement.percentComplete = percentComplete
        achievement.showsCompletionBanner = true

        GKAchievement.report([achievement]) { error in
            if let error = error {
                call.reject("Failed to report achievement: \(error.localizedDescription)")
            } else {
                call.resolve(["success": true])
            }
        }
    }

    @objc func showGameCenter(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Local player is not authenticated")
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let state: GKGameCenterViewControllerState
            let stateStr = call.getString("state") ?? "default"
            switch stateStr {
            case "leaderboards":
                state = .leaderboards
            case "achievements":
                state = .achievements
            default:
                state = .default
            }

            let gcVC = GKGameCenterViewController(state: state)
            gcVC.gameCenterDelegate = self
            self.bridge?.viewController?.present(gcVC, animated: true) {
                call.resolve(["success": true])
            }
        }
    }
}
