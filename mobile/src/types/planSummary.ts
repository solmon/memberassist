export interface PlanSummary {
  id: string;
  planName: string;
  planType: string;
  planTier: string;
  groupNumber: string;
  effectiveDate: string;
  terminationDate: string | null;
  nextRenewalDate: string | null;
  status: string;
  monthlyPremium: number;
  deductibleLimit: number | null;
  deductibleMet: number | null;
  memberIdNumber: string;
  firstName: string;
  lastName: string;
}
