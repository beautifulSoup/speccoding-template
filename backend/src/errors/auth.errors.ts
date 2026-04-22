export class AuthError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class EmailAlreadyRegisteredError extends AuthError {
  constructor() {
    super('email_already_registered', 409, 'Email is already registered');
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('invalid_credentials', 401, 'Invalid email or password');
  }
}

export class InvalidEmailFormatError extends AuthError {
  constructor() {
    super('invalid_email_format', 400, 'Invalid email format');
  }
}

export class WeakPasswordError extends AuthError {
  constructor() {
    super('weak_password', 400, 'Password must be at least 8 characters and contain both letters and numbers');
  }
}

export class MissingTokenError extends AuthError {
  constructor() {
    super('missing_token', 401, 'Authentication token is missing');
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super('token_expired', 401, 'Access token has expired. Please refresh your token.');
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super('invalid_token', 401, 'Invalid authentication token');
  }
}

export class RefreshTokenExpiredError extends AuthError {
  constructor() {
    super('refresh_token_expired', 401, 'Refresh token has expired. Please login again.');
  }
}

export class RefreshTokenRevokedError extends AuthError {
  constructor() {
    super('refresh_token_revoked', 401, 'Refresh token has been revoked');
  }
}

export class TooManyAttemptsError extends AuthError {
  constructor() {
    super('too_many_attempts', 429, 'Too many failed attempts. Please try again later.');
  }
}
