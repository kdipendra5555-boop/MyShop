import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export const sendOTP = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== ADMIN_EMAIL.trim().toLowerCase()) {
    throw new Error("Unauthorized admin email.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) throw error;

  return true;
};

export const verifyOTP = async (email, token) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== ADMIN_EMAIL.trim().toLowerCase()) {
    throw new Error("Unauthorized admin email.");
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token,
    type: "email",
  });

  if (error) throw error;

  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session;
};