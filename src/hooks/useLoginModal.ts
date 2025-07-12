import { createGlobalState } from "react-hooks-global-state";

type State = {
  isOpen: boolean;
  isLoggedIn: boolean;
  token?: string;
};

const initialState: State = {
  isOpen: false,
  isLoggedIn: false,
  token: undefined,
};

const { useGlobalState } = createGlobalState(initialState);

export function useLoginModal() {
  const [isOpen, setIsOpen] = useGlobalState("isOpen");
  const [isLoggedIn, setIsLoggedIn] = useGlobalState("isLoggedIn");
  const [token, setToken] = useGlobalState("token");

  // Allow an optional redirect path argument (currently ignored,
  // but can be stored in state if needed later)
  const open = (redirectPath?: string) => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    isLoggedIn,
    token,

    // Core methods
    open,
    close,

    // Aliases for backward compatibility
    openLoginModal: open,
    closeLoginModal: close,

    login: (newToken: string) => {
      setToken(newToken);
      setIsLoggedIn(true);
      setIsOpen(false);
    },
    logout: () => {
      setToken(undefined);
      setIsLoggedIn(false);
    },
  };
}
