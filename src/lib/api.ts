// --- JWT Management ---
const TOKEN_KEY = 'authToken';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// --- Types ---
// Minimal User type to replace Supabase User
export interface User {
  id: string;
  email: string;
  // Add other user properties as needed by the frontend
}

// Candidate type based on existing usage in Vote.tsx
export interface Candidate {
  id: string;
  name: string;
  description: string | null;
  party: string | null;
}

// VoteResult type based on existing usage in Results.tsx
export interface VoteResult {
  candidate_id: string;
  candidate_name: string;
  candidate_party: string | null;
  vote_count: number;
}

// --- Generic Fetcher ---
interface FetcherOptions extends RequestInit {
  body?: any;
}

const API_BASE_URL = '/'; // Assuming the API is hosted on the same domain

export async function fetcher<T>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : options.body,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      removeAuthToken();
    }
    
    let errorData: any = { message: response.statusText };
    try {
      // Attempt to read JSON error message from the body
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
    }
    
    throw new Error(errorData.message || `API call failed with status ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

// --- API Functions ---

// 1. POST /api/login
export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await fetcher<LoginResponse>('api/login', {
    method: 'POST',
    body: { email, password },
  });
  
  setAuthToken(data.token);
  return data;
}

// 2. GET /api/options (Fetch candidates)
export async function getCandidates(): Promise<Candidate[]> {
  return fetcher<Candidate[]>('api/options', { method: 'GET' });
}

// 3. POST /api/vote (Insert votes)
export async function submitVote(candidateId: string): Promise<void> {
  // Assuming the backend handles the user_id from the JWT
  return fetcher<void>('api/vote', {
    method: 'POST',
    body: { candidate_id: candidateId },
  });
}

// 4. GET /api/results (Get results)
export async function getResults(): Promise<VoteResult[]> {
  return fetcher<VoteResult[]>('api/results', { method: 'GET' });
}

// --- Session Management (Replacement for Supabase auth listeners) ---

// This function will attempt to decode the JWT to get user info.
// In a real application, this is insecure as the JWT can be tampered with.
// A more secure approach is to have a GET /api/me endpoint.
// For this cleanup task, we'll assume the token is a simple flag for "logged in"
// and the user object is managed by the components that call `login`.
// Since the original code used `supabase.auth.getSession()`, we'll simulate a check.

export async function checkSession(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  // To get the user object, we need a way to fetch it.
  // We'll assume a GET /api/me endpoint exists for this purpose.
  // If the token is valid, this call will succeed and return the user.
  try {
    const user = await fetcher<User>('api/me', { method: 'GET' });
    return user;
  } catch (error) {
    // If the token is expired or invalid, the fetcher will remove it and throw.
    console.error("Session check failed:", error);
    return null;
  }
}

// A simple logout function
export function logout() {
  removeAuthToken();
}
