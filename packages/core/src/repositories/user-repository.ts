import { UserProfile } from '../entities/user';

export interface IUserRepository {
  getUser(uid: string): Promise<UserProfile | null>;
  saveUser(uid: string, data: Partial<UserProfile>): Promise<void>;
  updateUser(uid: string, data: Partial<UserProfile>): Promise<void>;
  createUser(uid: string, data: UserProfile): Promise<void>;
  listUsers(limitCount?: number): Promise<UserProfile[]>;
}
