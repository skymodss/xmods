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

  // Core state handlers
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    isLoggedIn,
    token,

    // keep the old names intact so existing components keep working:
    open,
    close,
    openLoginModal: open,
    closeLoginModal: close,

    login: (newToken: string) => {
      setToken(newToken);
      setIsLoggedIn(true);
      open();     // or close() depending on flow
    },
    logout: () => {
      setToken(undefined);
      setIsLoggedIn(false);
    },
  };
}
