## Why
- App is nu hardcoded op Nederland (`NED`), waardoor personalisatie ontbreekt.
- Gebruikers willen hun eigen land kunnen volgen met persistente voorkeur.

## What Changes
- Voeg landselector toe in UI (NOC-keuze).
- Sla voorkeur op in `localStorage`.
- Gebruik voorkeur app-breed in data-selectie en copy.
- Default blijft Nederland als geen voorkeur bestaat.
- Als events niet beschikbaar zijn voor gekozen land: toon lege state, geen NL-fallback.

## Capabilities
### New Capabilities
- `favorite-country-preference`

## Impact
- Affected code:
- `app/page.tsx`
- `components/Header.tsx`
- `components/MedalOverview/MedalOverview.tsx`
- `components/MedalTally/MedalTally.tsx`
- `lib/olympics/olympics.ts`
- `lib/types.ts`
- `lib/preferences/favoriteCountry.ts`
- New key: `favorite_country_noc_v1`
