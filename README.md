# Spike School — mini-kurs VALORANT

Statyczna strona po polsku: lekcja 1 o rolach, lekcja 2 z 29 agentami, quizy z czterema odpowiedziami oraz dodatkowe nagrania o broniach i rozgrywce. Postęp zapisuje się lokalnie w przeglądarce.

## Podgląd lokalny

W PowerShellu, w tym folderze:

```powershell
python -m http.server 8000
```

Otwórz `http://localhost:8000`.

## Wideo i publikacja na Render

Filmy lekcyjne są odtwarzane przez osadzony podgląd Google Drive. Ich identyfikatory i przypisanie do nazw plików znajdują się w `media-config.js`; pliki nie są pobierane do repozytorium ani serwowane przez Render. Udostępnione pliki muszą pozwalać na odtworzenie przez osoby mające link.

Grafiki agentów, ikony umiejętności i portrety są lokalnymi plikami projektu i zostaną opublikowane razem ze statyczną stroną. Duże MP4-y nie trafiają do deployu strony.
