import type { ComponentType } from 'react';

interface KPICardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change: string;
}

export const KPICard = ({ icon: Icon, label, value, change }: KPICardProps) => (
  <div className="card-elevated p-lg">
    <div className="flex items-start justify-between mb-lg">
      <h3 className="font-medium text-sm text-muted-foreground">{label}</h3>
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <p className="text-2xl font-bold mb-sm">{value}</p>
    <p className="text-xs text-muted-foreground">{change}</p>
  </div>
);
