from typing import List
from pydantic import BaseModel, Field
from .SymptomRequest import SymptomRequest


class DiseaseRequest(BaseModel):
    symptoms: List[SymptomRequest] = Field(default_factory=list)
    context: List[str] = Field(default_factory=list)
