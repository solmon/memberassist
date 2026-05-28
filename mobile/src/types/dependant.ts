export interface DependantCard {
  cardholderName: string;
  memberIdNumber: string;
  groupNumber: string;
  planName: string;
  effectiveDate: string;
  terminationDate: string | null;
}

export interface Dependant {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  isActive: boolean;
  coverageStatus: string;
  digitalCard: DependantCard | null;
}
