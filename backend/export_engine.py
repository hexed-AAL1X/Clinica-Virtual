"""Exporta el motor y el catálogo para que el front funcione sin API (Vercel)."""

import json
from pathlib import Path

from backend.services.DiseaseService import (
    _get_model,
    load_disease_data,
)
from backend.services.SymptomService import get_symptoms
from backend.shared.catalog import (
    CATEGORIES,
    CONTEXT_MAP,
    DISEASE_LABELS,
    EMERGENCY_COMBOS,
    EMERGENCY_SYMPTOMS,
    NON_CLINICAL,
)
from backend.src.algorithm.inference import calculate_probabilities

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "frontend" / "SymptoTrack" / "src" / "engine" / "engine.json"


def main() -> None:
    model = _get_model()
    diagnosis_values, diagnosis_probs, symptom_probs = calculate_probabilities(
        model["dataframe"]
    )
    graph = model["graph"]
    disease_data = load_disease_data()

    present = {
        symptom: [float(table[1][j]) for j in range(len(diagnosis_values))]
        for symptom, table in symptom_probs.items()
    }
    neighbors = {
        str(disease): sorted(graph.successors(disease))
        for disease in diagnosis_values
        if disease in graph
    }
    diseases = {}
    for disease in diagnosis_values:
        details = disease_data.get(disease, {})
        diseases[str(disease)] = {
            "name": DISEASE_LABELS.get(disease, str(disease)),
            "description": details.get("descripcion", "Descripción no disponible"),
            "image": details.get("imagen", ""),
        }

    payload = {
        "diagnoses": [str(item) for item in diagnosis_values],
        "priors": [float(item) for item in diagnosis_probs],
        "present": present,
        "neighbors": neighbors,
        "diseases": diseases,
        "symptoms": [item.model_dump() for item in get_symptoms()],
        "categories": [
            {
                "id": key,
                "label": value["label"],
                "question": value["question"],
                "symptoms": value["symptoms"],
            }
            for key, value in CATEGORIES.items()
        ],
        "context": [
            {"id": key, "label": value["label"]} for key, value in CONTEXT_MAP.items()
        ],
        "contextMap": {
            key: {"symptom": value["symptom"], "note": value["note"]}
            for key, value in CONTEXT_MAP.items()
        },
        "emergencySymptoms": sorted(EMERGENCY_SYMPTOMS),
        "emergencyCombos": [sorted(combo) for combo in EMERGENCY_COMBOS],
        "nonClinical": sorted(NON_CLINICAL),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
