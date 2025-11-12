export type Severity = "low" | "medium" | "high";

export interface UXInsight {
  id: string;
  title: string;
  severity: Severity;
  metric_evidence: string;
  hypothesized_cause: string;
  recommendation: string;
  target_segment: string;
}

export interface UXInsightsResponse {
  summary: string;
  insights: UXInsight[];
}

export interface UXChatResponse {
  answer: string;
  used_insights?: string[] | null;
}

