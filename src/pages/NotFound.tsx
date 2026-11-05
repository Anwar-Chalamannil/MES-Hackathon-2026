import { ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-extrabold tracking-tight">Page not found</h1>
      <EmptyState title="We couldn't find that page" text="The link may be old or mistyped.">
        <ButtonLink to="/">Go to the home page</ButtonLink>
      </EmptyState>
    </div>
  );
}
