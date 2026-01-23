import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>Dobrodošli u Orders App 👋</h1>
          <p>
            Jednostavna aplikacija za upravljanje narudžbama, statusima i pregledom
            aktivnosti – sve na jednom mjestu.
          </p>
        </section>

        <section className={styles.cards}>
          <div className={styles.card}>
            <h3>📦 Narudžbe</h3>
            <p>
              Pregledaj sve svoje narudžbe, filtriraj po statusu i prati tok
              isporuke.
            </p>
          </div>

          <div className={styles.card}>
            <h3>📊 Statistika</h3>
            <p>
              Vizualni pregled podataka: top proizvodi, promet i kretanje
              narudžbi kroz vrijeme.
            </p>
          </div>

          <div className={styles.card}>
            <h3>🔐 Sigurnost</h3>
            <p>
              Role-based pristup – admin i korisnici imaju jasno odvojene
              mogućnosti.
            </p>
          </div>
        </section>

        
      </main>
    </div>
  );
}
