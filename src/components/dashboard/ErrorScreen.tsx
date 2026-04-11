import React from 'react';
import { SadFaceIcon } from '../icons';
import { MESSAGES } from '../../constants/messages';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorScreen = React.memo(function ErrorScreen({ error, onRetry }: ErrorScreenProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-surface-background flex items-center justify-center p-4">
      <div className="bg-surface rounded-[28px] shadow-card p-12 text-center max-w-md border border-neutral-100">
        <div className="mb-6 flex justify-center">
          <SadFaceIcon className="w-20 h-20" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">{MESSAGES.ERROR.CONNECTION_FAILED}</h2>
        <p className="text-red-500 mb-6">{error}</p>
        <p className="text-neutral-500 text-sm mb-6">{MESSAGES.ERROR.CONFIG_CHECK}</p>
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="bg-brand-500 text-white font-bold py-3 px-6 rounded-button hover:bg-brand-600 shadow-card"
        >
          {MESSAGES.ACTION.RETRY}
        </button>
      </div>
    </div>
  );
});
