import engine from "./engine.json";

const EMPTY = {
  level: "uncertain",
  title: "Hace falta un poco más de información",
  message:
    "Todavía no hay un cuadro clínico suficiente para orientar un diagnóstico. Si se siente mal, lo prudente es agendar una cita o acudir a emergencias si el malestar es intenso.",
  actions: [
    "Agende una cita presencial si el malestar continúa.",
    "Si hay dolor de pecho, falta de aire, confusión o desmayo, vaya a emergencias.",
  ],
};

function infer(evidenceIds) {
  const logp = engine.priors.map((prior) => Math.log(Math.max(prior, 1e-12)));
  evidenceIds.forEach((symptom) => {
    const row = engine.present[symptom];
    if (!row) return;
    row.forEach((probability, index) => {
      logp[index] += Math.log(Math.max(probability, 1e-12));
    });
  });
  const peak = Math.max(...logp);
  const raw = logp.map((value) => Math.exp(value - peak));
  const total = raw.reduce((sum, value) => sum + value, 0);
  return engine.diagnoses.map((id, index) => [id, raw[index] / total]);
}

function rank(evidenceIds, topN = 4) {
  const evidence = new Set(evidenceIds);
  const ranked = infer(evidenceIds)
    .map(([id, probability]) => {
      const related = new Set(engine.neighbors[id] || []);
      let overlap = 0;
      related.forEach((item) => {
        if (evidence.has(item)) overlap += 1;
      });
      const coverage = evidence.size ? overlap / evidence.size : 0;
      const specificity = related.size ? overlap / related.size : 0;
      return { id, probability, overlap, coverage, specificity };
    })
    .filter((item) => item.probability > 0 && item.overlap > 0);

  ranked.sort((a, b) => {
    const scoreA = a.probability * (0.65 + 0.35 * a.coverage);
    const scoreB = b.probability * (0.65 + 0.35 * b.coverage);
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (evidence.size >= 2 && b.specificity !== a.specificity) {
      return b.specificity - a.specificity;
    }
    return b.probability - a.probability;
  });

  return ranked.slice(0, topN);
}

function buildGuidance(clinical, diagnoses, context, contextNotes) {
  const selected = new Set(clinical);
  const emergency = new Set(engine.emergencySymptoms);
  let isEmergency = clinical.some((item) => emergency.has(item));
  if (!isEmergency) {
    isEmergency = engine.emergencyCombos.some((combo) =>
      combo.every((item) => selected.has(item))
    );
  }
  if (
    context.includes("droga") &&
    ["high_fever", "chest_pain", "altered_sensorium", "coma"].some((item) =>
      selected.has(item)
    )
  ) {
    isEmergency = true;
  }

  const top = diagnoses[0]?.percentage || 0;
  const runnerUp = diagnoses[1]?.percentage || 0;
  const isolated = clinical.length <= 1;
  const skin = ["itching", "skin_rash", "red_spots_over_body", "nodal_skin_eruptions", "blister"];
  const drugContext = context.includes("medicamento") || context.includes("droga");
  const drugPicture =
    drugContext && skin.some((item) => selected.has(item)) && clinical.length >= 2;
  const unclear =
    !diagnoses.length ||
    isolated ||
    (!drugPicture && (top < 0.42 || top - runnerUp < 0.08));

  if (isEmergency) {
    return {
      level: "emergency",
      title: "Esto no debe resolverse solo con una orientación en línea",
      message:
        "Hay signos que un médico experimentado no deja pasar en casa: dolor de pecho, falta de aire, confusión, sangrado o debilidad de un lado. Esta orientación no reemplaza una evaluación de urgencia.",
      actions: [
        "Acuda ahora a emergencias o llame a una ambulancia.",
        "No conduzca si está mareado, confuso o con dolor de pecho.",
        "Lleve una lista de lo que tomó en las últimas horas, incluidos medicamentos o sustancias.",
      ],
    };
  }

  if (unclear) {
    const extra = contextNotes[0] || "";
    return {
      level: "uncertain",
      title: "El cuadro todavía no es claro",
      message:
        `Con síntomas aislados o poco específicos no se puede afirmar un diagnóstico. Puede ser algo banal o el inicio de un problema que debe verse en consulta. ${extra}`.trim(),
      actions: [
        "Si el malestar es leve y estable, agende una cita en las próximas 24 a 48 horas.",
        "Si empeora, aparece fiebre alta, dolor de pecho, vómitos persistentes o confusión, vaya a emergencias.",
        "Hidrátese, evite automedicarse y anote cómo evolucionan los síntomas.",
      ],
    };
  }

  return {
    level: "oriented",
    title: "Hay una orientación probable, no un diagnóstico definitivo",
    message:
      "El cuadro es más coherente, pero esto sigue siendo una preconsulta. Úselo para decidir con más calma si agenda una cita o acude hoy.",
    actions: [
      "Comente estas hipótesis con un médico; no inicie ni suspenda fármacos por su cuenta.",
      "Si aparecen signos de alarma (falta de aire, dolor de pecho, confusión), vaya a emergencias.",
    ],
  };
}

export function getSymptoms() {
  return engine.symptoms;
}

export function getConsultationMeta() {
  return {
    categories: engine.categories,
    context: engine.context,
  };
}

export function diagnose(symptomIds, context = []) {
  const notes = [];
  const ids = [...symptomIds];

  context.forEach((key) => {
    const info = engine.contextMap[key];
    if (!info) return;
    notes.push(info.note);
    if (info.symptom && !ids.includes(info.symptom)) ids.push(info.symptom);
  });

  const known = [...new Set(ids)].filter((id) => engine.present[id]);
  if (!known.length) {
    return {
      guidance: EMPTY,
      diagnoses: [],
      clinical_count: 0,
      context_notes: notes,
    };
  }

  const diagnoses = rank(known).map((item) => {
    const details = engine.diseases[item.id] || {};
    return {
      id: item.id,
      name: details.name || item.id,
      description: details.description || "Descripción no disponible",
      percentage: item.probability,
      image: details.image || "",
      symptoms: [],
    };
  });
  const nonClinical = new Set(engine.nonClinical);
  const clinical = known.filter((id) => !nonClinical.has(id));

  return {
    guidance: buildGuidance(clinical, diagnoses, context, notes),
    diagnoses,
    clinical_count: clinical.length,
    context_notes: notes,
  };
}
