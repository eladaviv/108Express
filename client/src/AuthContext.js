import React, { useState, useContext, createContext, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {isAuthenticated} from "./auth";
import { ToastContainer, toast } from 'react-toastify';
import '../node_modules/react-toastify/dist/ReactToastify.css';

const AuthContext = createContext({
  signIn: async (user) => {},
  signOut: async () => {},
  isUserSignedIn: () => {},
  getUser: () => {},
  isAdmin: () => {},
  currentUser: null
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(isAuthenticated()?isAuthenticated()?.user:null);
  const [wsURL, setWsURL] = useState(null);
  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const { lastJsonMessage, sendJsonMessage, readyState } = useWebSocket(wsURL, {
    share: true,
    onOpen: () => {
      console.log('WebSocket opened');
    }
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      setIsSocketOpen(true);
    }
    if (readyState === ReadyState.CLOSED) {
      setIsSocketOpen(false);
    }
  }, [readyState]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    if (isSocketOpen) {
      sendJsonMessage({ type: 'SIGN_IN', user: currentUser });
    } else {
      setWsURL('ws://localhost:2309');
    }
  }, [currentUser, isSocketOpen]);

  async function signIn(user) {

    console.log("user sign in = ",user);
    setCurrentUser(user);
    sendJsonMessage({ type: 'SIGN_IN', user: user });
    
  }

  function signOut() {
    console.log("in sign out");
    setCurrentUser(null);
    sendJsonMessage({ type: 'SIGN_OUT' });
  }

  

  useEffect(() => {
    console.log("lastJsonMessage = ",lastJsonMessage);
    if (lastJsonMessage !== null) {
      if(lastJsonMessage?.currentLoggedInUsers){

        toast(`there are ${lastJsonMessage.currentLoggedInUsers.length} users logged in the system`);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (currentUser) {
      try {
        setWsURL('ws://localhost:2309');
      } catch (ex) {
        console.error(ex);
      }
    } else {
      setWsURL(null);
    }
  }, [currentUser, sendJsonMessage]);

  function getUserToken() {
    return isUserSignedIn() ? currentUser.getIdToken() : null;
  }

  function isUserSignedIn() {
    return currentUser != null;
  }

  function getUser() {
    return currentUser;
  }

  function isAdmin() {
    return currentUser && currentUser.role === 1
     
  }

  const value = {
    currentUser,
    isUserSignedIn,
    signIn,
    signOut,
    getUserToken,
    getUser,
    isAdmin
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
      <ToastContainer />
    </AuthContext.Provider>
  );
};

export default AuthContext;