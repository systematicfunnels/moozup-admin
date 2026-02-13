import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader 
        title="Settings" 
        description="Configure platform-wide settings and administrative preferences."
      />
      <div className="max-w-2xl">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Platform Configuration</h3>
              <p className="text-sm text-slate-500 italic">Settings are currently managed via the backend configuration files.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
