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

  return {
    isOpen,
    isLoggedIn,
    token,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
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
