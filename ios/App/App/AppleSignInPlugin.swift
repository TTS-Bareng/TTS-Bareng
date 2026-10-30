import Foundation
import Capacitor
import AuthenticationServices

@objc(AppleSignInPlugin)
public class AppleSignInPlugin: CAPPlugin, CAPBridgedPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "AppleSignInPlugin"
    public let jsName = "AppleSignInPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCredentialState", returnType: CAPPluginReturnPromise)
    ]
    private var pendingCall: CAPPluginCall?

    public override func load() {
        NotificationCenter.default.addObserver(self, selector: #selector(credentialsRevoked),
            name: ASAuthorizationAppleIDProvider.credentialRevokedNotification, object: nil)
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    @objc private func credentialsRevoked() {
        notifyListeners("credentialsRevoked", data: [:])
    }

    @objc public func getCredentialState(_ call: CAPPluginCall) {
        guard let user = call.getString("user"), !user.isEmpty else {
            call.reject("Pengenal Apple tidak tersedia")
            return
        }
        ASAuthorizationAppleIDProvider().getCredentialState(forUserID: user) { state, error in
            if error != nil {
                call.reject("Status kredensial Apple belum dapat diperiksa")
                return
            }
            let status: String
            switch state {
            case .authorized: status = "authorized"
            case .revoked: status = "revoked"
            case .notFound: status = "notFound"
            case .transferred: status = "transferred"
            @unknown default: status = "unknown"
            }
            call.resolve(["state": status])
        }
    }

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
