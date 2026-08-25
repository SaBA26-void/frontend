const ADMIN_PASSWORD_KEY = "atlas_admin_password";

export function getAdminPassword(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(ADMIN_PASSWORD_KEY);
}

export function setAdminPassword(password: string): void {
  sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

export function clearAdminPassword(): void {
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminPassword());
}
