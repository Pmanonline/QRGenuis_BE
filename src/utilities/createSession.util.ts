import { Session } from "../modules/sessions/session.model";

export async function createSession(
  userId: string,
  userAgent: string,
  userKind: string
) {
  const session = await Session.create({ user: userId, userAgent, userKind });

  return session.toJSON();
}
