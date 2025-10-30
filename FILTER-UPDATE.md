# Filter & Søgning Opdatering

## ✅ Nye Filtreringsfunktioner

### 1. **Kunde-felt Tilføjet**
Alle programmer har nu et **kunde-felt** med danske kunder:
- Vestas Wind Systems
- Terma A/S
- Grundfos
- Danfoss

### 2. **NC Programmer Liste - Avanceret Filtrering**

#### **Søgning fungerer på:**
- ✅ Varenummer (Part Number)
- ✅ Kunde (Customer)
- ✅ Maskine (Machine)
- ✅ Beskrivelse (Description)
- ✅ Program navn
- ✅ Operation

#### **Filter muligheder:**
1. **Status Filter** (knapper):
   - Alle
   - Udgivet (Released)
   - Til Gennemgang (In Review)
   - Kladde (Draft)

2. **Maskine Filter** (dropdown):
   - Alle Maskiner
   - HAAS VF-4
   - DMG DMU 50
   - MAZAK QT-250
   - LIEBHERR LC 82

3. **Kunde Filter** (dropdown):
   - Alle Kunder
   - Vestas Wind Systems
   - Terma A/S
   - Grundfos
   - Danfoss

#### **Ekstra Features:**
- 📊 Viser antal filtrerede resultater: "Viser X af Y programmer"
- 🔄 "Ryd Filtre" knap for at nulstille alle filtre
- 💡 Tom tilstand viser "Ingen programmer fundet" med knap til at rydde filtre

### 3. **Maskiner View - Samme Filtrering**

Når du vælger en maskine:
- ✅ Søgning på varenummer, kunde, operation, beskrivelse
- ✅ Status filter (Alle, Udgivet, Til Gennemgang, Kladde)
- ✅ Kunde filter (viser kun kunder for den valgte maskine)
- ✅ Resultat-tæller

### 4. **Program Visning Opdateret**

Program kort viser nu **5 felter**:
1. **Varenummer** (Part Number + Revision)
2. **Kunde** ⭐ NYT
3. **Maskine**
4. **Operation**
5. **Materiale**

### 5. **Program Detaljer**

Sidebar viser nu også:
- **Kunde** (øverst)
- Maskine
- Operation
- Materiale
- Arbejdsordre
- Forfatter
- Sidst Ændret

## 🎯 Sådan Bruger Du Det

### **I NC Programmer Listen:**
1. Skriv i søgefeltet: varenummer, kunde navn, maskine, eller beskrivelse
2. Vælg status filter-knapper
3. Vælg maskine fra dropdown
4. Vælg kunde fra dropdown
5. Klik "Ryd Filtre" for at nulstille alt

### **I Maskiner Visningen:**
1. Vælg en maskine fra kortene
2. Søg i maskinens programmer
3. Filtrer efter status
4. Filtrer efter kunde (kun kunder med programmer på den maskine)

## 📋 Eksempel Filtrering

**Find alle Vestas programmer på HAAS VF-4:**
1. Gå til "NC Programmer"
2. Vælg "HAAS VF-4" i maskine dropdown
3. Vælg "Vestas Wind Systems" i kunde dropdown
4. Resultat: 2 programmer (O1001 og O1002)

**Find alle udgivne programmer til Grundfos:**
1. Gå til "NC Programmer"  
2. Klik "Udgivet" status knap
3. Vælg "Grundfos" i kunde dropdown
4. Resultat: Filtrerede programmer

## 🔍 Søgning er Smart

Søgefeltet leder i **alle relevante felter samtidigt**:
- Du kan søge "Vestas" → finder alle Vestas programmer
- Du kan søge "P-2847" → finder programmer med det varenummer
- Du kan søge "OP10" → finder alle OP10 operationer
- Du kan søge "Housing" → finder programmer med "housing" i beskrivelsen

## ✨ UI Forbedringer

- ✅ Pæne dropdown menuer til maskine og kunde
- ✅ Klar visuel separering mellem filter-grupper
- ✅ Status filter med farvekodede knapper
- ✅ Resultat-tæller opdateres live
- ✅ "Ryd Filtre" knap kun synlig når filtre er aktive
- ✅ Alle labels på dansk

## 📱 Refresh Browseren

Refresh din browser for at se alle de nye funktioner! 🎉

