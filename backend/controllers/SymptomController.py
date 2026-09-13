from typing import List

from fastapi import APIRouter

from backend.models.response.SymptomResponse import SymptomResponse
from backend.services.SymptomService import get_symptoms

router = APIRouter()


@router.get("/symptoms", tags=["Symptom Controller"], response_model=List[SymptomResponse])
async def symptoms():
    return get_symptoms()
