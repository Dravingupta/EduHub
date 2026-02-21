/**
 * AuthContext — Global Authentication State
 *
 * Provides authentication state and methods to the entire app via Context API.
 * Wraps the app with <AuthProvider> in App.jsx.
 *
 * Exposes:
 *  - user          : current Firebase user object (or null)
 *  - loading       : true while initial auth state is being resolved
 *  - login()       : sign in with email & password
 *  - register()    : create new account with email & password
 *  - logout()      : sign the user out
 *  - getIdToken()  : get a fresh Firebase ID token (force-refreshed)
 */

import { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

// Create the context with a sensible default
const AuthContext = createContext(null);

/**
 * Custom hook to consume the auth context.
 * Must be used within an <AuthProvider>.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

/**
 * AuthProvider — wraps children with authentication state and methods.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Subscribe to Firebase auth state on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            },
            () => {
                // If auth listener errors (e.g., invalid config), stop loading
                setUser(null);
                setLoading(false);
            }
        );

        // Safety-net: if onAuthStateChanged never fires (e.g., no Firebase config),
        // stop loading after a timeout so the app doesn't stay stuck
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 4000);

        // Cleanup listener and timeout on unmount
        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    /**
     * Sign in with email and password.
     * Returns the UserCredential on success.
     */
    const login = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    /**
     * Register a new user with email and password.
     * Returns the UserCredential on success.
     */
    const register = async (email, password) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    };

    /**
     * Sign out the current user.
     */
    const logout = async () => {
        return await signOut(auth);
    };

    /**
     * Get a fresh Firebase ID token.
     * Forces a refresh (true) to ensure the token is always valid.
     * Useful for attaching to API requests via Axios interceptors.
     */
    const getIdToken = async () => {
        if (!user) return null;
        return await user.getIdToken(true);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        getIdToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
