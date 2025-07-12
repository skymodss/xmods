import { createGlobalState } from "react-hooks-global-state";

type State = {
  isOpen: boolean;
  isLoggedIn: boolean;
  token?: string;
  // store an optional redirect URL when opening the modal
  redirectPath?: string;
};

const initialState: State = {
  isOpen: false,
  isLoggedIn: false,
  token: undefined,
  redirectPath: undefined,
};

const { useGlobalState } = createGlobalState(initialState);

export function useLoginModal() {
  const [isOpen, setIsOpen] = useGlobalState("isOpen");
  const [isLoggedIn, setIsLoggedIn] = useGlobalState("isLoggedIn");
  const [token, setToken] = useGlobalState("token");
  const [redirectPath, setRedirectPath] = useGlobalState("redirectPath");

  // open can accept an optional path to redirect after login
  const open = (path?: string) => {
    setRedirectPath(path);
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
    setRedirectPath(undefined);
  };

  return {
    isOpen,
    isLoggedIn,
    token,

    // core methods
    open,
    close,

    // backward‐compatible aliases
    openLoginModal: open,
    closeLoginModal: close,

    // expose the saved redirect path under the name the UI expects
    urlRiderect: redirectPath,

    login: (newToken: string) => {
      setToken(newToken);
      setIsLoggedIn(true);
      setIsOpen(false);
      // Note: you can perform router.push(redirectPath) in your component after login
    },
    logout: () => {
      setToken(undefined);
      setIsLoggedIn(false);
      setRedirectPath(undefined);
    },
  };
}
