import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3 text-lg">Loading transaction form...</span>
      </div>
    </div>
  );
}
