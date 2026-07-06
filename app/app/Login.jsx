'use client';
import { useState } from 'react';

// Universal (shared) credentials. Override via Vercel env vars if you wish.
// NOTE: this is a client-side soft gate, not strong access control — the value
// is present in the browser bundle. Use Supabase Auth for real security.
const USER = process.env.NEXT_PUBLIC_APP_USERNAME || 'admin';
const PASS = process.env.NEXT_PUBLIC_APP_PASSWORD || 'Tanoto@2026';

export default function Login({ onSuccess }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  function submit() {
    if (u.trim().toLowerCase() === USER.toLowerCase() && p === PASS) {
      setErr('');
      onSuccess();
    } else {
      setErr('Incorrect username or password.');
    }
  }
  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="login-left-inner">
          <img className="login-logo" src="/logo-mark.png" alt="Tanoto Foundation" />
          <h1 className="login-title">Portfolio Assessment</h1>
          <p className="login-sub">
            TFID Portfolio Review — 6-Factor Strategic Assessment based on the Tanoto Foundation Workbook.
          </p>
          <div className="login-tags">
            <span>6-Factor Assessment</span>
            <span>Prioritization Matrix</span>
            <span>Analytics</span>
          </div>
        </div>
        <div className="login-brand">TANOTO FOUNDATION</div>
      </div>

      <div className="login-right">
        <div className="login-form">
          <h2>Welcome</h2>
          <p className="login-formsub">Sign in to continue to Portfolio Assessment.</p>

          <label htmlFor="lg_user">Username</label>
          <input
            id="lg_user"
            className="login-input"
            value={u}
            onChange={(e) => setU(e.target.value)}
            onKeyDown={onKey}
            placeholder="Enter your username"
            autoComplete="username"
          />

          <label htmlFor="lg_pass">
            Password
            <button type="button" className="login-show" onClick={() => setShow((s) => !s)}>
              {show ? 'Hide' : 'Show'}
            </button>
          </label>
          <input
            id="lg_pass"
            className="login-input"
            type={show ? 'text' : 'password'}
            value={p}
            onChange={(e) => setP(e.target.value)}
            onKeyDown={onKey}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className={'login-err' + (err ? ' show' : '')}>{err}</div>

          <button className="login-btn" type="button" onClick={submit}>Sign in</button>

          <p className="login-help">Use the username and password provided by your administrator.</p>
        </div>
      </div>
    </div>
  );
}
