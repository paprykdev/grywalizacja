# Jak współpracować w tym repo

Zasady są proste, żeby czterech osobom pracowało się sprawnie w sprintach.

## Przepływ pracy

1. Weź zadanie z backlogu (GitHub Projects / Issues) i przypisz je sobie.
2. Utwórz gałąź z aktualnego `main`.
3. Commituj małymi, logicznymi kawałkami.
4. Wypchnij gałąź i otwórz Pull Request (szablon wypełni się sam).
5. Poczekaj na zielone CI i review, potem **squash merge**.
6. Gałąź zostanie usunięta po merge'u.

Bezpośredni push do `main` jest zablokowany.

## Nazwy gałęzi

Format: `typ/NUMER-krotki-opis`

| Prefiks    | Zastosowanie                 | Przykład                         |
| ---------- | ---------------------------- | -------------------------------- |
| `feature/` | nowa funkcja                 | `feature/12-ranking-studentow`   |
| `fix/`     | poprawka błędu               | `fix/27-blad-logowania`          |
| `hotfix/`  | pilna poprawka na `main`     | `hotfix/31-crash-przy-starcie`   |
| `docs/`    | dokumentacja                 | `docs/8-instrukcja-uruchomienia` |
| `chore/`   | CI, zależności, konfiguracja | `chore/15-dependabot`            |

`NUMER` to numer Issue z backlogu.

## Commity (Conventional Commits)

Format: `typ(zakres): krótki opis w trybie rozkazującym`

```
feat(backend): dodaj endpoint rankingu punktów
fix(frontend): popraw walidację formularza logowania
docs: uzupełnij README o docker compose
chore(ci): dodaj cache zależności
```

Typy: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.
Zakres jest opcjonalny (`backend`, `frontend`, `db`, `ci`).

## Pull Requesty

- Tytuł w formacie jak commit: `feat(backend): dodaj ranking punktów`.
- Jeden PR to jedno zadanie. Małe PR-y są recenzowane szybciej.
- Powiąż zadanie: `Closes #12`.
- Wypełnij szablon: opis, jak przetestować, zrzuty ekranu dla zmian w UI.
- Wymagane: min. **1 approve**, zielone CI i rozwiązane komentarze.
- Autor sam nie zatwierdza swojego PR-a.
- Recenzja w ciągu **24 h** w dni robocze. Jeśli się nie da, daj znać na czacie zespołu.

## Code review

- Komentuj kod, nie osobę. Pytaj, zamiast rozkazywać.
- Oznaczaj wagę: `nit:` (drobiazg), `uwaga:` (do poprawy), `blokuje:` (nie do zmergowania).
- Autor odpowiada na każdy komentarz i zaznacza jako rozwiązany dopiero po poprawce.

## Lokalne uruchomienie

```bash
git clone <adres-repo>
cd <repo>
cp .env.example .env     # uzupełnij wartości lokalne
docker compose up --build
```

Szczegóły dla backendu i frontendu znajdziesz w `backend/README.md` i `frontend/README.md`.

## Testy i jakość

Przed otwarciem PR-a uruchom lokalnie testy i lint swojej części (backend / frontend). CI powtórzy to na każdym PR-ze i bez zielonego wyniku merge jest zablokowany.

## Bezpieczeństwo

- Nigdy nie commituj haseł, kluczy API, tokenów ani plików `.env`.
- Nie wrzucaj prawdziwych danych studentów ani nauczycieli. Używaj danych testowych.
- Znalazłeś wyciek sekretu? Zgłoś to od razu leadowi, bo samo usunięcie commita nie wystarczy (trzeba zmienić sekret).

## Scrum

- Sprint planning ustala zakres. Zadania poza sprintem nie trafiają do `main` bez uzgodnienia.
- Zadanie jest "done", gdy: kod zmergowany, testy przechodzą, kryteria akceptacji spełnione i Issue zamknięte.
