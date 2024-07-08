import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(() => {
        // onAuthStateChanged
       // setTimeout(() => {
            setIsAuthenticated(false);
       // }, 3000);
    }, []);

    const login = async (email, password) => {
        try {
            // login logic
        } catch (e) {
            // handle error
        }
    };

    const logout = async () => {
        try {
            // logout logic
        } catch (e) {
            // handle error
        }
    };

    const register = async (email, password, username, profileUrl) => {
        try {
            // register logic
        } catch (e) {
            // handle error
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error('useAuth must be wrapped inside AuthContextProvider');
    }
    return value;
};
