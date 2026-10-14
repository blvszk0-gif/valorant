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

## Publikacja na Renderze (krok po kroku)

1. Utwórz puste repozytorium na GitHubie: GitHub → **+** → **New repository**. Nadaj mu nazwę, np. `valoranttrening`. Nie dodawaj README ani pliku `.gitignore`, bo projekt ma je już lokalnie.
2. Zainstaluj i otwórz **GitHub Desktop**. Wybierz **File → Add local repository…**, wskaż folder `C:\Users\irudr\Documents\ChatGPT\valoranttrening`, a potem **Publish repository**. Wybierz utworzone repo. Możesz zostawić je prywatne; przy podłączaniu Render poprosi o dostęp.
3. Zaloguj się do [Render Dashboard](https://dashboard.render.com/) i połącz konto GitHub, jeśli pojawi się taka prośba.
4. Kliknij **New + → Static Site**, znajdź repo `valoranttrening` i kliknij **Connect**.
5. Ustaw formularz:
   - **Name:** dowolna nazwa, np. `spike-school-irudr`
   - **Branch:** `master` (jeśli w GitHubie opublikujesz gałąź `main`, wybierz `main`)
   - **Root Directory:** zostaw puste
   - **Build Command:** zostaw puste
   - **Publish Directory:** wpisz `.`
6. Kliknij **Create Static Site**. Po zakończeniu deployu otwórz adres `…onrender.com` widoczny w panelu Render.
7. Sprawdź stronę oraz filmy. Jeśli film nie startuje, w Google Drive otwórz jego **Udostępnij** i ustaw **Każda osoba mająca link → Wyświetlający**. Strona osadza klipy przez odtwarzacz Drive; filmy nie są wysyłane do GitHub ani Render.
8. Kolejne zmiany publikujesz przez GitHub Desktop: wpisz opis w **Summary**, kliknij **Commit to master/main**, a potem **Push origin**. Render wdroży nową wersję po pushu.

To jest strona statyczna HTML/CSS/JS, więc nie potrzebuje komendy budowania. Render udostępnia statyczne strony przez CDN i przydziela adres `onrender.com`; szczegóły mogą zależeć od aktualnego planu konta. [Dokumentacja Render: Static Sites](https://render.com/docs/static-sites), [pierwsze wdrożenie](https://render.com/docs/your-first-deploy).
