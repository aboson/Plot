# Plot

Richtig gute Filme finden, im Swipe-Stil. Sieht aus wie Hinge, funktioniert wie Tinder.

- Nach rechts wischen oder auf ein Herz tippen: Film merken (optional mit Notiz)
- Nach links wischen oder X: nächster Film
- Pfeil oben rechts: letzte Entscheidung zurücknehmen
- Jedes Filmprofil zeigt Poster, Steckbrief, Handlung, Szenenbilder, Trailer, Besetzung und wo der Film in Deutschland läuft

Gezeigt werden nur Filme mit mindestens 7,5 von 10 Punkten und 1.500 Bewertungen auf TMDB.
Sind die alle durch, sinkt die Grenze schrittweise auf 7,0. Ab und zu kommen Empfehlungen passend zu deinen Likes dazu.

## Aufs iPhone

1. Die Seite in **Safari** öffnen.
2. Unten auf **Teilen** tippen, dann **Zum Home-Bildschirm**.
3. Plot über das neue Icon öffnen und den TMDB-Schlüssel einfügen.

Wichtig: Den Schlüssel erst in der installierten App eingeben. Safari und die Home-Bildschirm-App haben getrennten Speicher.

## TMDB-Schlüssel

1. Kostenlos registrieren auf https://www.themoviedb.org/signup
2. Unter https://www.themoviedb.org/settings/api einen Schlüssel beantragen
3. Den **API Read Access Token** (oder den kurzen **API Key**) kopieren

Der Schlüssel wird nur im Speicher des Geräts abgelegt, nie im Code.

## Lokal starten

Jeder statische Webserver geht, zum Beispiel:

```
npx serve .
```

## Technik

Reines HTML, CSS und JavaScript ohne Build-Schritt. `sw.js` und `manifest.webmanifest` machen die Seite installierbar.

Filmdaten und Bilder von [The Movie Database (TMDB)](https://www.themoviedb.org). Diese App nutzt die TMDB-API, ist aber nicht von TMDB unterstützt oder zertifiziert. Streaming-Daten von JustWatch.
