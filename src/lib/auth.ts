/**
 * Admin Authentication Token Helper
 * Retrieves the currently active master session token from sessionStorage/localStorage.
 * Never hardcodes any default or fallback passcode.
 */
export const getAdminToken = (): string => {
  if (typeof window === 'undefined') return '';
  return (
    sessionStorage.getItem('shiv_dhara_admin_session') ||
    localStorage.getItem('shiv_dhara_admin_session') ||
    localStorage.getItem('shiv_dhara_admin_token') ||
    ''
  );
};
