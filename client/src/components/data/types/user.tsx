export interface UserModel {
  id: number;
  secondName: string;
  firstName: string;
  surName: string;
  emailAddress: string;
  phoneNumber?: string;
  tin?: string;
  login: string;
  lastLoginAt?: string;
  passportId?: number;
  snilsId?: number;
  keycloakId: string;
}