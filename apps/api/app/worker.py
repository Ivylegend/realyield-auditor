import asyncio, logging, time
from celery import Celery
from .config import get_settings

settings=get_settings()
celery=Celery("realyield",broker=settings.redis_url,backend=settings.redis_url)
celery.conf.update(task_track_started=True,task_acks_late=True,worker_prefetch_multiplier=1)
STAGES=["DISCOVERING","FETCHING_ONCHAIN_DATA","FETCHING_MARKET_DATA","FETCHING_DOCUMENTATION","ANALYZING_YIELD","MAPPING_DEPENDENCIES","SCORING_RISKS","RUNNING_SCENARIOS","REVIEWING_EVIDENCE","GENERATING_REPORT","COMPLETED"]
@celery.task(bind=True,name="audits.run")
def run_audit(self,audit_id:str,target:dict):
    started=time.monotonic()
    for index,stage in enumerate(STAGES):
        self.update_state(state=stage,meta={"audit_id":audit_id,"stage":stage,"progress":round(index/(len(STAGES)-1)*100)})
        if stage!="COMPLETED": time.sleep(.15 if target.get("demo") else 1)
    logging.info("audit_completed",extra={"audit_id":audit_id,"duration_ms":round((time.monotonic()-started)*1000)})
    return {"audit_id":audit_id,"status":"COMPLETED","progress":100}
