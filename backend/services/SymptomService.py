import json
import os
from typing import List

from backend.models.response.SymptomResponse import SymptomResponse
from backend.shared.catalog import category_of, label_symptom

SYMPTOM_FILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "shared", "data", "symptom.json")
)


def load_symptom_data():
    with open(SYMPTOM_FILE_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def get_symptoms() -> List[SymptomResponse]:
    symptom_data = load_symptom_data()
    items = []
    for symptom_id, details in symptom_data.items():
        category, category_label = category_of(symptom_id)
        items.append(
            SymptomResponse(
                id=symptom_id,
                name=label_symptom(symptom_id),
                description=details.get("descripcion", "Descripción no disponible"),
                image=details.get("imagen", ""),
                category=category,
                category_label=category_label,
            )
        )
    return items
