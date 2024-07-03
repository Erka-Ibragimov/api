import { sign, verify } from "jsonwebtoken";

type IPayload = {
  id: number;
  email: string;
};

export const generateTokens = (payload: IPayload) => {
  const accessToken = sign(payload, process.env.ACCESSTOKEN as string, { expiresIn: "600s" });
  const refreshToken = sign(payload, process.env.REFRESHTOKEN as string, { expiresIn: "30d" });
  return {
    accessToken,
    refreshToken,
  };
};
export const validateAccesseToken = (token: string): any => {
  try {
    const userData = verify(token, process.env.ACCESSTOKEN as string);
    return userData;
  } catch (e) {
    return null;
  }
};
export const validateRefreshToken = (token: string) => {
  try {
    const userData = verify(token, process.env.REFRESHTOKEN as string);
    return userData;
  } catch (e) {
    return null;
  }
};
