// Imported FIRST in main.tsx so it runs before the store loads saved state.
// Opening any page with ?reset=1 clears saved baskets, vouchers and settings (useful on a phone that has been used before).
try {
  const url = new URL(window.location.href);
  if (url.searchParams.get('reset') === '1') {
    window.localStorage.removeItem('basketwise');
    url.searchParams.delete('reset');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
} catch {
  // Storage blocked: nothing saved anyway.
}
export {};
