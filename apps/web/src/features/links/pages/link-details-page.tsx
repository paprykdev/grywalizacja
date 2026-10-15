import { ArrowLeftIcon } from 'lucide-react';
import { Link as RouterLink, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api-client';
import { NotFoundPage } from '@/pages/not-found-page';

import { useLink, useUpdateLink } from '../api';
import { LinkForm } from '../components/link-form';

export function LinkDetailsPage() {
  const id = Number(useParams().id);
  const { data: link, isPending, error } = useLink(id);
  const updateLink = useUpdateLink(id);

  if (error instanceof ApiError && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="self-start">
        <RouterLink to="/links">
          <ArrowLeftIcon /> Back to links
        </RouterLink>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {link?.title ?? <Skeleton className="h-6 w-48" />}
          </CardTitle>
          {link && (
            <CardDescription>
              Created {new Date(link.createdAt).toLocaleString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">{error.message}</p>
          ) : isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <LinkForm
              // Remount the form when a different link is loaded
              key={link.id}
              defaultValues={{
                title: link.title,
                url: link.url,
                description: link.description,
              }}
              isPending={updateLink.isPending}
              onSubmit={(values) => updateLink.mutate(values)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
