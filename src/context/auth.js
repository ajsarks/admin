import { createContext, useEffect, useReducer, useCallback } from "react";

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");
  }, []);

  const checkLoginStatus = useCallback(() => {
    const loginTimestamp = localStorage.getItem("loginTimestamp");
    if (loginTimestamp) {
      const currentTime = Date.now();
      const loginTime = parseInt(loginTimestamp, 10);
      const timeDifference = currentTime - loginTime;
      const hoursPassed = timeDifference / (1000 * 60 * 60);

      if (hoursPassed >= 24) {
        logout();
      }
    }
  }, [logout]);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("loginTimestamp", Date.now().toString());
    }
  }, [state.user]);

  useEffect(() => {
    // Check login status immediately when component mounts
    checkLoginStatus();

    // Set up interval to check every minute
    const intervalId = setInterval(checkLoginStatus, 60000);

    // Check login status on window focus
    window.addEventListener('focus', checkLoginStatus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, [checkLoginStatus]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};