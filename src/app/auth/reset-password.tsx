import React from 'react';
import { AuthModalShell } from '../../components/auth/AuthModalShell';
import { ResetPasswordScreen } from '../../features/auth/ResetPasswordScreen';

export default function ResetPasswordRoute() {
  return (
    <AuthModalShell title="Set New Password">
      <ResetPasswordScreen />
    </AuthModalShell>
  );
}
