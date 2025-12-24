import React from 'react';
import { AuthModalShell } from '../../components/auth/AuthModalShell';
import { RequestPasswordResetScreen } from '../../features/auth/RequestPasswordResetScreen';

export default function RequestPasswordResetRoute() {
  return (
    <AuthModalShell title="Password Reset">
      <RequestPasswordResetScreen />
    </AuthModalShell>
  );
}
