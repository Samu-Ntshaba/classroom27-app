import React from 'react';
import { AuthModalShell } from '../../components/auth/AuthModalShell';
import { VerifyEmailScreen } from '../../features/auth/VerifyEmailScreen';

export default function VerifyEmailRoute() {
  return (
    <AuthModalShell title="Email Verification">
      <VerifyEmailScreen />
    </AuthModalShell>
  );
}
