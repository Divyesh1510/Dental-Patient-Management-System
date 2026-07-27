import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  const authorizedEmails = [
    'divyeshatla@gmail.com',
    'dratlareddy@gmail.com',
    'dratlareddy@yahoo.com',
    'atlaswapna@gmail.com',
  ];

  useEffect(() => {
    // Handle Auth State Changes
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && u.email && authorizedEmails.includes(u.email.toLowerCase())) {
        setUser(u);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else if (u && !u.email) {
        setUser(u);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        setUser(null);
        // Only reset isLoggedIn if we aren't using mock password login
        if (localStorage.getItem('isLoggedIn') !== 'true') {
          setIsLoggedIn(false);
        }
        if (u) signOut(auth);
      }
      setLoading(false);
    });

    // Handle Redirect Result for Google Login
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const email = result.user.email.toLowerCase();
          if (authorizedEmails.includes(email)) {
            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
          } else {
            signOut(auth);
            alert("Unauthorized email address.");
          }
        }
      })
      .catch((error) => {
        console.error("Redirect Login Error:", error);
      });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        const email = result.user.email.toLowerCase();
        if (authorizedEmails.includes(email)) {
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
          return true;
        } else {
          await signOut(auth);
          throw new Error("Unauthorized email address.");
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const loginWithPassword = (password) => {
    if (password === '123456789') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signout Error:", err);
    }
  };

  const value = {
    user,
    isLoggedIn,
    loginWithGoogle,
    loginWithPassword,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
