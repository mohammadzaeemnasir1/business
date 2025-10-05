import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function RootPage() {
  const session = await auth();
  if (session) {
    redirect('/customers');
  } else {
    redirect('/login');
  }
}
