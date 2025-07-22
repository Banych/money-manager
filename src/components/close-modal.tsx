'use client';

import { DialogClose } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function CloseModal() {
  const { back } = useRouter();

  return <DialogClose onClick={() => back()} />;
}
