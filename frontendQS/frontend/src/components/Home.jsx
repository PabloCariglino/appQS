import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <header>
        <h1>Bienvenidos a Nuestra Empresa</h1>
        <nav>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </nav>
      </header>
      <main>
        <section>
          <h2>Introducción</h2>
          <p>Descripción de la empresa...</p>
        </section>
        <section>
          <h2>Datos de Contratación</h2>
          <p>Información de contacto...</p>
        </section>
        {/* Más secciones según sea necesario */}
      </main>
    </div>
  );
};

export default Home;
