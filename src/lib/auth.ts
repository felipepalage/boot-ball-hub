import type { AuthenticatedUser } from '@/types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ACTIVE_TEAM_KEY = 'activeTeamId';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),

  getUser: (): AuthenticatedUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  },

  setUser: (user: AuthenticatedUser): void =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),

  getActiveTeamId: (): string | null => localStorage.getItem(ACTIVE_TEAM_KEY),

  setActiveTeamId: (teamId: string): void => localStorage.setItem(ACTIVE_TEAM_KEY, teamId),

  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACTIVE_TEAM_KEY);
  },
};
