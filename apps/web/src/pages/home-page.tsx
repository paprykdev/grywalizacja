import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function HomePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Vite + React Router + shadcn/ui on the front, NestJS + Prisma on the
          back. API docs (Swagger) are served by the API at <code>/docs</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/links">Browse links</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
