 
"use client";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import Axiosinstance from "../lib/axios";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
}

interface AuthContextProps {
  user: User | null;
  isReady: boolean;
  getUser: () => Promise<void>;
  setUser: Dispatch<SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Vérifier la session côté serveur
  const getUser = async () => {
    try {
      const response = await Axiosinstance.get<{ user: User }>("/api/users/me");



      setUser(response.data as unknown as User);
    } catch (error) {

      setUser(null);
      setIsReady(true);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isReady, getUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
