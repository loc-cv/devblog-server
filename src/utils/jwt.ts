import jwt, { SignOptions } from 'jsonwebtoken';
import config from 'config';

export const signJwt = (
  payload: Record<string, unknown>,
  key: 'accessTokenPrivateKey' | 'refreshTokenPrivateKey',
  options: SignOptions = {},
) => {
  const privateKey = Buffer.from(config.get<string>(key), 'base64').toString(
    'ascii',
  );
  return jwt.sign(
    { ...payload, iat: Math.floor(Date.now() / 1000) },
    privateKey,
    { ...(options && options), algorithm: 'RS256' },
  );
};

export const verifyJwt = <T>(
  token: string,
  key: 'accessTokenPublicKey' | 'refreshTokenPublicKey',
): T | null => {
  try {
    const publicKey = Buffer.from(config.get<string>(key), 'base64').toString(
      'ascii',
    );
    return jwt.verify(token, publicKey) as T;
  } catch (error) {
    console.log(error);
    return null;
  }
};
