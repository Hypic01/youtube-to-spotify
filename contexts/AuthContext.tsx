"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserType = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 최초 유저 정보 가져오기
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({ id: user.id, email: user.email! });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    getUser();

    // 2. 로그인/로그아웃 상태 실시간 반영
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: unknown) => {
      if (session && typeof session === 'object' && 'user' in session && session.user) {
        const user = session.user as { id: string; email: string };
        setUser({ id: user.id, email: user.email });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
