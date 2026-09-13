import {
  diagnose,
  getConsultationMeta,
  getSymptoms,
} from "../engine/consultation";

const REMOTE = import.meta.env.VITE_API_URL;

async function readJson(response) {
  if (!response.ok) {
    throw new Error("No se pudo completar la consulta. Inténtelo de nuevo.");
  }
  return response.json();
}

export async function fetchSymptoms() {
  if (REMOTE) return readJson(await fetch(`${REMOTE}/symptoms`));
  return getSymptoms();
}

export async function fetchConsultationMeta() {
  if (REMOTE) return readJson(await fetch(`${REMOTE}/consultation`));
  return getConsultationMeta();
}

export async function requestDiagnosis(symptomIds, context) {
  if (!REMOTE) return diagnose(symptomIds, context);
  return readJson(
    await fetch(`${REMOTE}/disease`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptoms: symptomIds.map((name) => ({ name })),
        context,
      }),
    })
  );
}
