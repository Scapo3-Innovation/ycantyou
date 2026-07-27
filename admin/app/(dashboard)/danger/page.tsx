import { DangerPanel } from '@/components/DangerPanel';

export default function DangerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Danger zone</h1>
      <DangerPanel />
    </div>
  );
}
