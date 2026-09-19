# Changelog

## 3.31.0 — 2026-09-19

- Add the opt-in native-import-free `/secure` entry with injected authenticated encryption, a bounded two-slot journal, identity-scoped collections and cleanup coordination.
- Keep private collection state in its own storage-free Flux instance; UI subscriber failures cannot prevent encrypted destruction.
- Preserve the existing NativeStorage API and ordinary AsyncStorage behavior.
- Validate journal recovery, identity changes and cleanup races with 55 package tests and full secure-module coverage. Verify native encrypted restoration and cleanup in Phantaze on iOS and Android.
