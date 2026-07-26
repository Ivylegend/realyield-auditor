export type AuditStatus =
  | "QUEUED" | "DISCOVERING" | "FETCHING_ONCHAIN_DATA" | "FETCHING_MARKET_DATA"
  | "FETCHING_DOCUMENTATION" | "ANALYZING_YIELD" | "MAPPING_DEPENDENCIES"
  | "SCORING_RISKS" | "RUNNING_SCENARIOS" | "REVIEWING_EVIDENCE"
  | "GENERATING_REPORT" | "COMPLETED" | "FAILED" | "PARTIALLY_COMPLETED"
  | "CANCELLED";
export interface SourceRecord { sourceName:string; url?:string; retrievedAt:string; dataType:string; confidence:number; value?:unknown; error?:string; freshness:string }
