import { useState, useEffect, createContext, ReactNode, useContext } from 'react';
import { IContextType, IUser } from '@/types';
import { getCurrentUser } from '@/lib/appwrite/api';
import { useNavigate } from 'react-router-dom';

export const initialUser: IUser = {
    id: '',
    name: '',
    username: '',
    email: '',
    imageUrl: '',
    bio: '',
}

export const initialState: IContextType = {
    user: initialUser,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => { },
    setIsAuthenticated: () => { },
    checkIfAuthenticated: async () => false,
}

const Context = createContext<IContextType>(initialState);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IUser>(initialUser);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const checkIfAuthenticated = async () => {
        setIsLoading(true);
        try {
            const currentAccount = await getCurrentUser();
            console.log(currentAccount);
            if (currentAccount) {
                setUser({
                    id: currentAccount.$id,
                    name: currentAccount.name,
                    username: currentAccount.username,
                    email: currentAccount.email,
                    imageUrl: currentAccount.imageUrl,
                    bio: currentAccount.bio,
                });
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Authentication check failed:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const performAuthCheck = async () => {
            const authenticated = await checkIfAuthenticated();
            if (!authenticated) {
                navigate('/sign-in');
            }
        }

        performAuthCheck();
    }, []);

    const value: IContextType = {
        user,
        setUser,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkIfAuthenticated,
    }

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    )
}

export default AuthProvider;

export const useAuthUserContext = () => useContext(Context);
