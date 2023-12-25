import pgPromise from 'pg-promise';

const pg = pgPromise()('postgres://postgres:postgres@localhost/postgres');

/*
 * Get access token.
 */

interface AccessToken {
  accessToken: string;
  clientId: string;
  expires: Date;
  userId: string;
}

export async function getAccessToken(bearerToken: string): Promise<AccessToken | undefined> {
  const result = await pg.query(
    'SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE access_token = $1',
    [bearerToken]
  );

  const token = result.rows[0];

  return token
    ? {
        accessToken: token.access_token,
        clientId: token.client_id,
        expires: token.expires,
        userId: token.user_id,
      }
    : undefined;
}

/**
 * Get client.
 */

interface OAuthClient {
  clientId: string;
  clientSecret: string;
}

export async function getClient(clientId: string, clientSecret: string): Promise<OAuthClient | undefined> {
  const result = await pg.query(
    'SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE client_id = $1 AND client_secret = $2',
    [clientId, clientSecret]
  );

  const oAuthClient = result.rows[0];

  return oAuthClient
    ? {
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret,
      }
    : undefined;
}

/**
 * Get refresh token.
 */

interface RefreshToken {
  accessToken: string;
  access_token_expires_on: Date;
  client_id: string;
  refreshToken: string;
  refresh_token_expires_on: Date;
  user_id: string;
}

export async function getRefreshToken(bearerToken: string): Promise<RefreshToken | false> {
  const result = await pg.query(
    'SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE refresh_token = $1',
    [bearerToken]
  );

  return result.rowCount ? (result.rows[0] as RefreshToken) : false;
}

/*
 * Get user.
 */

interface User {
  id: string;
}

export async function getUser(username: string, password: string): Promise<User | false> {
  const result = await pg.query('SELECT id FROM users WHERE username = $1 AND password = $2', [username, password]);

  return result.rowCount ? (result.rows[0] as User) : false;
}

/**
 * Save token.
 */

interface Token {
  accessToken: string;
  accessTokenExpiresOn: Date;
  refreshToken: string;
  refreshTokenExpiresOn: Date;
}

export async function saveAccessToken(
  token: Token,
  client: { id: string },
  user: { id: string }
): Promise<false | { accessToken: string; accessTokenExpiresOn: Date; refreshToken: string; refreshTokenExpiresOn: Date }> {
  const result = await pg.query(
    'INSERT INTO oauth_tokens(access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [token.accessToken, token.accessTokenExpiresOn, client.id, token.refreshToken, token.refreshTokenExpiresOn, user.id]
  );

  return result.rowCount ? result.rows[0] : false;
}
