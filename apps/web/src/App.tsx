import { useEffect, useState } from 'react';

import type { Link } from '@repo/api';
import { Button } from '@repo/ui/button';

function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/links')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Link[]>;
      })
      .then(setLinks)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main>
      <h1>Grywalizacja</h1>

      {error ? (
        <p className="muted">
          Could not load links ({error}). Is the API running on port 3000?
        </p>
      ) : (
        <ul>
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.title}
              </a>
              <span className="muted"> — {link.description}</span>
            </li>
          ))}
        </ul>
      )}

      <Button appName="web">Open alert</Button>
    </main>
  );
}

export default App;
