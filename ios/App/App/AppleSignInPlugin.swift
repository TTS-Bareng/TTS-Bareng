import Foundation
import Capacitor
import AuthenticationServices

@objc(AppleSignInPlugin)
public class AppleSignInPlugin: CAPPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private var pendingCall: CAPPluginCall?

    @objc func signIn(_ call: CAPPluginCall) {
        self.pendingCall = call
        DispatchQueue.main.async {
            let appleIDProvider = ASAuthorizationAppleIDProvider()
            let request = appleIDProvider.createRequest()
            request.requestedScopes = [.fullName, .email]

            let authorizationController = ASAuthorizationController(authorizationRequests: [request])
            authorizationController.delegate = self
            authorizationController.presentationContextProvider = self
            authorizationController.performRequests()
        }
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        if let window = self.bridge?.viewController?.view.window {
            return window
        }
        if let keyWindow = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .flatMap({ $0.windows })
            .first(where: { $0.isKeyWindow }) {
            return keyWindow
        }
        return ASPresentationAnchor()
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            pendingCall?.reject("Kredensial Apple tidak valid")
            pendingCall = nil
            return
        }

        var identityTokenString: String?
        if let tokenData = appleIDCredential.identityToken {
            identityTokenString = String(data: tokenData, encoding: .utf8)
        }

        var authCodeString: String?
        if let codeData = appleIDCredential.authorizationCode {
            authCodeString = String(data: codeData, encoding: .utf8)
        }

        guard let identityToken = identityTokenString, !identityToken.isEmpty else {
            pendingCall?.reject("Gagal mendapatkan identityToken dari Apple")
            pendingCall = nil
            return
        }

        var res: [String: Any] = [
            "identityToken": identityToken,
            "user": appleIDCredential.user
        ]

        if let authCode = authCodeString {
            res["authorizationCode"] = authCode
        }

        if let email = appleIDCredential.email {
            res["email"] = email
        }

        if let fullName = appleIDCredential.fullName {
            if let given = fullName.givenName { res["givenName"] = given }
            if let family = fullName.familyName { res["familyName"] = family }
        }

        pendingCall?.resolve(res)
        pendingCall = nil
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        let nsError = error as NSError
        // ASAuthorizationError.canceled is code 1001
        if nsError.code == 1001 {
            pendingCall?.reject("Dibatalkan oleh pengguna", "CANCELED")
        } else {
            pendingCall?.reject(error.localizedDescription)
        }
        pendingCall = nil
    }
}
