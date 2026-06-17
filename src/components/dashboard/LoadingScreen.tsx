import { memo } from 'react';
import type { ReactElement } from 'react';
import { MESSAGES } from '../../constants/messages';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = memo(function LoadingScreen({ message = MESSAGES.LOADING.DEFAULT }: LoadingScreenProps): ReactElement {
  return (
    <div className="flex-1 bg-surface-background grid place-items-center p-4">
      <div className="bg-surface rounded-[28px] shadow-card p-12 text-center border border-neutral-100">
        <img src="/duo-owl.svg" alt="Duo" width="96" height="96" className="w-24 h-24 mx-auto mb-6 animate-bounce" />
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">{message}</h2>
        <p className="text-neutral-500">{MESSAGES.LOADING.CONNECTING}</p>
      </div>
    </div>
  );
});
