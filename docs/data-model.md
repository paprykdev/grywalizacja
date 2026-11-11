# Model danych: encje i relacje

**Projekt:** System do grywalizacji zajęć (WMI UAM)
**Status:** wersja robocza, do akceptacji opiekuna
**Podstawa:** Dokument wymagań projektowych v0.1 (WF-xx, WN-xx)
**Technologia:** PostgreSQL + Prisma (`apps/api/prisma/schema.prisma`)

Dokument opisuje słownie encje i relacje. Diagram ERD powstaje w osobnym zadaniu i musi być z nim spójny. Punkty oznaczone **[do potwierdzenia]** wymagają decyzji zespołu (lista pytań w sekcji 6).

## 1. Założenia

1. Użytkownik ma jedną rolę systemową: `ADMIN`, `TEACHER` lub `STUDENT`. Nauczyciel jest właścicielem swoich grup, a studenci należą do nich przez członkostwo.
2. Cała konfiguracja grywalizacji (fabuła, waluty, rangi, odznaki, aktywności) jest **osobna dla każdej grupy**.
3. Saldo waluty wynika z **niezmiennego rejestru** wpisów. Błędy poprawia wpis odwrotny (WN-12, WF-26).
4. **Ranga zależy od łącznie zdobytej waluty, a nie od salda** (WF-23), i jest wyliczana, nie zapisywana.
5. Wartości walut to `Int`. Identyfikatory to `Int` z autoinkrementacją, jak w istniejącym modelu `Link`.
6. Użytkowników i członkostw nie usuwamy fizycznie, tylko zmieniamy status, bo opiera się na nich historia nagród.
7. Hasła są przechowywane jako argon2, a tokeny aktywacyjne i sesji jako SHA-256 (WN-05–WN-07).

Każda encja ma `id` (PK). Pól `createdAt` i `updatedAt` nie powtarzam przy każdej tabeli.

## 2. Encje

### Konta i uwierzytelnianie

**User** to osoba z kontem w systemie.

| Pole                         | Opis                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `email`                      | Unikalny, jedyny identyfikator logowania                                                                                                 |
| `firstName`, `lastName`      | Imię i nazwisko                                                                                                                          |
| `role`                       | `ADMIN`, `TEACHER`, `STUDENT`                                                                                                            |
| `status`                     | `PENDING_APPROVAL` (nauczyciel czeka na administratora), `PENDING_ACTIVATION` (student przed aktywacją), `ACTIVE`, `REJECTED`, `BLOCKED` |
| `passwordHash`               | Opcjonalne, puste do aktywacji konta studenta                                                                                            |
| `nick`, `avatarUrl`          | Opcjonalne, profil studenta pokazywany w rankingach (WF-27)                                                                              |
| `reviewedById`, `reviewedAt` | Administrator i data decyzji o rejestracji nauczyciela (WF-02)                                                                           |

**Session** to sesja po stronie serwera (WN-06): `userId`, `tokenHash` (unikalny), `expiresAt`, `revokedAt`. Pozwala natychmiast unieważnić logowanie.

**ActivationToken** to jednorazowy link aktywacyjny lub resetu hasła (WF-04, WF-06): `userId`, `tokenHash` (unikalny), `purpose` (`ACTIVATION` lub `PASSWORD_RESET`), `expiresAt`, `usedAt`, `createdById` (administrator, który wygenerował link).

### Grupy

**Group** to zajęcia prowadzone przez jednego nauczyciela w semestrze (WF-08, WF-09).

| Pole          | Opis                                     |
| ------------- | ---------------------------------------- |
| `teacherId`   | FK → `User`, nauczyciel prowadzący       |
| `name`        | Nazwa                                    |
| `description` | Opcjonalny opis                          |
| `semester`    | Semestr, np. „2026/27 zimowy”            |
| `archivedAt`  | Ustawione, gdy grupa jest zarchiwizowana |

**Membership** to przynależność studenta do grupy. Do niego przypisane są wszystkie nagrody, więc saldo jest osobne w każdej grupie.

| Pole                    | Opis                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `userId`, `groupId`     | FK → `User` (student), FK → `Group`. Para jest unikalna              |
| `status`                | `ACTIVE` lub `REMOVED`. Usunięcie z grupy (WF-11) zachowuje historię |
| `joinedAt`, `removedAt` | Daty dołączenia i usunięcia                                          |

### Konfiguracja grywalizacji (osobno dla każdej grupy)

Waluta, ranga, odznaka i aktywność mają wspólne pole `didacticDescription`: jak dany element przekłada się na zaliczenie (WF-18).

| Encja                                   | Pola                                                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Storyline** (fabuła, WF-13)           | `groupId` (unikalne, jedna fabuła na grupę), `title`, `description`, `imageUrl`                                                                                 |
| **Currency** (waluta, WF-14)            | `groupId`, `name` (unikalna w grupie), `description`, `didacticDescription`, `imageUrl`                                                                         |
| **Rank** (ranga, WF-15)                 | `groupId`, `currencyId`, `name`, `threshold` (≥ 0, próg w łącznie zdobytej walucie), `description`, `didacticDescription`, `imageUrl`                           |
| **Badge** (odznaka, WF-16)              | `groupId`, `name`, `description`, `awardCondition` (warunek przyznania), `didacticDescription`, `imageUrl`, opcjonalny bonus: `bonusCurrencyId` i `bonusAmount` |
| **Activity** (aktywność, WF-17)         | `groupId`, `name`, `description`, `didacticDescription`, `isActive`                                                                                             |
| **Bonus** (nagroda za aktywność, WF-17) | `activityId`, `currencyId`, `amount` (> 0). Aktywność może dawać nagrody w kilku walutach                                                                       |

Przy randze próg `threshold` jest unikalny w obrębie waluty, a grupa powinna mieć rangę startową z progiem 0. Pola bonusu w odznace są albo oba puste, albo oba wypełnione.

### Rejestr nagród

**BadgeAward** to fakt przyznania odznaki studentowi (WF-21): `membershipId`, `badgeId` (para unikalna, odznaka tylko raz), `awardedById`, `comment`, `awardedAt`.

**CurrencyTransaction** to pojedynczy wpis zmieniający saldo. Jest jedynym źródłem prawdy o saldzie, historii (WF-24) i randze.

| Pole           | Opis                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| `membershipId` | FK → `Membership`, czyje punkty                                              |
| `currencyId`   | FK → `Currency`                                                              |
| `amount`       | Różne od 0: dodatnia to przychód, ujemna to rozchód                          |
| `type`         | `AWARD`, `BADGE_BONUS`, `CORRECTION`, `PURCHASE`                             |
| `comment`      | Komentarz nauczyciela (WF-20), wymagany dla `CORRECTION`                     |
| `activityId`   | Opcjonalna aktywność uzasadniająca nagrodę (tylko `AWARD`)                   |
| `badgeAwardId` | Unikalne, przyznanie odznaki, które wygenerowało bonus (tylko `BADGE_BONUS`) |
| `reversesId`   | Unikalne, wpis odwracany przez ten wpis (tylko `CORRECTION`)                 |
| `createdById`  | FK → `User`, kto spowodował wpis                                             |

Typy wpisów:

- `AWARD`: nauczyciel przyznaje walutę jednemu lub wielu studentom (WF-20), dla każdego powstaje osobny wpis.
- `BADGE_BONUS`: system dolicza bonus za przyznaną odznakę (WF-22).
- `CORRECTION`: wpis odwrotny do błędnie przyznanej nagrody (WF-26).
- `PURCHASE`: wydanie waluty w sklepie, wartość ujemna (WF-32, priorytet O).

## 3. Relacje

| Relacja                                           | Kardynalność | Opis                                                          |
| ------------------------------------------------- | ------------ | ------------------------------------------------------------- |
| `User` → `Group`                                  | 1 : N        | Nauczyciel prowadzi wiele grup, grupa ma jednego nauczyciela  |
| `User` – `Group` (przez `Membership`)             | N : M        | Student jest w wielu grupach, grupa ma wielu studentów        |
| `User` → `Session`, `ActivationToken`             | 1 : N        | Konto może mieć wiele sesji i tokenów                         |
| `Group` → `Storyline`                             | 1 : 1        | Każda grupa ma jedną fabułę                                   |
| `Group` → `Currency`, `Rank`, `Badge`, `Activity` | 1 : N        | Konfiguracja należy do grupy                                  |
| `Currency` → `Rank`                               | 1 : N        | Próg rangi jest wyrażony w walucie                            |
| `Activity` → `Bonus`                              | 1 : N        | Aktywność daje nagrody w jednej lub kilku walutach            |
| `Currency` → `Bonus`, `Badge` (bonus)             | 1 : N        | Waluta nagrody                                                |
| `Membership` – `Badge` (przez `BadgeAward`)       | N : M        | Student ma wiele odznak, odznakę ma wielu studentów           |
| `Membership` → `CurrencyTransaction`              | 1 : N        | Rejestr nagród studenta w grupie                              |
| `Currency` → `CurrencyTransaction`                | 1 : N        | Waluta wpisu                                                  |
| `Activity` → `CurrencyTransaction`                | 1 : N        | Nagroda za aktywność (opcjonalnie)                            |
| `BadgeAward` → `CurrencyTransaction`              | 1 : 0..1     | Przyznanie odznaki generuje co najwyżej jeden bonus           |
| `CurrencyTransaction` → `CurrencyTransaction`     | 1 : 0..1     | Wpis może być odwrócony co najwyżej jednym wpisem korygującym |

Dane, na których opiera się historia nagród, mają zachowanie `Restrict` przy usuwaniu, więc nie da się ich skasować, dopóki istnieją powiązane wpisy. Zamiast usuwania stosujemy statusy i archiwizację. Wyjątek to `Session`, `ActivationToken` i `Storyline`, które usuwają się razem z właścicielem.

## 4. Saldo i ranga

Reguły rejestru:

1. Wpisów nie edytujemy ani nie usuwamy.
2. Błąd poprawia wpis `CORRECTION` o tej samej wartości z przeciwnym znakiem, powiązany przez `reversesId`. Wpis można odwrócić tylko raz, a korekty nie odwracamy.
3. Przyznanie nagrody, bonus za odznakę i zakup zapisują się w jednej transakcji bazodanowej.

Z rejestru liczymy dwie wartości dla pary (członkostwo, waluta):

- **Saldo** (waluta do wydania): suma wszystkich wpisów.
- **Zdobyta łącznie**: suma wpisów z pominięciem `PURCHASE`. Od niej zależy ranga.

```sql
SELECT "currencyId",
       SUM("amount")                                     AS balance,
       SUM("amount") FILTER (WHERE "type" <> 'PURCHASE') AS earned
FROM "CurrencyTransaction"
WHERE "membershipId" = $1
GROUP BY "currencyId";
```

Ranga studenta to ranga z najwyższym progiem nie większym niż jego „zdobyta łącznie”.

**Przykład** (rangi: Nowicjusz 0, Adept 50):

| type        | amount | Opis                   |
| ----------- | ------ | ---------------------- |
| AWARD       | +60    | aktywność na zajęciach |
| BADGE_BONUS | +20    | bonus za odznakę       |
| PURCHASE    | −50    | zakup w sklepie        |

Saldo = 30, zdobyta łącznie = 80, więc ranga to „Adept”, mimo że saldo jest niższe niż próg.

## 5. Reguły spójności

**W bazie danych:** unikalności wymienione w opisie encji, `amount <> 0`, `Bonus.amount > 0`, `Rank.threshold >= 0`, zgodność `type` ze źródłem wpisu (`BADGE_BONUS` wymaga `badgeAwardId`, `CORRECTION` wymaga `reversesId`) oraz zablokowanie `UPDATE` i `DELETE` na `CurrencyTransaction`.

**W warstwie serwisów API:**

- Nauczyciel działa tylko na grupach, w których jest `teacherId`, a student tylko w grupach z aktywnym członkostwem (WN-08).
- Waluta, aktywność, odznaka i ranga użyte w operacji muszą należeć do tej samej grupy co członkostwo.
- `Group.teacherId` wskazuje aktywne konto `TEACHER`, a `Membership.userId` konto `STUDENT`.
- Rankingi zwracają wyłącznie `nick`, a imię, nazwisko i e-mail widzi tylko nauczyciel grupy i administrator (WN-11).
- Blokada konta i zmiana hasła unieważniają sesje użytkownika.
- Wszystkie rangi w grupie są wyrażone w jednej walucie **[do potwierdzenia]**.

## 6. Poza MVP i pytania otwarte

**Sklep (priorytet O, WF-30–WF-33)** wymaga trzech encji: `ShopItem` (pozycja z ceną w walucie grupy), `ShopDiscount` (zniżka zależna od rangi lub odznaki) i `Purchase` (kto, co, za ile kupił). Rejestr jest na to gotowy: typ `PURCHASE` i dodatkowa kolumna `purchaseId` w `CurrencyTransaction`. Przygotowanie pod LDAP (WN-20) to późniejsza tabela `ExternalIdentity`, bez zmian w `User`.

**Do potwierdzenia z zespołem i opiekunem:**

1. Jedna drabina rang w jednej walucie na grupę, czy osobna drabina dla każdej waluty?
2. Czy ta sama aktywność może być nagradzana wielokrotnie (założono, że tak)?
3. Nick studenta: czy ma być unikalny i jak pokazywać studenta bez nicku?
4. Grafiki: wystarczy adres URL, czy system ma przechowywać wgrane pliki?
5. Czy korekta może sprowadzić saldo poniżej zera i czy może odwracać zakup?
6. RODO: anonimizacja czy usunięcie danych studenta na jego prośbę (rejestr jest niezmienny)?
