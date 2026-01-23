# 📦 Order Management App

Web aplikacija za upravljanje narudžbama sa **role-based pristupom (admin / user)**, izgrađena pomoću **Next.js (App Router)**, **Supabase** i **Material UI**.

Aplikacija omogućava kreiranje, pregled, izmjenu i brisanje narudžbi, kao i detaljan sistem **logova aktivnosti** i **dashboard sa statistikama**.

---

## 🚀 Tehnologije

- **Next.js 14+** (App Router)
- **TypeScript**
- **Supabase**
  - Authentication
  - PostgreSQL
  - Row Level Security (RLS)
- **Material UI (MUI)**
- **Recharts** (grafici)
- **React Hook Form**
- **Server Actions**
- **SSR + Client Components**

---

## 👥 Role sistem

Aplikacija ima dvije uloge:

### 🔹 User
- Može:
  - Kreirati narudžbu
  - Vidjeti samo **svoje** narudžbe
  - Pregledati detalje narudžbe
- Ne može:
  - Mijenjati status narudžbe
  - Pristupiti dashboardu, logovima i korisnicima

### 🔹 Admin
- Može:
  - Vidjeti **sve** narudžbe
  - Mijenjati status narudžbi
  - Brisati narudžbe
  - Kreirati narudžbe za druge korisnike (osim admina)
  - Upravljati korisnicima (promjena role)
  - Pristupiti dashboardu i logovima
- Ne može:
  - Promijeniti **svoju vlastitu ulogu**

---

## 🛒 Narudžbe (Orders)

### Funkcionalnosti
- Kreiranje nove narudžbe
- Validacija forme (frontend + backend)
- Automatsko računanje cijene sa servera
- Pregled detalja narudžbe
- Brisanje narudžbe (sa zadržavanjem logova)
- Edit narudžbe (adresa isporuke, količina)

### Statusi narudžbe
- `KREIRANA`
- `U_OBRADI`
- `POSLATA`
- `ISPORUCENA`
- `OTKAZANA`

---

## 📊 Dashboard

Dashboard je dostupan **samo adminima** i sadrži:

- 📈 Histogram vrijednosti narudžbi
- 📉 Linijski graf narudžbi po danima (30 dana)
- 📦 Top proizvode
- 📌 Status kartice (broj narudžbi po statusu)
- 🕒 Aktivnosti (logovi):
  - Kreiranje narudžbe
  - Promjena statusa
  - Brisanje narudžbe

Dashboard koristi **snapshot reference** kako bi logovi ostali vidljivi čak i nakon brisanja narudžbe.

---

## 🧾 Logovi (Audit log)

Svaka bitna akcija se loguje u tabelu `narudzbe_logovi`:

- CREATE_ORDER
- STATUS_CHANGED
- DELETED

### Posebnosti
- Logovi se **ne brišu** kada se obriše narudžba
- Koriste se snapshot kolone:
  - `narudzba_ref` (ID narudžbe)
  - `kupac_ref` (ime kupca)
- FK `narudzba_id` koristi `ON DELETE SET NULL`

---

## 🔐 Sigurnost (RLS)

Supabase RLS politike osiguravaju da:

- User vidi samo svoje podatke
- Admin vidi sve
- Samo admin može:
  - Mijenjati status narudžbe
  - Mijenjati role korisnika
- Admin **ne može promijeniti svoju vlastitu ulogu**

---


---

## ⚙️ Pokretanje projekta

### 1. Kloniranje repozitorija
```bash
git clone <repo-url>
cd manage-app
```

### 2. Instalacija zavisnosti
```bash
npm install
```

### 3. Environment varijable

Kreirati fajl **.env.local** u root direktoriju projekta i dodati:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Pokretanje aplikacije (development)
```bash
npm run dev
```

Aplikacija je dostupna na:  
http://localhost:3000




