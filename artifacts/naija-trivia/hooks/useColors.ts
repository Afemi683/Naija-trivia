// import { useColorScheme } from "react-native";

// import colors from "@/constants/colors";

// /**
//  * Returns the design tokens for the current color scheme.
//  *
//  * The returned object contains all color tokens for the active palette
//  * plus scheme-independent values like `radius`.
//  *
//  * Falls back to the light palette when no dark key is defined in
//  * constants/colors.ts (the scaffold ships light-only by default).
//  * When a sibling web artifact's dark tokens are synced into a `dark`
//  * key, this hook will automatically switch palettes based on the
//  * device's appearance setting.
//  */
// export function useColors() {
//   const scheme = useColorScheme();
//   const palette =
//     scheme === "dark" && "dark" in colors
//       ? (colors as unknown as Record<string, typeof colors.light>).dark
//       : colors.light;
//   return { ...palette, radius: colors.radius };
// }

import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Respects the user's manual Light/Dark/System choice from ThemeContext
 * (set in the Profile tab), falling back to the device's system setting
 * when "System" is selected.
 */
export function useColors() {
  const { resolvedScheme } = useTheme();
  const palette = resolvedScheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
