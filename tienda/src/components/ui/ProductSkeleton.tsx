import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSkeletonProps {
  count?: number;
  variant?: 'grid' | 'list';
  showCategory?: boolean;
}

const ProductSkeletonCard = ({ variant = 'grid', showCategory = false }: { variant?: 'grid' | 'list'; showCategory?: boolean }) => {
  if (variant === 'list') {
    return (
      <Card className="mb-4 animate-pulse">
        <CardContent className="p-4 flex items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-9 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 animate-pulse">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Skeleton className="w-full h-80 object-cover" />
          <div className="absolute top-4 right-4">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
        <div className="p-6 space-y-3">
          {showCategory && (
            <Skeleton className="h-4 w-24" />
          )}
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ 
  count = 6, 
  variant = 'grid',
  showCategory = false 
}) => {
  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <ProductSkeletonCard key={index} variant="list" showCategory={showCategory} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeletonCard key={index} variant="grid" showCategory={showCategory} />
      ))}
    </div>
  );
};

// Skeleton para categorías
export const CategorySkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-0 shadow-sm animate-pulse">
          <CardContent className="p-6 text-center">
            <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Skeleton para la página principal
export const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header skeleton */}
      <div className="bg-white px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center space-x-2 max-w-md mx-auto">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="flex-1 h-12 rounded-md" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Hero section skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>

        {/* Categories skeleton */}
        <CategorySkeleton />

        {/* Products by category skeleton */}
        <div className="space-y-16">
          {Array.from({ length: 3 }).map((_, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="text-center mb-8">
                <Skeleton className="h-8 w-48 mx-auto mb-4" />
                <Skeleton className="w-16 h-px mx-auto" />
              </div>
              <ProductSkeleton count={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;