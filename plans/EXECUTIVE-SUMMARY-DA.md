# Moderne NC Programhåndtering — Executive Summary

> **Dansk oversigt** | For fuld teknisk plan, se [README.md](./README.md)

---

## Vision

Udvikl et moderne, robust og brugervenligt NC-programhåndteringssystem med fuld funktionsparitet og forbedringer i brugervenlighed, ydeevne, samarbejde og integrationer.
Systemet skal have en indbygget CAD/STEP/DXF-viewer til hurtig visuel validering – uden behov for at åbne eksterne programmer.
Hele løsningen skal kunne køre **helt lokalt (on-prem)** uden afhængighed af proprietær software. Brug **open source** og **åbne protokoller** så vidt muligt.

---

## Målgrupper

* **CNC-programmører**: hurtig håndtering, versionering og validering af NC-programmer.
* **Maskinoperatører**: sikker adgang til godkendte og maskinklare programmer.
* **Produktions- og procesteknikere**: styr på revisioner, opsætningsark og værktøjsdata.
* **Kvalitets- og produktionsledere**: revisionsspor, godkendelser og compliance-rapportering.

---

## Overordnede mål

* **Fuld paritet**: alle eksisterende workflows dækkes – men gjort hurtigere og mere intuitive.
* **Moderne brugeroplevelse**: hurtig søgning, bulk-operationer, tastaturoptimeret og responsivt UI.
* **Integreret visning**: STEP- og DXF-viewer direkte i appen.
* **Klar til samarbejde**: roller, godkendelser, kommentarer, notifikationer.
* **Sikkerhed og sporbarhed**: digitale signaturer, revisionshistorik, adgangskontrol.
* **Uafhængig af leverandører**: ingen krav om eksterne DNC-systemer eller CAD-licenser.

---

## Principper (Standalone + Open Source First)

* **Ingen proprietære runtime-afhængigheder** – kompatibel med eksisterende maskinmiljøer.
* **Åbne protokoller**: RS-232, FTP/SFTP/SMB, MTConnect og OPC UA hvor relevant.
* **Open Source-komponenter**: til visning, login, lagring, søgning og beskeder.
* **Selv-hostet**: fuld drift lokalt eller i privat cloud – med backup og IaC.
* **Migreringsvenlig**: kan importere data fra ældre NC-systemer uden krav om deres software.

---

## Udrulning og netværkstopologi (On-Prem)

* **Lokal drift**: alt kører på eget netværk – ingen internetafhængighed.
* **Server**: API, database, søgning og lagring kører på lokale servere/VM'er.
* **DNC-forbindelse**: agent forbinder til CNC'er via RS-232 eller Ethernet (FTP/SFTP/SMB).
* **Lagring**: NC-filer og CAD-data gemmes på lokale SMB-drev (NAS/Windows-server).
* **Brugerenheder**: tablets/PC'er på sikret Wi-Fi/VLAN, evt. kiosktilstand.
* **Login (AD/SSO)**: integreres med lokal AD/Entra; virker offline.
* **Certifikater/DNS**: intern PKI og interne DNS-navne.
* **Backup**: lokal backup til NAS/tape; eksport til offline nødpakker.
* **Ingen eksterne kald**: alle afhængigheder hentes fra lokale mirrors.

---

## Centrale funktioner

### 1) NC Programarkiv

* Håndtering af programmer, underprogrammer og makroer.
* Metadata: operation, maskine, materiale, jobnr., partnr., revision, forfatter, status.
* Versionsstyring med historik, ændringsdiff og revisionslog.
* Søgning og filtrering med metadata og fuldtekst.
* Massehandlinger og sikker sletning/arkivering.
* Tjek ind/ud med konflikthåndtering.
* Godkendelsesflow med e-signaturer og begrundelser.
* Import/eksport og automatisk overvågning af ændringer på SMB-drev.

### 2) Maskinforbindelse og DNC

* Indbygget DNC-agent til RS-232 og Ethernet.
* Logning af hvem/hvad/hvornår ved overførsel.
* Kø- og planlægningsfunktion pr. job/hold.
* REST/gRPC API'er til automatisering.
* Alle overførsler foregår lokalt.

### 3) NC-værktøjer

* NC-diff med syntaksfarver og værktøjsændringer.
* Grundlæggende linting for Fanuc, Siemens, Heidenhain mv.
* Automatisk metadataudtræk fra programkommentarer.
* Skabeloner for standardheader, sikkerhedsblokke og målecyklusser.

### 4) Integrerede Viewere

* **STEP**: rotering, sektioner, isolering, måling.
* **DXF**: lagstyring, dimensioner, print, eksport som PDF.
* **Kobling** mellem program og CAD efter part/rev.
* **Markeringer og kommentarer** gemmes pr. revision.
* **Teknisk motor**: Three.js + OpenCascade.
* **Ydelse**: GPU-acceleration og progressiv indlæsning.

### 5) Dokumentation og bilag

* Opsætningsark med billeder, video, tjeklister og sign-off.
* Værktøjslister med vendor, levetid, offsets.
* Arbejdsinstruktioner med trin-for-trin og medier.
* Automatisk PDF-generering ved revision.

### 6) Samarbejde og notifikationer

* Kommentarer, @mentions og opgave-tildelinger.
* Notifikationer via e-mail og mobil push.
* Review-opgaver og statussporing.

### 7) Adgang og compliance

* RBAC-roller (operatør, programmør, ingeniør, QA, leder, admin).
* Revisionsspor med før/efter-visning.
* Politikker for godkendelser, signaturer og opbevaring.

### 8) Integrationer

* PLM/ERP: synkronisering af part master og ordrer.
* CAD/PDM: hent STEP/DXF fra Vault/PDM.
* Fusion 360-integration (valgfrit, via APS).
* AD/Entra/Okta for login og brugerprovisionering.
* Backup til S3/NAS; offline eksport.

### 9) Rapportering

* Udgivelser, ændringshotspots, maskinhistorik.
* Kvalitetsafvigelser og mønstre.
* Eksportér rapporter som CSV/PDF.

---

## Projektstruktur (efter Clause 4.5-regler)

**Frontend**: React 18 + Vite + Tailwind + Framer Motion  
**Backend**: Express + TypeScript + Zod + Prisma  
**Mobil**: React Native (offline-first)

Strukturen følger komponentbaseret arkitektur, zod-validering og automatiseret dokumentation som beskrevet i Cursor-regelsættet.

---

## Ikke-funktionelle krav

* **Ydelse**: <200ms responstid; >100.000 programmer.
* **Pålidelighed**: HA, backup, revisionslog.
* **Sikkerhed**: RBAC, kryptering, signaturer.
* **Skalerbarhed**: horisontal for API og køsystem.
* **Offline**: cache og sync ved netværksproblemer.
* **Licenser**: kun åbne licenser (MIT/Apache/BSD).
* **Deployment**: Docker/Kubernetes; air-gapped installation.
* **Filovervågning**: detektering af SMB-ændringer og konflikthåndtering.

---

## Teknologistak

### Frontend
* React 18 + TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Framer Motion
* Zustand/TanStack Query
* React Hook Form + Zod
* Three.js + React Three Fiber

### Backend
* Express + TypeScript
* Zod
* PostgreSQL + Prisma
* OpenAPI/Swagger
* Redis (cache/pub-sub)
* MinIO (lagring)
* RabbitMQ/BullMQ (jobkøer)
* Keycloak/Ory (auth)

---

## Automatisering og dokumentation

**Automatiserede opgaver via Cursor Agent 4.5:**

* Kørsel af `npm run dev` ved analyse
* Performance- og build-log analyse
* Automatisk dokumentationsgenerering fra kodekommentarer
* Komponent- og API-generatorer baseret på templates
* Testkørsel og rapportering
* Automatisk README og docs-opdatering

---

## Udrulningsmatrix

| Komponent | Kræver internet | Kan køre offline | Bemærkning |
|-----------|----------------|------------------|------------|
| Webapp | Nej | Ja | Browserbaseret PWA |
| Backend API | Nej | Ja | Kører lokalt |
| DNC Agent | Nej | Ja | LAN-forbindelser |
| PostgreSQL | Nej | Ja | Lokal server |
| Redis | Nej | Ja | Lokal server |
| Meilisearch | Nej | Ja | Lokal server |
| MinIO | Nej | Ja | Lokal/NAS lagring |
| Fusion 360 | Ja | Nej | Valgfri plugin |
| PLM/ERP Sync | Ja | Nej | Valgfri konnektorer |
| Cloud Backup | Ja | Nej | Alternativt NAS |
| Dokumentationsgenerator | Nej | Ja | Lokalt build |

**Nøglepunkter:**
* ✅ **Kernesystemet kører 100% offline** på lokalt netværk
* ✅ Alle kritiske operationer (programhåndtering, DNC, visning) virker uden internet
* ⚠️ Valgfrie funktioner (Fusion 360, cloud backup) kræver internet
* 📦 Opdateringer kan deployes via offline signerede pakker

---

## Roadmap (Forslag)

### Fase 0 — Fundament & Setup (2-3 uger)
* Projektstruktur efter Clause 4.5-regler
* Installation af dependencies (Framer Motion, Zod, Express)
* ESLint, Prettier, TypeScript strict mode
* Komponent- og service-templates
* Automatisk dokumentationsgenerering

### Fase 1 — Kernearkiv (6-8 uger)
* Fillager, metadata, søgning, versioner
* Express API med Zod-validering
* PostgreSQL database med Prisma
* React-komponenter efter templates
* Grundlæggende godkendelser

### Fase 2 — Mobil Opsætningsapp (4-6 uger)
* React Native templates
* Kamera og mediehåndtering
* Offline-first sync med konfliktløsning
* Kiosk-tilstand til produktionsgulv

### Fase 3 — NC-Værktøjer & Viewere (6-8 uger)
* NC diff/lint med syntaksbevidsthed
* STEP/DXF viewer (Three.js + OpenCascade)
* Framer Motion-animationer til viewer
* Koblinger mellem programmer og CAD

### Fase 4 — DNC & Operationer (4-6 uger)
* Maskinforbindelse send/modtag (Go service)
* Køsystem (BullMQ/RabbitMQ)
* Overførselslog og verifikation
* Operator-venligt stationsinterface

### Fase 5 — Integrationer & Rapportering (4-6 uger)
* PLM/ERP-konnektorer med Zod-validering
* Dashboards med animerede grafer
* Audit-rapporter og eksport

### Fase 6 — Hærdning & Lancering (4-6 uger)
* Performance-optimering
* Sikkerhedshærdning
* HA/DR setup
* Compliance (ISO/AS9100)
* Internationalisering (dansk + engelsk)

**Samlet estimat**: 24-40 uger (6-10 måneder)

---

## Åbne spørgsmål

1. Hvilke styringer (Fanuc, Siemens, Heidenhain osv.) skal understøttes først?
2. Hvordan håndteres DNC i dag (tredjepart/manualt)?
3. Hvilke ERP/PLM-systemer skal integreres?
4. Hvilke godkendelseskrav gælder (ISO/AS9100)?
5. Har operatører brug for kiosk- eller touch-UI?
6. Skal andre 3D-formater (IGES, Parasolid, JT) med fra start?
7. Forventet datamængde og vækst?
8. Detaljer om Fusion 360 Hub, projektnavne og OAuth-adgang?

---

## Migreringsplan

Når eksisterende NC-systemer kortlægges, laves en 1:1-funktionsoversigt med forslag til forbedringer og prioritet.

---

> **Dokumenttype**: Executive Summary (Dansk)  
> **Relaterede dokumenter**: [Technical Plan (English)](./README.md) | [Ruleset](./.cursor/rules/4.5-rules.md)  
> **Sidst opdateret**: 2025-10-30  
> **Version**: 2.0

