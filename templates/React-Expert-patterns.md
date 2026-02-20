# Skill : Architecture React Expert (2025) - Web Dev Strategist Edition

Ce document définit les standards de développement pour tous les composants React générés par les agents.

## 1. Standards de Structure

* **Composants Fonctionnels :** Utilisation exclusive de const Component = () => {}.  
* **Hooks :** Priorité aux hooks natifs (useState, useEffect, useMemo).  
* **Typage :** TypeScript obligatoire pour définir les Props et les interfaces d'état.
* **Server Components :** Utiliser les Server Components Next.js 14 quand possible.

## 2. Architecture des Fichiers

* **Structure Atomique :** Séparation entre components/ui (atomes) et components/features (molécules/organismes).  
* **Fichiers Unifiés :** Un composant par fichier, incluant ses types locaux.
* **Index Files :** Utiliser des index.ts pour regrouper les exports de composants connexes.

## 3. Optimisation & Performance

* **Memoization :** Utiliser React.memo() pour les composants de liste lourds.  
* **Lazy Loading :** Utiliser next/dynamic ou React.lazy pour les modules non critiques au premier chargement.  
* **Gestion d'État :** Privilégier l'état local ou Context API pour les données globales légères.  
* **Server Actions :** Utiliser les Server Actions Next.js pour les mutations de données.

## 4. Conventions de Nommage

* **Composants :** PascalCase (ex: UserProfile.tsx).  
* **Fonctions/Hooks :** camelCase (ex: useAuth.ts).  
* **Variables :** camelCase.
* **Interfaces :** PascalCase avec préfixe I ou Props (ex: IUserProps).

## 5. TypeScript Standards

```typescript
// Interface pour les props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children?: React.ReactNode;
}

// Composant avec typage strict
export const CustomButton: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false,
  children 
}) => {
  // Implementation
};
```

## 6. Hook Patterns

```typescript
// Custom hook example
interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  // Implementation following React hooks rules
};
```

## 7. Next.js 14 App Router Patterns

```typescript
// Server Component
export default async function HomePage() {
  const data = await getData();
  
  return (
    <main>
      <ClientComponent data={data} />
    </main>
  );
}

// Client Component
'use client';

interface ClientComponentProps {
  data: any[];
}

export const ClientComponent: React.FC<ClientComponentProps> = ({ data }) => {
  const [state, setState] = useState();
  
  return <div>{/* client-side logic */}</div>;
};
```

## 8. Error Handling Patterns

```typescript
// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback: Fallback 
}) => {
  // Implementation
};

// Async Error Handling
export const useAsyncOperation = <T,>() => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (operation: () => Promise<T>) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await operation();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, error, isLoading, execute };
};
```

## 9. Form Handling Patterns

```typescript
// React Hook Form + Zod integration
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with validation */}
    </form>
  );
};
```

## 10. Testing Standards

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

## 11. Accessibility (a11y) Standards

* **Semantic HTML :** Utiliser des éléments sémantiques appropriés.
* **ARIA Labels :** Ajouter des étiquettes ARIA quand nécessaire.
* **Keyboard Navigation :** Assurer la navigation au clavier.
* **Focus Management :** Gérer le focus pour les modales et menus déroulants.

## 12. Performance Guidelines

* **Code Splitting :** Utiliser dynamic imports pour les gros composants.
* **Image Optimization :** Utiliser le composant Image de Next.js.
* **Bundle Analysis :** Surveiller la taille du bundle avec @next/bundle-analyzer.
* **Web Vitals :** Optimiser pour Core Web Vitals.