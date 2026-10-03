import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageContainer } from "@/components/shared";

export default function NotFound() {
  return (
    <PageContainer size="narrow" className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={<FileQuestion />}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <>
            <Button asChild size="sm">
              <Link href="/problems">Browse problems</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/">Home</Link>
            </Button>
          </>
        }
      />
    </PageContainer>
  );
}
