import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function CreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/classrooms/create');
  }, [router]);

  return null;
}
