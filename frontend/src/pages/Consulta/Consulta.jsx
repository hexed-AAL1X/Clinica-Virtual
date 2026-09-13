import React, { useEffect, useMemo, useState } from "react";
import { Mark } from "../../components/Logo";
import { fetchConsultationMeta, fetchSymptoms, requestDiagnosis } from "../../services/api";

const STEPS = [
  { id: "motivo", label: "Motivo" },
  { id: "sintomas", label: "Síntomas" },
  { id: "antecedentes", label: "Antecedentes" },
  { id: "extra", label: "Otros" },
  { id: "resultado", label: "Orientación" },
];

const FALLBACK_CATEGORIES = [
  { id: "piel", label: "Piel o alergia", question: "En la piel, ¿reconoce alguno de estos cambios?", symptoms: [] },
  { id: "fiebre", label: "Fiebre o infección", question: "¿Hay fiebre u otro signo infeccioso?", symptoms: [] },
  { id: "respiratorio", label: "Respiración, tos o nariz", question: "¿Qué nota en la vía respiratoria?", symptoms: [] },
  { id: "digestivo", label: "Estómago o digestión", question: "¿Cuál molestia digestiva está presente?", symptoms: [] },
  { id: "urinario", label: "Orina o vejiga", question: "¿Identifica alguna molestia urinaria?", symptoms: [] },
  { id: "dolor", label: "Dolor", question: "¿Dónde duele con más claridad?", symptoms: [] },
  { id: "circulo", label: "Corazón o circulación", question: "¿Nota algo en el corazón o la circulación?", symptoms: [] },
  { id: "neurologico", label: "Mareos o conciencia", question: "¿Ha tenido mareos, confusión o debilidad?", symptoms: [] },
];

const FALLBACK_CONTEXT = [
  { id: "medicamento", label: "Tomó un medicamento nuevo" },
  { id: "droga", label: "Ingirió alguna droga o sustancia" },
  { id: "alcohol", label: "Consumo importante de alcohol" },
  { id: "relaciones", label: "Contacto sexual de riesgo" },
  { id: "transfusion", label: "Transfusión de sangre" },
  { id: "inyeccion", label: "Inyección con material no estéril" },
  { id: "familia", label: "Antecedente familiar similar" },
];

const DiseaseImage = ({ src }) => {
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(src) && !broken;

  return (
    <div className="result-card__media">
      <img
        className={`result-card__photo ${showPhoto ? "" : "is-fallback"}`}
        src={showPhoto ? src : "/icono.webp"}
        alt=""
        width={640}
        height={360}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
      />
    </div>
  );
};

const Consulta = () => {
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [contextOptions, setContextOptions] = useState(FALLBACK_CONTEXT);
  const [categoryId, setCategoryId] = useState("");
  const [selected, setSelected] = useState([]);
  const [context, setContext] = useState([]);
  const [query, setQuery] = useState("");
  const [notInList, setNotInList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchSymptoms(), fetchConsultationMeta()])
      .then(([items, meta]) => {
        setSymptoms(items);
        if (meta?.categories?.length) setCategories(meta.categories);
        if (meta?.context?.length) setContextOptions(meta.context);
      })
      .catch(() => {
        setError("No se pudo iniciar la consulta. Espere un momento e inténtelo de nuevo.");
      });
  }, []);

  const catalog = useMemo(() => {
    const map = new Map(symptoms.map((item) => [item.id, item]));
    return map;
  }, [symptoms]);

  const currentCategory = categories.find((item) => item.id === categoryId);
  const suggested = (currentCategory?.symptoms || [])
    .map((id) => catalog.get(id))
    .filter(Boolean);

  const extraMatches = symptoms
    .filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((item) => !suggested.some((suggestedItem) => suggestedItem.id === item.id))
    .slice(0, 16);

  const goToFullSearch = () => {
    setNotInList(true);
    setCategoryId((prev) => prev || "otro");
    setStep(3);
  };

  const toggleValue = (list, value, setter) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const goDiagnose = async (nextSelected = selected, nextContext = context) => {
    setLoading(true);
    setError("");
    setStep(4);
    try {
      const data = await requestDiagnosis(nextSelected, nextContext);
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setCategoryId("");
    setSelected([]);
    setContext([]);
    setQuery("");
    setNotInList(false);
    setResult(null);
    setError("");
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <section className="consult">
      <div className="container consult-shell">
        <aside className="doctor-card">
          <Mark className="doctor-avatar" fetchPriority="high" />
          <h1 className="doctor-card__title">Orientación clínica</h1>
          <p className="doctor-card__lead">
            Le pregunto como en consultorio. Nada es obligatorio. Si hay un
            signo de alarma, le indico que acuda a emergencias.
          </p>
          <div className="progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small className="doctor-card__step">
            Paso {step + 1} de {STEPS.length}: {STEPS[step].label}
          </small>
        </aside>

        <div className="consult-main">
          <div key={step} className="step-pane">
          {step === 0 && (
            <>
              <div className="bubble">
                Buenos días, soy de Clínica Virtual. Cuénteme, ¿qué es lo que
                más le molesta hoy? Elija el motivo principal. Después
                profundizamos; no tiene que marcar todo.
              </div>
              <div className="choice-grid">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    className={`choice ${categoryId === item.id ? "is-active" : ""}`}
                    onClick={() => {
                      setCategoryId(item.id);
                      setNotInList(false);
                    }}
                    type="button"
                  >
                    <h3>{item.label}</h3>
                    <p>Empezamos por aquí y luego vemos si hace falta más.</p>
                  </button>
                ))}
                <button
                  className={`choice ${categoryId === "otro" ? "is-active" : ""}`}
                  onClick={() => {
                    setCategoryId("otro");
                    setNotInList(true);
                  }}
                  type="button"
                >
                  <h3>Mi síntoma no está acá</h3>
                  <p>Lo buscamos en el listado completo. Si tampoco aparece, seguimos igual.</p>
                </button>
              </div>
              <div className="row-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(2)}>
                  Prefiero hablar de antecedentes
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={!categoryId}
                  onClick={() => setStep(categoryId === "otro" ? 3 : 1)}
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="bubble">
                {currentCategory?.question ||
                  "¿Reconoce alguno de estos síntomas? Puede elegir varios, uno o ninguno."}
              </div>
              <div className="symptom-list">
                {suggested.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`symptom-chip ${selected.includes(item.id) ? "is-active" : ""}`}
                    onClick={() => toggleValue(selected, item.id, setSelected)}
                    title={item.description}
                  >
                    {item.name}
                  </button>
                ))}
                <button
                  type="button"
                  className={`symptom-chip ${notInList ? "is-active" : ""}`}
                  onClick={goToFullSearch}
                >
                  Mi síntoma no está acá
                </button>
              </div>
              <div className="row-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(0)}>
                  Volver
                </button>
                <button className="btn btn-ghost" type="button" onClick={goToFullSearch}>
                  Mi síntoma no está acá
                </button>
                <button className="btn btn-primary" type="button" onClick={() => setStep(2)}>
                  Seguir con lo marcado
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bubble">
                En los últimos días, ¿pasó algo que un médico preguntaría sí o sí?
                Un medicamento nuevo, una droga, alcohol, un contacto de riesgo o
                una inyección pueden cambiar por completo el enfoque.
              </div>
              <div className="symptom-list">
                {contextOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`symptom-chip ${context.includes(item.id) ? "is-active" : ""}`}
                    onClick={() => toggleValue(context, item.id, setContext)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="row-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(1)}>
                  Volver
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setStep(3)}>
                  Nada de eso
                </button>
                <button className="btn btn-primary" type="button" onClick={() => setStep(3)}>
                  Continuar
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="bubble">
                {notInList
                  ? "No hay problema. Búsquelo en español. Si tampoco aparece en el listado, pedimos orientación con lo que ya contó."
                  : "Si quiere agregar algo más, búsquelo en español. Es opcional. Si con lo que ya contó es suficiente, pedimos la orientación."}
              </div>
              <input
                className="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar otro síntoma, por ejemplo tos o mareos"
              />
              {query && extraMatches.length > 0 && (
                <div className="symptom-list">
                  {extraMatches.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`symptom-chip ${selected.includes(item.id) ? "is-active" : ""}`}
                      onClick={() => toggleValue(selected, item.id, setSelected)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
              {query && extraMatches.length === 0 && (
                <p className="empty-hint">
                  Ese síntoma no está en el listado. Puede pedir orientación
                  igual; el médico de consulta lo precisará.
                </p>
              )}
              {selected.length > 0 && (
                <p className="empty-hint">
                  Seleccionados: {selected.map((id) => catalog.get(id)?.name || id).join(", ")}
                </p>
              )}
              <div className="row-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(2)}>
                  Volver
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => goDiagnose()}
                >
                  Pedir orientación
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              {loading && (
                <div className="bubble">Estoy revisando el cuadro que me contó…</div>
              )}
              {error && (
                <div className="banner banner-uncertain">
                  <h2>No se pudo completar</h2>
                  <p>{error}</p>
                </div>
              )}
              {result && (
                <>
                  <div className={`banner banner-${result.guidance.level}`}>
                    <h2>{result.guidance.title}</h2>
                    <p>{result.guidance.message}</p>
                    <ul>
                      {result.guidance.actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  {result.context_notes?.length > 0 && (
                    <ul className="notes">
                      {result.context_notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  )}
                  {result.diagnoses?.length > 0 ? (
                    <div className="results-grid">
                      {result.diagnoses.map((disease) => (
                        <article className="result-card" key={disease.id}>
                          <DiseaseImage src={disease.image} />
                          <h3>{disease.name}</h3>
                          <span className="percent">
                            Compatibilidad {Math.round(disease.percentage * 100)}%
                          </span>
                          <p>{disease.description}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    !loading && (
                      <p className="lead">
                        No hay una hipótesis lo bastante sólida. La indicación
                        está arriba: cita o emergencias, según cómo se sienta.
                      </p>
                    )
                  )}
                </>
              )}
              <div className="row-actions">
                <button className="btn btn-primary" type="button" onClick={reset}>
                  Nueva consulta
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consulta;
