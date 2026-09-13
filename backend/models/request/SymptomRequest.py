from pydantic import BaseModel
from pydantic import Field

class SymptomRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
