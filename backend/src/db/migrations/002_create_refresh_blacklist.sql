-- Up
CREATE TABLE IF NOT EXISTS refresh_token_blacklist (
  jti        TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blacklist_expires ON refresh_token_blacklist(expires_at);

-- Down
DROP TABLE IF EXISTS refresh_token_blacklist;
