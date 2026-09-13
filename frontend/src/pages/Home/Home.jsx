import React from "react";
import { Link } from "react-router-dom";
import { Mark } from "../../components/Logo";

const Home = () => (
  <>
    <section className="hero">
      <div className="container hero__grid">
        <div>
          <span className="kicker">Atención cercana, donde usted esté</span>
          <h1>Orientación médica inicial, con el mismo cuidado de siempre.</h1>
          <p className="lead">
            Antes de la cita, un médico le pregunta como en consultorio: qué le
            molesta, qué tomó en los últimos días y si conviene agendar o acudir
            a emergencias.
          </p>
          <div className="hero__actions">
            <Link className="btn btn-primary" to="/consulta">
              Agendar cita
            </Link>
            <a className="btn btn-ghost" href="#como-funciona">
              Cómo funciona
            </a>
          </div>
        </div>
        <aside className="hero-card">
          <Mark className="hero-mark" />
          <h3>Primera orientación en Clínica Virtual</h3>
          <ol>
            <li>Le preguntamos el motivo, no le pedimos un formulario rígido.</li>
            <li>Revisamos medicamentos, sustancias, alcohol y otros antecedentes.</li>
            <li>Si el cuadro no es claro, le indicamos cita o emergencias.</li>
          </ol>
        </aside>
      </div>
    </section>

    <section id="como-funciona" className="container features">
      <article className="feature">
        <div className="icon-circle">01</div>
        <h3>Consulta guiada</h3>
        <p>
          El mismo criterio de una primera atención: motivo principal, pocas
          preguntas dirigidas y espacio para lo que no está seguro.
        </p>
      </article>
      <article className="feature">
        <div className="icon-circle">02</div>
        <h3>Antecedentes recientes</h3>
        <p>
          Medicamentos, drogas, alcohol o contactos de riesgo. Eso cambia la
          orientación y, a veces, la urgencia.
        </p>
      </article>
      <article className="feature">
        <div className="icon-circle">03</div>
        <h3>Siguiente paso claro</h3>
        <p>
          Si el cuadro es estable, agende una cita. Si hay signos de alarma,
          acuda a emergencias.
        </p>
      </article>
    </section>
  </>
);

export default Home;
