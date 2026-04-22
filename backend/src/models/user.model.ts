export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: number;
  email: string;
}

export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
  };
}
