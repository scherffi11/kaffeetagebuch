# Kaffeetagebuch

Private Web-App, um gekaufte Kaffeebohnen mit Foto, Preis und Kaufort festzuhalten und jeden Kaffee mit Rezept und Bewertung einzutragen.

- Läuft komplett im Browser, ohne Konto und ohne Server.
- Daten und Fotos liegen auf dem Gerät (IndexedDB). Sicherung als JSON-Datei über die Einstellungen.
- Als App auf den Homescreen legen: im Browser „Zum Startbildschirm hinzufügen“.

Aufbau: eine einzige `index.html` ohne Build-Schritt, dazu `manifest.webmanifest`, `sw.js` für den Offline-Betrieb und die Icons.
