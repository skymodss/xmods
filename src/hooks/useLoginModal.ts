import { useEffect, useState } from "react";

// key za localStorage
const TOKEN_KEY = "xmods_jwt";

export function useLoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [redirectPath, setRedirectPath] = useState<string|undefined>(undefined);

  // pri mountu, uzmi token iz localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;
    if (saved) {
      setToken(saved);
      setIsLoggedIn(true);
    }
  }, []);

  // kad se token promijeni u stateu, ažuriraj localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const open = (path?: string) => {
    setRedirectPath(path);
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
    setRedirectPath(undefined);
  };

  const login = (newToken: string) => {
    setToken(newToken);
    setIsLoggedIn(true);
    setIsOpen(false);
  };

  const logout = () => {
    setToken(undefined);
    setIsLoggedIn(false);
    setIsOpen(false);
  };

  return {
    isOpen,
    isLoggedIn,
    token,
    open,
    close,
    openLoginModal: open,
    closeLoginModal: close,
    urlRiderect: redirectPath,
    login,
    logout,
  };
}
