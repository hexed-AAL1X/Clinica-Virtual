from typing import List
from pydantic import BaseModel
from .SymptomResponse import SymptomResponse


class DiseaseResponse(BaseModel):
    id: str
    name: str
    description: str
    image: str
    percentage: float
    symptoms: List[SymptomResponse]


class GuidanceResponse(BaseModel):
    level: str
    title: str
    message: str
    actions: List[str]


class DiagnosisResult(BaseModel):
    guidance: GuidanceResponse
    diagnoses: List[DiseaseResponse]
    clinical_count: int
    context_notes: List[str]
