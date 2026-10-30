# Apple account deletion implementation plan

**Goal:** Make native iOS account deletion revoke Sign in with Apple authorization before deleting the user's server data, without putting Apple signing secrets in the app.

**Approach:** Reauthenticate with the existing native Apple plugin only when deleting an Apple-linked account. Send its single-use authorization code to an authenticated Supabase Edge Function. Exchange the code with Apple, verify the returned identity against the caller's linked Apple identity, revoke the refresh token, then invoke the existing caller-scoped deletion RPC. Tokens remain in memory only. This avoids a new long-lived token database. Existing guest and non-Apple deletion behavior remains available. A missing/cancelled Apple authorization must never be reported as successful deletion.

**Constraints:** Reuse current checkout on a dedicated branch; preserve other untracked screenshot work. Use existing Apple Sign in key `34M2HC8KG6` only in backend secrets. No private key, bearer token, password, or Apple token in Git, client bundles, logs, or test fixtures. Do not submit to Apple.

## Tasks and verification

- [x] Add failing server tests: unauthorized caller, non-Apple deletion, missing Apple code, token exchange failure, wrong Apple identity/signature, revocation failure, and successful revoke-before-delete ordering. Use generated test keys and fake upstream responses, never real Apple accounts.
- [x] Implement a dependency-free Web Crypto server handler and thin Deno entrypoint. Validate the Supabase session using Auth, never trust a user ID sent by the client. Compare Apple's verified subject with the linked identity returned by Auth. Bound external request timeouts; suppress upstream credential-bearing errors.
- [x] Route native Apple deletion through reauthentication and the Edge Function. Test client sequencing, wrong/missing identity, cancellation, and backend errors before local cleanup. Keep guest behavior covered.
- [x] Add native credential-state querying and revoked notifications; sign out the matching session on revoked/notFound state at startup/resume. Avoid racing an account deletion already in progress.
- [x] Configure backend secrets using the existing key, deploy the function, and run safe live checks. Live unauthorized access rejected; missing Apple code verified in unit tests without impersonating a real Apple user. Non-Apple live deletion used only a newly created disposable test account.
- [x] Run `npm run build`, targeted tests, diff review, and iOS CI build. Attach processed build only after verification; update reviewer notes and retain the draft unsubmitted.
- [x] Native Apple round-trip on the new TestFlight build requires a real device and the owner's Apple authorization. Owner confirmed all four steps passed on build 52; recorded separately from automated tests.

## References

- Apple TN3194: https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple
- Apple token revocation: https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens
- Supabase Apple authentication: https://supabase.com/docs/guides/auth/social-sign-in/auth-apple

## Progress

- Existing key confirmed in Apple Developer: TTS Bareng Sign in Key, Sign In with Apple capability. Supabase CLI account cannot manage this project's secrets (403); dashboard sign-in requested while implementation continues.
- Dashboard login completed by owner. Owner explicitly authorized storing the existing Apple key in backend secrets and deploying the function. Three secrets saved without exposing their values.
- Server/client implementation, 15 tests, build, independent review, and safe live function checks passed. Function version 1 active with JWT verification. Real Apple device test remains a separate release gate.
- Commit `dc8167b`, tag `v1.0.63`, CI run #52 (`41010186009`) succeeded, including native archive/signing/upload. Apple processed build `52` as VALID and it is selected on version 1.0. Internal TestFlight group already has access to all builds. App version removed from the draft queue until the new device test is confirmed; five purchase/subscription items preserved.
- Owner confirmed the build 52 device test passed. Add for Review succeeded again; final UI and API verification showed six READY_FOR_REVIEW items, build 52 VALID, Indonesia only, reviewer credentials present, no standalone screenshot review items, Submit for Review enabled, and submittedDate null. No submission performed. Final `npm run build` passed.
