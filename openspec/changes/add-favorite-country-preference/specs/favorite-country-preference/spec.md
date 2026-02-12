## ADDED Requirements

### Requirement: Favorite country preference SHALL persist locally
De app SHALL lezen/schrijven naar `localStorage` key `favorite_country_noc_v1`.
Bij ontbrekende of ongeldige waarde SHALL default `NED` gebruikt worden.

#### Scenario: First visit
- **WHEN** user de app voor het eerst opent
- **THEN** actieve favoriete landcode is `NED`

#### Scenario: Reload persistence
- **WHEN** user kiest `USA` en herlaadt
- **THEN** actieve favoriete landcode blijft `USA`

### Requirement: User SHALL be able to change favorite country from UI
Er SHALL een selector zijn met beschikbare landen (uit medal data, met `NED` altijd aanwezig).

#### Scenario: Change country
- **WHEN** user verandert favoriete land van `NED` naar `ITA`
- **THEN** UI en afgeleide data schakelen zonder page reload naar `ITA`

### Requirement: Medal overview SHALL bind to selected favorite country
Medaillekaart en relevante labels SHALL de gekozen NOC gebruiken i.p.v. hardcoded `NED`.

#### Scenario: Selected country exists in medal table
- **WHEN** favoriete land is `NOR` en `NOR` bestaat in data
- **THEN** geselecteerde-medaille view-model toont `NOR` waarden

#### Scenario: Selected country missing
- **WHEN** favoriete land niet in data voorkomt
- **THEN** view-model toont 0/0/0/0 voor die NOC met correcte naam/flag fallback

### Requirement: Event section SHALL respect selected country and show empty state when unavailable
Eventquery SHALL filteren op gekozen NOC.
Geen NL-fallback voor gekozen NOC zonder events.

#### Scenario: No events for selected country
- **WHEN** eventbron geen items voor gekozen NOC levert
- **THEN** eventlijst toont lege state (`Geen evenementen gevonden voor dit land.`) en geen Nederlandse fallback-items

### Requirement: Notifications SHALL use selected country context
Medal/live notificaties SHALL landnaam/NOC van gekozen voorkeur gebruiken.

#### Scenario: Medal increase for selected country
- **WHEN** gekozen land medaille toename heeft
- **THEN** notificatie noemt gekozen land i.p.v. `Team NL`

## Assumptions
- Geen backend-opslag; voorkeur wordt alleen client-side opgeslagen.
- NOC-waarden worden case-insensitive gelezen en als uppercase gevalideerd.
- `NED` blijft default bij ontbrekende/ongeldige voorkeur.

## Acceptance Criteria
- Favoriete landkeuze blijft behouden na refresh.
- Medaille-overzicht, medaillespiegel-highlight en notificatiekoppen volgen gekozen land.
- Bij landen zonder eventdata toont de app een expliciete lege state in de eventlijst.
