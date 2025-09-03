import React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';

// Skeleton para KPIs
export const KPISkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
    {[1, 2, 3, 4, 5, 6].map((index) => (
      <Card key={index} className="bg-theme-surface shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} className="mt-2" />
            </div>
            <Skeleton variant="circular" width={40} height={40} />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Skeleton para gráficos
export const ChartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    {[1, 2].map((index) => (
      <Card key={index} className="bg-theme-surface shadow-sm">
        <CardContent className="p-4">
          <Skeleton variant="text" width="30%" height={24} className="mb-4" />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Skeleton para tablas
export const TableSkeleton = () => (
  <Card className="bg-theme-surface shadow-sm">
    <CardContent className="p-4">
      <Skeleton variant="text" width="25%" height={24} className="mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={14} />
            </div>
            <Skeleton variant="text" width="20%" height={16} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Skeleton completo del dashboard
export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    <KPISkeleton />
    <ChartSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TableSkeleton />
      <TableSkeleton />
    </div>
  </div>
);

export default DashboardSkeleton; 
