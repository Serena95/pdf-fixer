

# Gestionale Cilento Kibs - Piano di Implementazione

## Panoramica
Ricostruzione in React dell'app gestionale per preventivi "Cilento Kibs", con risoluzione dei problemi PDF (logo mancante e contenuto tagliato) e database persistente tramite Lovable Cloud.

---

## 1. Struttura App e Navigazione
- **3 tab di navigazione** nella barra superiore: 📝 COMPILA, 📂 ARCHIVIO, 👥 CLIENTI
- Stessi colori aziendali (blu #004a99, giallo #ffcc00)
- Layout identico all'originale

## 2. Pagina COMPILA (Creazione Preventivo)
- Logo aziendale in alto a destra
- Selezione cliente dal dropdown (caricamento automatico dati)
- Campi: Spett.le, Indirizzo, P.IVA/C.F., Email
- Numero documento auto-generato e data
- Selezione Unit (CK-01 a CK-05) con modelli dinamici per ciascuna:
  - CK-01 FINANZA: Pagamento Fisso, Fee fissa + % su deliberato
  - CK-02 DIGITALE: Solo Fisso, SAL, Canone Mensile
  - CK-03 CONSULENZA: Solo Fisso, Pacchetto Ore, Retainer
  - CK-04 MARKETING: Canone, Campagna Una Tantum, Mix
  - CK-05 PRODOTTI: Catalogo, Convenzione Ricorrente
- Calcolo automatico totale con toggle IVA 22%
- Pulsanti: Scarica PDF, Invia Email, Reset

## 3. Generazione PDF (Fix Principale)
- Utilizzo di **jsPDF** al posto di html2pdf.js per controllo preciso del layout
- Logo incorporato come immagine base64 nel PDF (risolve il problema del logo mancante)
- Layout A4 con margini corretti per evitare il taglio del contenuto
- Header con dati aziendali, contatti e logo
- Tabella servizi con colonne: Indice, Servizio, Descrizione, Quantità, Prezzo
- Riepilogo totali (Imponibile, IVA se applicata, Totale Finale)
- Footer con data, ragione sociale e IBAN

## 4. Pagina ARCHIVIO
- Lista preventivi salvati con numero, cliente e totale
- Possibilità di eliminare preventivi

## 5. Pagina CLIENTI
- Anagrafica clienti salvati automaticamente alla creazione preventivi
- Possibilità di eliminare clienti

## 6. Database (Lovable Cloud)
- Tabella **clienti**: nome, indirizzo, P.IVA, email
- Tabella **preventivi**: numero, cliente, totale, data, dettagli
- Dati persistenti e accessibili da qualsiasi dispositivo

