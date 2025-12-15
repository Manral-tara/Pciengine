import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'mint' | 'blue' | 'navy';
}

export function KPICard({ title, value, icon: Icon, accent = 'mint' }: KPICardProps) {
  const accentColors = {
    mint: 'bg-[#4AFFA8]',
    blue: 'bg-[#2BBBEF]',
    navy: 'bg-[#010029]',
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`absolute left-0 top-0 h-full w-1 ${accentColors[accent]}`} />
      
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 text-gray-500">{title}</div>
          <div className="text-[#010029]" style={{ fontSize: '28px' }}>{value}</div>
        </div>
        
        <div className={`rounded-lg ${accentColors[accent]} bg-opacity-10 p-3`}>
          <Icon className="h-6 w-6" style={{ color: accent === 'mint' ? '#4AFFA8' : accent === 'blue' ? '#2BBBEF' : '#010029' }} />
        </div>
      </div>
    </div>
  );
}
