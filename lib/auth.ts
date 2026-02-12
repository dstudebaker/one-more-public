import { fetchAuthSession } from "aws-amplify/auth";

export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    return token || null;
  } catch {
    return null;
  }
}
