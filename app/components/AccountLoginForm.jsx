import {Form, Link} from '@remix-run/react';
import {useState} from 'react';

/**
 * @param {LoginFormProps}
 */
export function AccountLoginForm({callbackUrl, error}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1 className="login-title">Sign in to your account</h1>

        {error ? (
          <div className="login-error">
            <p>{error}</p>
          </div>
        ) : null}

        <Form method="post" noValidate className="login-form">
          {callbackUrl ? (
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
          ) : null}

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <div className="login-input-wrapper">
              <i className="fas fa-envelope login-input-icon"></i>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrapper">
              <i className="fas fa-lock login-input-icon"></i>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Password"
                aria-label="Password"
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="login-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/account/recover" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="login-actions">
            <button type="submit" className="login-button">
              Sign in
            </button>
          </div>
        </Form>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <Link to="/account/register" className="register-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * @typedef {Object} LoginFormProps
 * @property {string} [callbackUrl]
 * @property {string} [error]
 */
