import { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Link as RouterLink } from 'react-router';

import type { Link } from '@repo/api';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useCreateLink, useDeleteLink, useLinks } from '../api';
import { LinkForm } from '../components/link-form';

export function LinksPage() {
  const { data: links, isPending, error } = useLinks();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Links</h1>
        <CreateLinkDialog />
      </div>

      {error ? (
        <p className="text-destructive">
          Could not load links: {error.message}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 3 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : links.map((link) => <LinkRow key={link.id} link={link} />)}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function LinkRow({ link }: { link: Link }) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <RouterLink to={`/links/${link.id}`} className="hover:underline">
          {link.title}
        </RouterLink>
      </TableCell>
      <TableCell className="max-w-xs truncate">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:underline"
        >
          {link.url}
        </a>
      </TableCell>
      <TableCell>
        <DeleteLinkButton link={link} />
      </TableCell>
    </TableRow>
  );
}

function CreateLinkDialog() {
  const [open, setOpen] = useState(false);
  const createLink = useCreateLink();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon /> New link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New link</DialogTitle>
        </DialogHeader>
        <LinkForm
          submitLabel="Create"
          isPending={createLink.isPending}
          onSubmit={(values) =>
            createLink.mutate(values, { onSuccess: () => setOpen(false) })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function DeleteLinkButton({ link }: { link: Link }) {
  const deleteLink = useDeleteLink();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Delete ${link.title}`}>
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{link.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => deleteLink.mutate(link.id)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
