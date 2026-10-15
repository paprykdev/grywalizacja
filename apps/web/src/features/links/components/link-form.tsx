import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { linkFormSchema, type LinkFormValues } from '../schemas';

type LinkFormProps = {
  defaultValues?: LinkFormValues;
  onSubmit: (values: LinkFormValues) => void;
  submitLabel?: string;
  isPending?: boolean;
};

export function LinkForm({
  defaultValues = { title: '', url: '', description: '' },
  onSubmit,
  submitLabel = 'Save',
  isPending = false,
}: LinkFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={!!errors.url}>
          <FieldLabel htmlFor="url">URL</FieldLabel>
          <Input
            id="url"
            type="url"
            placeholder="https://"
            aria-invalid={!!errors.url}
            {...register('url')}
          />
          <FieldError errors={[errors.url]} />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            aria-invalid={!!errors.description}
            {...register('description')}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
