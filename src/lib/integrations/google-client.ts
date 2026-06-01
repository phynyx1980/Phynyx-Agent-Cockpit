import { google } from "googleapis";

// Baut einen authentifizierten Google OAuth2-Client aus einem Access Token
export function getGoogleClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ access_token: accessToken });
  return auth;
}
