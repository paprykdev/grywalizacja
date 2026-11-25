import * as argon2 from 'argon2';

export function hashPassword(plain: string) {
  // argon2id is the recommended variant for password hashing
  return argon2.hash(plain, { type: argon2.argon2id });
}

export function verifyPassword(hash: string, plain: string) {
  return argon2.verify(hash, plain);
}
