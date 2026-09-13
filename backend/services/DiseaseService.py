import json
import os
from typing import List

from fastapi import HTTPException

from backend.src.algorithm.inference import (
    calculate_probabilities,
    infer_diagnosis_with_fallback,
    symptoms_to_evidence,
)
from backend.models.request.DiseaseRequest import DiseaseRequest
from backend.models.response.DiseaseResponse import (
    DiagnosisResult,
    DiseaseResponse,
    GuidanceResponse,
)
from backend.shared.catalog import (
    CATEGORIES,
    CONTEXT_MAP,
    EMERGENCY_COMBOS,
    EMERGENCY_SYMPTOMS,
    NON_CLINICAL,
    label_disease,
)
from backend.src.data.dataframe import load_dataframe
from backend.src.graph.create_graph import create_graph

SYMPTOM_FILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "shared", "data", "symptom.json")
)
DISEASE_FILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "shared", "data", "disease.json")
)

_MODEL = {}


def _get_model():
    if not _MODEL:
        dataframe = load_dataframe()
        _MODEL["dataframe"] = dataframe
        _MODEL["graph"] = create_graph(dataframe)
        _MODEL["probs"] = calculate_probabilities(dataframe)
        _MODEL["symptoms"] = load_symptom_data()
    return _MODEL


def load_symptom_data():
    with open(SYMPTOM_FILE_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def load_disease_data():
    with open(DISEASE_FILE_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def get_diagnosis(payload: DiseaseRequest) -> DiagnosisResult:
    model = _get_model()
    symptom_ids = [item.name for item in payload.symptoms if item.name]
    context_notes = []

    for key in payload.context:
        info = CONTEXT_MAP.get(key)
        if not info:
            continue
        context_notes.append(info["note"])
        if info["symptom"] and info["symptom"] not in symptom_ids:
            symptom_ids.append(info["symptom"])

    unique_ids = list(dict.fromkeys(symptom_ids))
    if not unique_ids:
        return DiagnosisResult(
            guidance=GuidanceResponse(
                level="uncertain",
                title="Hace falta un poco más de información",
                message=(
                    "Todavía no hay un cuadro clínico suficiente para orientar un diagnóstico. "
                    "Si se siente mal, lo prudente es agendar una cita o acudir a emergencias "
                    "si el malestar es intenso."
                ),
                actions=[
                    "Agende una cita presencial si el malestar continúa.",
                    "Si hay dolor de pecho, falta de aire, confusión o desmayo, vaya a emergencias.",
                ],
            ),
            diagnoses=[],
            clinical_count=0,
            context_notes=context_notes,
        )

    unknown = [item for item in unique_ids if item not in model["symptoms"]]
    if unknown:
        raise HTTPException(
            status_code=400,
            detail="Hay síntomas que no reconocemos. Revise la consulta e inténtelo de nuevo.",
        )

    diagnosis_values, diagnosis_probs, symptom_probs = model["probs"]
    evidence = symptoms_to_evidence(unique_ids)
    ranked = infer_diagnosis_with_fallback(
        evidence,
        diagnosis_values,
        diagnosis_probs,
        symptom_probs,
        graph=model["graph"],
    )
    diagnoses = symptoms_by_disease(ranked, load_disease_data())
    clinical = [item for item in unique_ids if item not in NON_CLINICAL]
    guidance = build_guidance(clinical, diagnoses, payload.context, context_notes)
    return DiagnosisResult(
        guidance=guidance,
        diagnoses=diagnoses,
        clinical_count=len(clinical),
        context_notes=context_notes,
    )


def symptoms_by_disease(diagnosis_list, disease_data) -> List[DiseaseResponse]:
    response = []
    for item in diagnosis_list or []:
        response.append(add_diagnosis(item, disease_data))
    return response


def add_diagnosis(diagnosis, disease_data) -> DiseaseResponse:
    disease_id = diagnosis[0]
    details = disease_data.get(
        disease_id, {"descripcion": "Descripción no disponible", "imagen": ""}
    )
    return DiseaseResponse(
        id=disease_id,
        name=label_disease(disease_id),
        description=details.get("descripcion", "Descripción no disponible"),
        percentage=float(diagnosis[1]),
        image=details.get("imagen", ""),
        symptoms=[],
    )


def build_guidance(clinical, diagnoses, context, context_notes) -> GuidanceResponse:
    selected = set(clinical)
    is_emergency = bool(selected & EMERGENCY_SYMPTOMS) or any(
        combo.issubset(selected) for combo in EMERGENCY_COMBOS
    )
    if "droga" in context and selected & {"high_fever", "chest_pain", "altered_sensorium", "coma"}:
        is_emergency = True

    top = diagnoses[0].percentage if diagnoses else 0
    runner_up = diagnoses[1].percentage if len(diagnoses) > 1 else 0
    isolated = len(clinical) <= 1
    skin = selected & {
        "itching",
        "skin_rash",
        "red_spots_over_body",
        "nodal_skin_eruptions",
        "blister",
    }
    drug_context = bool({"medicamento", "droga"} & set(context))
    drug_picture = drug_context and bool(skin) and len(clinical) >= 2
    unclear = (
        not diagnoses
        or isolated
        or (not drug_picture and (top < 0.42 or (top - runner_up) < 0.08))
    )

    if is_emergency:
        return GuidanceResponse(
            level="emergency",
            title="Esto no debe resolverse solo con una orientación en línea",
            message=(
                "Hay signos que un médico experimentado no deja pasar en casa: "
                "dolor de pecho, falta de aire, confusión, sangrado o debilidad de un lado. "
                "Esta orientación no reemplaza una evaluación de urgencia."
            ),
            actions=[
                "Acuda ahora a emergencias o llame a una ambulancia.",
                "No conduzca si está mareado, confuso o con dolor de pecho.",
                "Lleve una lista de lo que tomó en las últimas horas, incluidos medicamentos o sustancias.",
            ],
        )

    if unclear:
        extra = " ".join(context_notes[:1])
        return GuidanceResponse(
            level="uncertain",
            title="El cuadro todavía no es claro",
            message=(
                "Con síntomas aislados o poco específicos no se puede afirmar un diagnóstico. "
                "Puede ser algo banal o el inicio de un problema que debe verse en consulta. "
                f"{extra}"
            ).strip(),
            actions=[
                "Si el malestar es leve y estable, agende una cita en las próximas 24 a 48 horas.",
                "Si empeora, aparece fiebre alta, dolor de pecho, vómitos persistentes o confusión, vaya a emergencias.",
                "Hidrátese, evite automedicarse y anote cómo evolucionan los síntomas.",
            ],
        )

    return GuidanceResponse(
        level="oriented",
        title="Hay una orientación probable, no un diagnóstico definitivo",
        message=(
            "El cuadro es más coherente, pero esto sigue siendo una preconsulta. "
            "Úselo para decidir con más calma si agenda una cita o acude hoy."
        ),
        actions=[
            "Comente estas hipótesis con un médico; no inicie ni suspenda fármacos por su cuenta.",
            "Si aparecen signos de alarma (falta de aire, dolor de pecho, confusión), vaya a emergencias.",
        ],
    )


def get_consultation_meta():
    return {
        "categories": [
            {"id": key, "label": value["label"], "question": value["question"], "symptoms": value["symptoms"]}
            for key, value in CATEGORIES.items()
        ],
        "context": [
            {"id": key, "label": value["label"]}
            for key, value in CONTEXT_MAP.items()
        ],
    }
