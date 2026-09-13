from pydantic import BaseModel


class SymptomResponse(BaseModel):
    id: str
    name: str
    description: str
    image: str
    category: str = "otros"
    category_label: str = "Otros"
