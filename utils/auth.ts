const AUTH_KEY = "beverage_counter_auth"
const PASSWORD = "v0" // Default password

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(AUTH_KEY) === "true"
  } catch {
    return false
  }
}

export function login(password: string): boolean {
  if (password === PASSWORD) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(AUTH_KEY, "true")
        return true
      } catch {
        return false
      }
    }
    return true
  }
  return false
}

export function logout(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(AUTH_KEY)
    } catch {
      // Ignore errors
    }
  }
}
