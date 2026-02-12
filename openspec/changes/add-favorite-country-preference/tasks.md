## 1. Preference Storage
- [x] 1.1 Add favorite-country storage constants and helpers (`get/set/validate`)
- [x] 1.2 Default invalid/missing value to `NED`
- [x] 1.3 Add unit tests for storage and fallback behavior

## 2. Data Binding
- [x] 2.1 Replace hardcoded `NED` selection in medal derivation with selected NOC
- [x] 2.2 Add country-aware event fetch/filter path
- [x] 2.3 Implement no-events empty state (no NL fallback)

## 3. UI
- [x] 3.1 Add country selector component (available medal countries + guaranteed NED option)
- [x] 3.2 Make header/overview labels dynamic by selected country
- [x] 3.3 Update notification copy to selected country context

## 4. Tests
- [x] 4.1 Page integration: default `NED` on first load
- [x] 4.2 Page integration: selected country persists after reload
- [x] 4.3 Medal overview test: chosen country counts render correctly
- [x] 4.4 Events test: no-data for chosen country shows empty state
- [ ] 4.5 Notifications test: payload references selected country

## 5. Docs/Spec Hygiene
- [x] 5.1 Add change artifacts under `openspec/changes/add-favorite-country-preference/`
- [x] 5.2 Include explicit assumption notes and acceptance criteria in spec
