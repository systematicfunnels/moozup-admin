import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function ModerationPage() {
  return (
    <div>
      <PageHeader 
        title="Moderation" 
        description="Review and moderate content across the platform."
      />
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border-subtle p-4 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Pending Approval</h3>
            <Badge intent="warning">0 Items</Badge>
          </div>
          <div className="py-12 text-center">
            <p className="text-slate-500 text-sm">Your moderation queue is empty. Good job!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
