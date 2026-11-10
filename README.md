# Kaffee mit Freunden

Gemeinsame Web-App für Freunde: Bohnenpackungen mit Foto, Preis und Kaufort festhalten, jeden Kaffee bewerten, auf Wunsch mit Rezept. Mehrere Personen können dieselbe Packung bewerten, jede Bewertung zeigt, von wem sie ist.

- Anmeldung per E-Mail-Code (Supabase Auth), kein Passwort.
- Daten in Supabase (Postgres), Fotos im Storage-Bucket `bean-photos`.
- Alle angemeldeten Personen sehen alles. Ändern und löschen kann jede Person nur ihre eigenen Einträge. Eine Packung lässt sich nur löschen, solange sie niemand anderes bewertet hat.
- Mahlgrad-Marken und Zubereitungsarten sind je Person einstellbar.
- Als App auf den Homescreen: im Browser „Zum Startbildschirm hinzufügen“.

## Aufbau

Statische Seite ohne Build-Schritt, läuft so auf Vercel:

| Datei | Inhalt |
| --- | --- |
| `index.html` | Gerüst: Anmeldung, Ansichten, Formulare |
| `app.css` | Gestaltung, hell und dunkel |
| `app.js` | Logik, lädt `supabase-js` als ES-Modul vom CDN |
| `config.js` | Supabase-URL und Publishable Key (öffentlich, Schutz über Row Level Security) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Homescreen-App und Offline-Hülle |

## Datenmodell

- `profiles`: Name und Einstellungen je Person, wird bei der Registrierung automatisch angelegt.
- `beans`: Packungen, `created_by` zeigt auf die Person, die sie eingetragen hat.
- `brews`: Bewertungen mit Sternen, Säure, Süße, Bitterkeit und optionalem Rezept, `user_id` zeigt auf die bewertende Person.

## Lokal starten

```bash
python -m http.server 5178
```

Version 1.0 vom 30. Oktober 2026 lief rein lokal im Browser. Ihre Sicherungsdatei lässt sich im Profil unter „Alte Daten übernehmen“ importieren.
