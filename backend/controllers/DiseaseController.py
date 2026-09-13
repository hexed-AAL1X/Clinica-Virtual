from fastapi import APIRouter

from backend.models.request.DiseaseRequest import DiseaseRequest
from backend.models.response.DiseaseResponse import DiagnosisResult
from backend.services.DiseaseService import get_consultation_meta, get_diagnosis

router = APIRouter()


@router.post("/disease", tags=["Disease Controller"], response_model=DiagnosisResult)
async def prognosis(disease: DiseaseRequest):
    return get_diagnosis(disease)


@router.get("/consultation", tags=["Disease Controller"])
async def consultation_meta():
    return get_consultation_meta()
