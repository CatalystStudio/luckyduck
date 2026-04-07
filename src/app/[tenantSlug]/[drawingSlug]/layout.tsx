import { notFound } from 'next/navigation';
import { getTenantAndDrawing } from '@/lib/drawing';
import { DrawingProvider } from '@/components/DrawingProvider';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ tenantSlug: string; drawingSlug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { tenantSlug, drawingSlug } = await params;
  const result = await getTenantAndDrawing(tenantSlug, drawingSlug);
  if (!result) return { title: 'Not Found' };

  return {
    title: `${result.drawing.heading} — ${result.tenant.name}`,
    description: result.drawing.subheading,
  };
}

export default async function DrawingLayout({ params, children }: Props) {
  const { tenantSlug, drawingSlug } = await params;
  const result = await getTenantAndDrawing(tenantSlug, drawingSlug);

  if (!result) notFound();

  return (
    <DrawingProvider tenant={result.tenant} drawing={result.drawing}>
      {children}
    </DrawingProvider>
  );
}
