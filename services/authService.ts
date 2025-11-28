
// Simulating a backend environment for the purpose of this demo
// In a real app, this would be a Node.js/Express server or Next.js API route

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthResponse {
  user: User;
  token: string;
}

// Mock Admin Credentials
const MOCK_ADMIN = {
  id: 'admin-123',
  email: 'admin@ftj.com',
  passwordHash: 'Admin@ftj1234', // Simple string match for demo (normally bcrypt)
  name: 'FTJ Admin',
  role: 'admin' as const,
};

// --- Cookie Helpers ---

export const setAuthCookie = (token: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `ftj_auth_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Strict; Secure`;
};

export const getAuthCookie = (): string | null => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === 'ftj_auth_token' ? decodeURIComponent(parts[1]) : r;
  }, '') || null;
};

export const clearAuthCookie = () => {
  document.cookie = 'ftj_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
};

// --- JWT Simulation ---

const generateToken = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    sub: user.id, 
    email: user.email, 
    role: user.role, 
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }));
  const signature = btoa('mock-signature-secret');
  return `${header}.${payload}.${signature}`;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (email.toLowerCase() === MOCK_ADMIN.email && password === MOCK_ADMIN.passwordHash) {
    const user = {
      id: MOCK_ADMIN.id,
      email: MOCK_ADMIN.email,
      name: MOCK_ADMIN.name,
      role: MOCK_ADMIN.role,
    };
    return {
      user,
      token: generateToken(user),
    };
  }

  throw new Error('Invalid email or password');
};

export const verifyToken = (token: string): boolean => {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiry
    if (Date.now() > payload.exp) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

export const getUserFromToken = (token: string): User | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: 'FTJ Admin' // In real app, fetch from DB
    };
  } catch (e) {
    return null;
  }
};
