export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  tob?: string;
  pob?: string;
  gender: 'male' | 'female';
  createdAt: Date;
}
