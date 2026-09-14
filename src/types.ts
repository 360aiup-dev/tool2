export type IndustryType =
  | "製造業"
  | "餐飲服務業"
  | "零售業"
  | "醫療院所"
  | "長照機構"
  | "其他";

export type CompanySizeType = "5人以下" | "5-30人" | "31-100人" | "100人以上";

export interface DiagnosisFormData {
  industry: IndustryType;
  size: CompanySizeType;
  issue: string;
}

export interface ContactFormData {
  company: string;
  name: string;
  phone: string;
  email: string;
  industry?: string;
  size?: string;
  issue?: string;
  aiResult?: string;
}

export interface DiagnosisResponse {
  success: boolean;
  report: string;
  error?: string;
  message?: string;
}
