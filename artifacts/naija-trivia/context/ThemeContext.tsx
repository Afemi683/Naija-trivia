// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { useColorScheme } from "react-native";

// export type ThemePreference = "light" | "dark" | "system";

// interface ThemeContextValue {
//   /** What the user picked: "light" | "dark" | "system" */
//   preference: ThemePreference;
//   /** The actual resolved scheme to render, after applying "system" */
//   resolvedScheme: "light" | "dark";
//   setPreference: (pref: ThemePreference) => void;
// }

// const ThemeContext = createContext<ThemeContextValue | null>(null);

// const STORAGE_KEY = "naija_trivia_theme_preference";

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const systemScheme = useColorScheme();
//   const [preference, setPreferenceState] = useState<ThemePreference>("system");

//   useEffect(() => {
//     AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
//       if (stored === "light" || stored === "dark" || stored === "system") {
//         setPreferenceState(stored);
//       }
//     });
//   }, []);

//   const setPreference = useCallback((pref: ThemePreference) => {
//     setPreferenceState(pref);
//     AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
//   }, []);

//   const resolvedScheme: "light" | "dark" =
//     preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

//   return (
//     <ThemeContext.Provider value={{ preference, resolvedScheme, setPreference }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// export function useTheme() {
//   const ctx = useContext(ThemeContext);
//   if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
//   return ctx;
// }

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedScheme: "light" | "dark";
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "naija_trivia_theme_preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
  }, []);

  const resolvedScheme: "light" | "dark" =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  return (
    <ThemeContext.Provider value={{ preference, resolvedScheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}