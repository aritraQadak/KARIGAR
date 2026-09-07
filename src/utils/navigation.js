/**
 * Karigar Role-Based Navigation & Route Resolution
 */

export const EXISTING_PATRON_ROUTE = '/patron';
export const EXISTING_ARTISAN_ROUTE = '/seller/dashboard';

/**
 * Returns the default home destination route for a given user or role
 * @param {Object|string} userOrRole - User object containing role or role string ('ARTISAN' | 'PATRON')
 * @returns {string} Target path
 */
export function getHomeRouteForRole(userOrRole) {
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
  if (role === 'ARTISAN') {
    return EXISTING_ARTISAN_ROUTE;
  }
  if (role === 'PATRON') {
    return EXISTING_PATRON_ROUTE;
  }
  return '/login';
}

/**
 * Reusable helper to navigate the authenticated user to their role interface
 * @param {Function} navigate - react-router navigate function
 * @param {Object} user - Authenticated user object
 * @param {string|Object|null} fallbackFrom - Optional location state 'from' path or object
 */
export function navigateByRole(navigate, user, fallbackFrom = null) {
  if (!user || !user.role) {
    if (typeof navigate === 'function') {
      navigate('/login', { replace: true });
    }
    return;
  }

  // Normalize fallbackFrom to a string path if an object was passed
  const targetPath =
    typeof fallbackFrom === 'string'
      ? fallbackFrom
      : fallbackFrom && typeof fallbackFrom === 'object' && fallbackFrom.pathname
      ? fallbackFrom.pathname
      : null;

  // If a specific deep link exists and is allowed for this role, honor it
  if (targetPath && targetPath !== '/login' && targetPath !== '/auth' && targetPath !== '/') {
    if (user.role === 'ARTISAN' && (targetPath.startsWith('/seller') || targetPath.startsWith('/dashboard'))) {
      navigate(targetPath, { replace: true });
      return;
    }
    if (user.role === 'PATRON' && !targetPath.startsWith('/seller') && !targetPath.startsWith('/dashboard')) {
      navigate(targetPath, { replace: true });
      return;
    }
  }

  const destination = getHomeRouteForRole(user.role);
  navigate(destination, { replace: true });
}

/**
 * Central role-based redirect helper.
 * Supports calling as redirectByRole(navigate, user, fallback) or redirectByRole(user, navigate, fallback)
 */
export function redirectByRole(arg1, arg2, arg3) {
  if (typeof arg1 === 'function') {
    return navigateByRole(arg1, arg2, arg3);
  }
  return navigateByRole(arg2, arg1, arg3);
}

