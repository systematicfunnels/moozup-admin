import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { useEventContext } from '../context/EventContext';
import { useFeatureSettings, useUpdateFeatureSetting } from '../hooks/useApi';
import { Switch } from '../components/ui/Switch';
import type { FeatureTabSetting } from '../types/api';

export default function SettingsPage() {
  const { selectedEventId } = useEventContext();
  const { data: featureSettings, isLoading, isError } = useFeatureSettings(selectedEventId || undefined);
  const updateFeatureSetting = useUpdateFeatureSetting();

  const handleToggle = (setting: FeatureTabSetting) => {
    updateFeatureSetting.mutate({
      eventId: setting.eventId,
      EventTabs: setting.EventTabs,
      isActive: !setting.isActive,
      icon: setting.icon,
      filledIcon: setting.filledIcon,
      text: setting.text,
      order: setting.order,
      userId: setting.userId
    });
  };

  return (
    <div>
      <PageHeader 
        title="Settings" 
        description="Configure platform-wide settings and administrative preferences."
      />

      {selectedEventId ? (
        <div className="max-w-2xl mb-8">
          <Card>
            <CardContent className="pt-6">
               <h3 className="text-lg font-semibold text-slate-900 mb-4">Event Features</h3>
               <p className="text-sm text-slate-500 mb-6">Enable or disable features for the selected event.</p>
               
               {isLoading ? (
                 <div className="text-center py-4">Loading settings...</div>
               ) : isError ? (
                 <div className="text-red-500">Error loading settings.</div>
               ) : (
                 <div className="space-y-4">
                   {featureSettings?.map((setting) => (
                     <div key={setting.id} className="flex items-center justify-between py-3 border-b last:border-0 border-slate-100">
                       <div className="flex items-center gap-3">
                         <span className="font-medium text-slate-900">{setting.EventTabs}</span>
                       </div>
                       <Switch 
                         checked={setting.isActive}
                         onCheckedChange={() => handleToggle(setting)}
                         disabled={updateFeatureSetting.isPending}
                       />
                     </div>
                   ))}
                   {(!featureSettings || featureSettings.length === 0) && (
                     <div className="text-slate-500 italic">No feature settings found for this event.</div>
                   )}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-2xl mb-8">
           <Card>
            <CardContent className="pt-6">
              <div className="text-amber-600 bg-amber-50 p-4 rounded-md">
                Please select an event from the top bar to configure event-specific features.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
