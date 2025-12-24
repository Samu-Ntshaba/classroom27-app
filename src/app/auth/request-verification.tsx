import React from 'react';
import { AuthModalShell } from '../../components/auth/AuthModalShell';
import { RequestVerificationScreen } from '../../features/auth/RequestVerificationScreen';

export default function RequestVerificationRoute() {
  return (
    <AuthModalShell title="Verify your email">
      <RequestVerificationScreen />
    </AuthModalShell>
  );
}
