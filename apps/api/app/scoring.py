from dataclasses import dataclass

WEIGHTS={"smart_contract":.14,"upgradeability":.08,"oracle":.09,"stablecoin":.12,"liquidity":.10,"exit":.10,"leverage":.12,"counterparty":.08,"governance":.07,"data_quality":.10}
@dataclass(frozen=True)
class Signal: category:str; score:int; confidence:float; evidence_count:int
def severity(score:int)->str:
    return "Low" if score<25 else "Moderate" if score<50 else "Elevated" if score<70 else "High" if score<90 else "Critical"
def calculate(signals:list[Signal])->dict:
    by_category={s.category:s for s in signals}
    present_weight=sum(WEIGHTS[k] for k in by_category if k in WEIGHTS)
    weighted=sum(by_category[k].score*WEIGHTS[k] for k in by_category if k in WEIGHTS)/present_weight if present_weight else 0
    confidence=sum(by_category[k].confidence*WEIGHTS[k] for k in by_category if k in WEIGHTS)/present_weight if present_weight else 0
    completeness=min(100,round(present_weight*100))
    adjusted=min(100,round(weighted+(1-confidence)*20+(1-present_weight)*15))
    return {"weighted_risk_score":round(weighted),"confidence_adjusted_risk_score":adjusted,"data_completeness_score":completeness,"confidence":round(confidence*100),"severity":severity(adjusted)}
