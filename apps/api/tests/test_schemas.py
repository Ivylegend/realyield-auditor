import pytest
from pydantic import ValidationError
from app.schemas import AuditCreate, AgentSynthesis
def test_target_validation():
    with pytest.raises(ValidationError): AuditCreate(type="contract",target="\x00unsafe")
def test_ai_output_rejects_unstructured_data():
    with pytest.raises(ValidationError): AgentSynthesis.model_validate({"summary":"x"})
