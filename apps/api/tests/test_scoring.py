from app.scoring import Signal, calculate, severity
def test_scoring_is_deterministic():
    result=calculate([Signal("smart_contract",62,.88,4),Signal("leverage",74,.9,3),Signal("stablecoin",64,.84,3)])
    assert 0<=result["weighted_risk_score"]<=100
    assert result["confidence_adjusted_risk_score"]>=result["weighted_risk_score"]
    assert result["data_completeness_score"]==38
def test_severity_boundaries():
    assert severity(24)=="Low"; assert severity(25)=="Moderate"; assert severity(90)=="Critical"
