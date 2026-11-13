// import colors from "@/constants/colors";
// import { useTheme } from "@/context/ThemeContext";

// /**
//  * Returns the design tokens for the current color scheme.
//  *
//  * The returned object contains all color tokens for the active palette
//  * plus scheme-independent values like `radius`.
//  *
//  * Respects the user's manual Light/Dark/System choice from ThemeContext
//  * (set in the Profile tab), falling back to the device's system setting
//  * when "System" is selected.
//  */
// export function useColors() {
//   const { resolvedScheme } = useTheme();
//   const palette = resolvedScheme === "dark" ? colors.dark : colors.light;
//   return { ...palette, radius: colors.radius };
// }

import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

export function useColors() {
  const { resolvedScheme } = useTheme();
  const palette = resolvedScheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}