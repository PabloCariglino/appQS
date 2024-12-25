import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles["text-container"]}>
            <h1 className={styles["header-title"]}>
              Frentes de parrilla a medida
            </h1>
            <div className={styles.info}>
              <p>✓ Cotización en 24hs</p>
              <p>✓ Asesoramiento personalizado</p>
              <p>✓ Envío y colocación</p>
            </div>
          </div>
          <img
            src="/assets/LOGO-sin-fondo2.png"
            alt="Logo Empresa"
            className={styles.logo1}
          />
        </header>
      </div>
      <main className={styles["main-content"]}>
        <section className={styles.section}>
          <h2>Frentes de Parrilla Hechos a Medida</h2>
          <p>
            Elegancia y Funcionalidad para tu Cocina. ¿Buscas darle un toque
            único a tu espacio de cocina? En Quick Solutions, creamos frentes de
            parrilla personalizados que combinan a la perfección resistencia,
            estilo y funcionalidad. Desde la elegancia atemporal del acero
            inoxidable hasta la calidez rústica de la chapa negra, cada detalle
            está diseñado para reflejar tu personalidad y pasión por la cocina.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Datos de Contratación</h2>
          <p>
            Si desea contactarnos, puede enviarnos un correo electrónico a:{" "}
            <a href="mailto:contacto@nuestraempresa.com">
              contacto@nuestraempresa.com
            </a>
            .
          </p>
          <p>
            También puede visitarnos en nuestras oficinas ubicadas en: Calle
            Falsa 123, Ciudad de Ejemplo.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Nuestros Servicios</h2>
          <p>
            Ofrecemos una amplia gama de servicios para el ensamblaje de frentes
            de parrilla, brindando asesoramiento personalizado y garantizando la
            mejor calidad.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Garantía y Calidad</h2>
          <p>
            Todos nuestros productos vienen con una garantía de 5 años. Nos
            enorgullece ofrecer materiales de la más alta calidad y durabilidad.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Home;
