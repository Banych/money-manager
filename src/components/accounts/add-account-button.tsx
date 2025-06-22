'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import AddAccountForm from './add-account-form';

export default function AddAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          asChild
          size={null}
          variant="ghost"
        >
          <Card className="flex min-h-[158px] grow items-end justify-start rounded-xl bg-gray-50 px-6 transition-shadow hover:shadow-md">
            <CardContent className="flex w-full grow items-center justify-center gap-2 text-gray-500">
              <Plus className="size-5" />
              Add Account
            </CardContent>
          </Card>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Financial Account</DialogTitle>
          <DialogDescription>
            Create a new account to track your finances.
          </DialogDescription>
        </DialogHeader>
        <AddAccountForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
