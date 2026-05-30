'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ShopClient } from '../../ShopClient';

// Route-based category view, e.g. /shop/c/tools — renders the shop list
// pre-filtered to the category slug.
export default function ShopCategoryPage() {
  const params = useParams<{ category: string }>();
  const category = Array.isArray(params?.category) ? params.category[0] : params?.category;
  return (
    <Suspense>
      <ShopClient categorySlug={category} />
    </Suspense>
  );
}
