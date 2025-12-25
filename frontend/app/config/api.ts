/**
 * API Configuration
 * 
 * Centralized API URL configuration for the frontend.
 * Uses environment variable with fallback to localhost for development.
 */

// Central base URL - strictly the origin (e.g., http://localhost:8000)
export const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

/**
 * Helper function to build API endpoints and file URLs
 * 
 * Automatically prepends '/api' for standard requests.
 * Detects static paths (like /uploads) and avoids adding '/api'.
 */
export function apiEndpoint(path: string): string {
    if (!path) return '';

    // Remove leading slash for consistency
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Define paths that should NOT get the /api prefix
    const bypassPrefixes = ['uploads/', 'images/', 'api/'];
    const shouldSkipApi = bypassPrefixes.some(prefix => cleanPath.startsWith(prefix));

    if (shouldSkipApi) {
        return `${API_BASE_URL}/${cleanPath}`;
    }

    // Standard API request
    return `${API_BASE_URL}/api/${cleanPath}`;
}

// For backward compatibility if needed - but apiEndpoint is the preferred way
export const API_URL = `${API_BASE_URL}/api`;
