/**
 * Utility functions for multi-tenant functionality
 */

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
}

/**
 * Extract subdomain from current URL
 */
export const getSubdomainFromUrl = (url?: string): string | null => {
  const currentUrl = url || window.location.hostname;
  
  // Remove protocol if present
  const hostname = currentUrl.replace(/^https?:\/\//, '');
  
  // Split by dots
  const parts = hostname.split('.');
  
  // If we have more than 2 parts (e.g., subdomain.domain.com), first part is subdomain
  // Skip common development domains like localhost
  if (parts.length > 2 && !isLocalDevelopment(hostname)) {
    return parts[0];
  }
  
  // For development, check if it starts with a known subdomain pattern
  if (isLocalDevelopment(hostname)) {
    // For development URLs like tenant-name.localhost:3000
    if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== '127' && parts[0] !== 'www') {
      return parts[0];
    }
  }
  
  return null;
};

/**
 * Check if current environment is local development
 */
export const isLocalDevelopment = (hostname?: string): boolean => {
  const host = hostname || window.location.hostname;
  return host === 'localhost' || 
         host === '127.0.0.1' || 
         host.startsWith('localhost:') ||
         host.startsWith('127.0.0.1:') ||
         host.endsWith('.localhost') ||
         host.includes('vercel.app') ||
         host.includes('netlify.app');
};

/**
 * Get the base domain without subdomain
 */
export const getBaseDomain = (): string => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (isLocalDevelopment(hostname)) {
    return port ? `localhost:${port}` : 'localhost';
  }
  
  const parts = hostname.split('.');
  if (parts.length > 2) {
    // Return domain.com from subdomain.domain.com
    return parts.slice(1).join('.');
  }
  
  return hostname;
};

/**
 * Build full URL with tenant subdomain
 */
export const buildTenantUrl = (tenantSubdomain: string, path: string = '/login'): string => {
  const protocol = window.location.protocol;
  const baseDomain = getBaseDomain();
  
  if (isLocalDevelopment()) {
    // For development, we'll simulate subdomains with query params
    // Or use subdomain.localhost pattern
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${tenantSubdomain}.localhost${port}${path}`;
  }
  
  return `${protocol}//${tenantSubdomain}.${baseDomain}${path}`;
};

/**
 * Check if current URL has a tenant subdomain
 */
export const hasTenantSubdomain = (): boolean => {
  return getSubdomainFromUrl() !== null;
};

/**
 * Get current tenant subdomain or null
 */
export const getCurrentTenantSubdomain = (): string | null => {
  return getSubdomainFromUrl();
};

/**
 * Redirect to tenant domain
 */
export const redirectToTenant = (tenantSubdomain: string, path: string = '/login'): void => {
  const targetUrl = buildTenantUrl(tenantSubdomain, path);
  
  // For development, we might want to handle this differently
  if (isLocalDevelopment()) {
    // You could use query params for dev: ?tenant=subdomain
    // Or actually redirect to subdomain.localhost
    window.location.href = targetUrl;
  } else {
    window.location.href = targetUrl;
  }
};

/**
 * Parse tenant info from current URL
 */
export const getCurrentTenantInfo = (): { subdomain: string | null; isMultiTenant: boolean } => {
  const subdomain = getCurrentTenantSubdomain();
  return {
    subdomain,
    isMultiTenant: subdomain !== null
  };
};

/**
 * Format tenant display name
 */
export const formatTenantName = (tenant: TenantInfo): string => {
  return tenant.name;
};

/**
 * Get tenant URL for display
 */
export const getTenantDisplayUrl = (tenant: TenantInfo): string => {
  if (!tenant.subdomain) return '';
  
  const baseDomain = getBaseDomain();
  const protocol = window.location.protocol;
  
  if (isLocalDevelopment()) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${tenant.subdomain}.localhost${port}`;
  }
  
  return `${protocol}//${tenant.subdomain}.${baseDomain}`;
};

export default {
  getSubdomainFromUrl,
  isLocalDevelopment,
  getBaseDomain,
  buildTenantUrl,
  hasTenantSubdomain,
  getCurrentTenantSubdomain,
  redirectToTenant,
  getCurrentTenantInfo,
  formatTenantName,
  getTenantDisplayUrl
};
