window.EXTRA_GAME_COURSES = {
  fortnite: {
    id: 'fortnite', name: 'Fortnite', logo: 'FORTNITE', short: 'FN',
    eyebrow: 'BATTLE ROYALE · ZERO BUILD',
    intro: 'Poznaj zasady Battle Royale: lądowanie, łupienie, burzę i wybór między budowaniem a Zero Build.',
    lessons: [
      { title: 'Cel meczu', label: '01 · ZWYCIĘSTWO', text: 'Przetrwaj dłużej niż pozostali gracze lub drużyny. Ostatni gracz albo ostatnia drużyna na wyspie zdobywa Victory Royale.', tip: 'Wygrana nie zawsze wymaga największej liczby eliminacji — liczy się przetrwanie i dobre decyzje.' },
      { title: 'Lądowanie i łup', label: '02 · START MECZU', text: 'Wybierz miejsce lądowania, zbieraj broń, amunicję, osłony i przedmioty użytkowe. Po lądowaniu szybko sprawdź wyposażenie i bezpieczną drogę.', tip: 'Popularne miejsca dają szybki dostęp do łupu, ale zwykle oznaczają więcej wczesnych walk.' },
      { title: 'Burza i bezpieczna strefa', label: '03 · POZYCJA', text: 'Burza stopniowo ogranicza obszar gry. Śledź mapę i przemieszczaj się do bezpiecznej strefy, zanim droga zostanie odcięta.', tip: 'Zaplanuj rotację wcześniej; leczenie po wejściu w burzę może nie wystarczyć.' },
      { title: 'Budowanie czy Zero Build', label: '04 · STYLE GRY', text: 'W Battle Royale możesz tworzyć osłony i konstrukcje z materiałów. Zero Build zachowuje walkę o przetrwanie, ale wyłącza budowanie.', tip: 'W Zero Build częściej korzystaj z naturalnych osłon, przewyższenia i dostępnych narzędzi ruchu.' },
      { title: 'Zdrowie, osłona i drużyna', label: '05 · PRZETRWANIE', text: 'Zdrowie i osłona to osobne zasoby. Przedmioty lecznicze pomagają wrócić do walki, a w trybie drużynowym komunikacja i pomoc sojusznikom zwiększają szanse zespołu.', tip: 'Przed użyciem leczenia znajdź osłonę i upewnij się, że drużyna może Cię osłaniać.' }
    ],
    questions: [
      { prompt: 'Jaki jest główny cel meczu Battle Royale?', options: ['Zdobyć najwięcej złota', 'Pozostać ostatnim graczem lub drużyną', 'Zająć wszystkie punkty na mapie', 'Pokonać bossa jako pierwsza drużyna'], correct: 1, why: 'Zwycięstwo zdobywa ostatni gracz lub drużyna, która pozostaje w meczu.' },
      { prompt: 'Co robi burza w Battle Royale?', options: ['Stopniowo zmniejsza bezpieczny obszar', 'Odbiera wszystkim broń', 'Zamyka sklep na wyspie', 'Przenosi graczy do lobby co minutę'], correct: 0, why: 'Burza ogranicza obszar gry i wymusza przemieszczanie się.' },
      { prompt: 'Czym Zero Build różni się od standardowego Battle Royale?', options: ['Nie ma innych graczy', 'Nie można zbierać łupu', 'Nie ma mechaniki budowania', 'Mecz kończy się po jednej eliminacji'], correct: 2, why: 'Zero Build zachowuje rozgrywkę Battle Royale bez budowania konstrukcji.' },
      { prompt: 'Co warto zrobić po wylądowaniu?', options: ['Zebrać wyposażenie i sprawdzić bezpieczną drogę', 'Od razu wyrzucić amunicję', 'Zostać w miejscu do końca meczu', 'Uciec poza wyspę'], correct: 0, why: 'Broń, amunicja, osłony i plan rotacji pomagają przygotować się do walki.' },
      { prompt: 'Który zasób jest oddzielny od zdrowia?', options: ['Osłona', 'Wysokość', 'Amunicja', 'Drewno'], correct: 0, why: 'Punkty zdrowia i osłony są osobnymi zasobami.' },
      { prompt: 'Jak najlepiej reagować na kurczącą się bezpieczną strefę?', options: ['Czekać w burzy bez planu', 'Wcześniej zaplanować drogę do strefy', 'Wyrzucić mapę', 'Biec w stronę najdalszego brzegu'], correct: 1, why: 'Wcześniejsza rotacja ogranicza ryzyko utknięcia w burzy lub złej pozycji.' },
      { prompt: 'Co pomaga w Zero Build, skoro nie można tworzyć konstrukcji?', options: ['Naturalne osłony i dobre pozycjonowanie', 'Wyłączenie mapy', 'Usunięcie ekwipunku', 'Ignorowanie wysokości terenu'], correct: 0, why: 'Osłony terenowe, przewyższenie i narzędzia ruchu pomagają przetrwać bez budowania.' },
      { prompt: 'Co oznacza Victory Royale?', options: ['Ukończenie samouczka', 'Zwycięstwo w meczu Battle Royale', 'Znalezienie legendarnej broni', 'Wejście do bezpiecznej strefy'], correct: 1, why: 'Victory Royale to komunikat za wygranie meczu Battle Royale.' }
    ],
    sources: [
      { label: 'Epic Games · Battle Royale', url: 'https://www.fortnite.com/@epic/battle-royale?lang=en-US' },
      { label: 'Epic Games · Zero Build', url: 'https://www.fortnite.com/@epic/zero-build' }
    ]
  },
  'crimson-desert': {
    id: 'crimson-desert', name: 'Crimson Desert', logo: 'CRIMSON\nDESERT', short: 'CD',
    eyebrow: 'OPEN-WORLD ACTION ADVENTURE',
    intro: 'Poznaj podstawy przygody Kliffa: kontynent Pywel, eksplorację, walkę i tajemnicę Otchłani.',
    lessons: [
      { title: 'Kliff i Szarogrzywi', label: '01 · BOHATER', text: 'Kliff należy do Szarogrzywych. Po napaści Czarnych Niedźwiedzi wyrusza odnaleźć ocalałych towarzyszy i odbudować swoją frakcję.', tip: 'Wątek Kliffa prowadzi przez konflikty i spotkania z mieszkańcami Pywel.' },
      { title: 'Kontynent Pywel', label: '02 · ŚWIAT', text: 'Pywel to otwarty świat z dzikimi ostępami, miastami, pustyniami, górami i starożytnymi ruinami.', tip: 'Zaglądaj do nowych miejsc — eksploracja prowadzi do zadań, sekretów i wyzwań.' },
      { title: 'Walka i rozwój', label: '03 · AKCJA', text: 'Walka łączy ataki, uniki, obronę i umiejętności. Możesz rozwijać zestaw umiejętności oraz korzystać z różnych broni i wyposażenia.', tip: 'Obserwuj ruchy przeciwnika i dopasuj moment ataku, uniku lub obrony.' },
      { title: 'Otchłań i jej tajemnice', label: '04 · ABYSS', text: 'Otchłań jest tajemniczym wymiarem powiązanym z główną przygodą. Odkrywanie jej sekretów rozszerza eksplorację poza zwykłe szlaki Pywel.', tip: 'Zwracaj uwagę na punkty zainteresowania i elementy świata związane z Otchłanią.' },
      { title: 'Zadania i przygotowanie', label: '05 · WYPRAWA', text: 'Zadania kierują przygodą, a ekwipunek, umiejętności i przygotowanie pomagają w starciach. To otwarta przygodowa gra akcji skupiona na historii Kliffa i świecie Pywel.', tip: 'Jeśli przeciwnik sprawia trudność, wróć do eksploracji i rozwoju postaci, a potem spróbuj ponownie.' }
    ],
    questions: [
      { prompt: 'Kim jest Kliff?', options: ['Dowódcą Czarnych Niedźwiedzi', 'Szarogrzywym próbującym odnaleźć towarzyszy', 'Królem Pywel', 'Kupcem z Otchłani'], correct: 1, why: 'Kliff należy do Szarogrzywych i szuka ocalałych towarzyszy.' },
      { prompt: 'Jak nazywa się kontynent, na którym rozpoczyna się przygoda?', options: ['Runeterra', 'Pywel', 'Valoran', 'Azeroth'], correct: 1, why: 'Crimson Desert rozgrywa się na kontynencie Pywel.' },
      { prompt: 'Jaki to rodzaj gry?', options: ['Drużynowa strzelanka PvP', 'Otwarta przygodowa gra akcji', 'Wyścigi samochodowe', 'Turowa gra karciana'], correct: 1, why: 'Twórcy opisują Crimson Desert jako open-world action-adventure.' },
      { prompt: 'Co najlepiej zrobić, obserwując atak przeciwnika?', options: ['Dopasować unik, obronę lub kontratak do sytuacji', 'Zawsze stać bez ruchu', 'Wyrzucić całą broń', 'Opuścić mapę'], correct: 0, why: 'Walka opiera się na reakcjach, umiejętnościach i dopasowaniu działań do przeciwnika.' },
      { prompt: 'Co można rozwijać, by zmieniać możliwości w walce?', options: ['Umiejętności, broń i wyposażenie', 'Wyłącznie kolor mapy', 'Pozycję w rankingu drużynowym', 'Liczbę rund w meczu'], correct: 0, why: 'Zestaw umiejętności, broni i wyposażenia wpływa na podejście do starć.' },
      { prompt: 'Czym jest Pywel?', options: ['Trybem rankingowym', 'Kontynentem otwartego świata', 'Typem broni', 'Nazwą frakcji Kliffa'], correct: 1, why: 'Pywel to kontynent, po którym toczy się przygoda.' },
      { prompt: 'Z czym wiąże się Otchłań?', options: ['Z tajemniczym wymiarem i sekretami świata', 'Z systemem dobierania PvP', 'Z zakupem skórek', 'Z mapą Summoner’s Rift'], correct: 0, why: 'Otchłań jest jednym z tajemniczych elementów świata Crimson Desert.' },
      { prompt: 'Co możesz zrobić, gdy starcie okazuje się zbyt trudne?', options: ['Eksplorować, rozwijać postać i wrócić przygotowanym', 'Usunąć zapis gry', 'Przestać używać umiejętności', 'Zignorować wyposażenie na zawsze'], correct: 0, why: 'Eksploracja i rozwój umiejętności oraz wyposażenia pomagają przygotować się do walki.' }
    ],
    sources: [
      { label: 'Pearl Abyss · Crimson Desert', url: 'https://crimsondesert.pearlabyss.com/pl-PL/Main' },
      { label: 'Pearl Abyss · Kliff i Pywel', url: 'https://crimsondesert.pearlabyss.com/pl-PL/News/Notice/Detail?_boardNo=57' }
    ]
  },
  'league-of-legends': {
    id: 'league-of-legends', name: 'League of Legends', logo: 'LEAGUE OF\nLEGENDS', short: 'LoL',
    eyebrow: 'MOBA · SUMMONER’S RIFT',
    intro: 'Naucz się podstaw Summoner’s Rift: pięciu pozycji, alei, stworów, wież i głównych celów mapy.',
    lessons: [
      { title: 'Cel meczu', label: '01 · NEXUS', text: 'Dwie pięcioosobowe drużyny walczą o zniszczenie wrogiego Nexusa. Aby do niego dotrzeć, trzeba przejść przez aleje i obronne budowle.', tip: 'Eliminacje pomagają, ale zwycięstwo daje dopiero zniszczenie Nexusa.' },
      { title: 'Pięć pozycji', label: '02 · ROLE', text: 'Standardowy skład obejmuje Top, Jungle, Mid, Bot/ADC i Support. Każda pozycja ma inne zadania, ale drużyna musi współpracować.', tip: 'Bot to zwykle para ADC i Support; Jungler zdobywa zasoby w dżungli i wspiera aleje.' },
      { title: 'Aleje, stwory i złoto', label: '03 · EKONOMIA', text: 'Stwory poruszają się alejami. Ostatnie trafienie w stwora daje złoto, które można wydać w sklepie na przedmioty wzmacniające bohatera.', tip: 'Nie atakuj bez przerwy, jeśli chcesz precyzyjnie dobijać stwory i kontrolować falę.' },
      { title: 'Wieże i inhibitory', label: '04 · DROGA DO BAZY', text: 'Wieże bronią alei, a inhibitor znajduje się głębiej w bazie. Niszczenie obrony otwiera drogę do Nexusa.', tip: 'Podejdź do wieży z własnymi stworami, które mogą przyjąć jej pierwsze strzały.' },
      { title: 'Dżungla, smoki i Baron', label: '05 · CELE MAPY', text: 'Dżungla leży między alejami i zawiera neutralne potwory. Smoki oraz Baron Nashor dają drużynie ważne korzyści, więc walka o nie wymaga przygotowania.', tip: 'Zanim ruszycie do celu, sprawdźcie wizję i pozycję przeciwników.' },
      { title: 'Wizja i mgła wojny', label: '06 · INFORMACJA', text: 'Mgła wojny ukrywa obszary poza zasięgiem widzenia drużyny. Totemy zapewniają wizję, pomagają śledzić przeciwników i bezpieczniej kontrolować mapę.', tip: 'Brak przeciwnika na mapie nie oznacza, że jest daleko — może być niewidoczny w mgle wojny.' }
    ],
    questions: [
      { prompt: 'Jaki jest główny cel na Summoner’s Rift?', options: ['Zdobyć najwięcej zabójstw', 'Zniszczyć wrogi Nexus', 'Pokonać każdego potwora', 'Zająć wszystkie krzaki'], correct: 1, why: 'Drużyna wygrywa, gdy zniszczy Nexus przeciwnika.' },
      { prompt: 'Ile pozycji tworzy standardowy skład drużyny?', options: ['3', '4', '5', '6'], correct: 2, why: 'Standardowy skład ma pięć pozycji: Top, Jungle, Mid, Bot/ADC i Support.' },
      { prompt: 'Co zwykle daje ostatnie trafienie w stwora?', options: ['Złoto', 'Natychmiastowe zwycięstwo', 'Dodatkowego bohatera', 'Darmowy reset umiejętności'], correct: 0, why: 'Ostatnie trafienie, czyli last hit, przyznaje złoto.' },
      { prompt: 'Co pomaga bezpieczniej podejść do wieży?', options: ['Własne stwory wchodzące pod wieżę', 'Samotne wejście bez fali', 'Wyłączenie minimapy', 'Atakowanie sojuszniczej wieży'], correct: 0, why: 'Własne stwory mogą przyjąć strzały wieży i osłonić podejście.' },
      { prompt: 'Która pozycja zwykle zdobywa zasoby w dżungli i wspiera aleje?', options: ['Support', 'Jungler', 'ADC', 'Top'], correct: 1, why: 'Jungler porusza się po dżungli i może wspierać aleje.' },
      { prompt: 'Czym jest mgła wojny?', options: ['Ukryciem obszarów mapy bez wizji drużyny', 'Umiejętnością każdego bohatera', 'Sklepem z przedmiotami', 'Efektem po zniszczeniu Nexusa'], correct: 0, why: 'Mgła wojny ukrywa obszary, których drużyna aktualnie nie widzi.' },
      { prompt: 'Co daje drużynie zabicie neutralnego celu, takiego jak smok?', options: ['Korzyść lub wzmocnienie drużynowe', 'Automatyczne zwycięstwo', 'Nowy Nexus', 'Dodatkową aleję'], correct: 0, why: 'Ważne potwory neutralne dają drużynie unikalne korzyści.' },
      { prompt: 'Jaką parę najczęściej spotyka się na dolnej alei?', options: ['Top i Jungle', 'Mid i Top', 'ADC i Support', 'Dwóch Junglerów'], correct: 2, why: 'Na dolnej alei zwykle grają razem ADC i Support.' }
    ],
    sources: [
      { label: 'Riot Games · Jak grać w League of Legends', url: 'https://www.leagueoflegends.com/en-us/how-to-play/' }
    ]
  }
};
