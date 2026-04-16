import { SplashLoader } from './SplashLoader';

interface FullPageSpinnerProps {
  message?: string;
}

export function FullPageSpinner({ message }: FullPageSpinnerProps) {
  return <SplashLoader message={message} />;
}
