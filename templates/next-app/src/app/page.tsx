'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/signup');
  }, [router]);
}

export default Home;
