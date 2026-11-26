## Projekt-Metadaten (für KI-Kontext)
- **GitHub Repo:** https://github.com/philippdejaneiro/jerusalem-chronologie-vergleich/
- **Live-App (GitHub Pages):** https://philippdejaneiro.github.io/jerusalem-chronologie-vergleich/
- **Datenquellen:** `./data/quellen.json`, `./data/zeitstrahl.json`

# Daten-Schema & Regeln

## Allgemeine Regeln
- Alle Jahreszahlen vor unserer Zeitrechnung werden einheitlich mit `-607` bzw. `-587` (in JSON) oder `607 v. u. Z.` (in Markdown) angegeben.
- Jede Aussage muss mit einer `quellen_id` aus `data/quellen.json` verknüpft sein.
- Neutraler, sachlicher und vergleichender Tonfall.

## Format für `data/quellen.json`
```json
[
  {
    "id": "jw-w11-1001",
    "kategorie": "jw.org",
    "titel": "Wann wurde das alte Jerusalem zerstört? (Teil 1)",
    "publikation": "Der Wachtturm, 1. Oktober 2011",
    "url": "https://jw.org...",
    "kernaussage": "Begründung für das Jahr 607 v. u. Z. anhand biblischer Chronologie."
  }
]
```