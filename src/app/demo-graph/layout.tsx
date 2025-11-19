import AppLayout from '@/components/AppLayout';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

