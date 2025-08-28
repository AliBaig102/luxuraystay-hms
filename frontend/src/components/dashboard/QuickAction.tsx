import React from 'react';
import { Card, CardContent } from '../ui/card';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'urgent';
}

export const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  onClick,
  variant = 'default',
}) => {
  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
        variant === 'urgent' ? 'border-red-200 bg-red-50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="flex items-center p-4">
        <div
          className={`mr-4 p-2 rounded-full ${
            variant === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};