import { createSession } from "./createSession.util";
import { generateAccessAndRefreshToken } from "./generateAccessAndRefreshToken.util";

export const createSessionAndSendTokens = async (options: {
  user: any;
  userAgent: string;
  role: string;
  message: string;
}) => {
  const { user, userAgent, role, message } = options;

  // 1. Persist a session record
  const session = await createSession(user._id.toString(), userAgent, role);

  // 2. Sign JWTs (session id is added to the payload)
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(
    user,
    session._id,
    role
  );

  return {
    status: "success",
    message,
    user,
    accessToken,
    refreshToken,
  };
};
