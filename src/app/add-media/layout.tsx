import AppLayout from '@/components/AppLayout';

export default function AddMediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

