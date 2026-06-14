import { APP_VERSION } from '@/lib/version';

export default function VersionBadge() {
  return (
    <div className="fixed bottom-2 right-2 text-[10px] text-mocha/30 select-none pointer-events-none z-50">
      v{APP_VERSION}
    </div>
  );
}
