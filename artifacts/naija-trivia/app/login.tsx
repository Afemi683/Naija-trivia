import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type Colors = ReturnType<typeof useColors>;

function NigeriaBadge() {
  return (
    <View style={styles.badgeWrap}>
      <View style={[styles.badgeStripe, { backgroundColor: "#008751" }]} />
      <View style={[styles.badgeStripe, { backgroundColor: "#FFFFFF" }]} />
      <View style={[styles.badgeStripe, { backgroundColor: "#008751" }]} />
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: Colors;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.tab,
        {
          backgroundColor: active ? colors.primary : "transparent",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.tabText,
          { color: active ? "#FFFFFF" : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = "none",
  keyboardType = "default",
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  colors: Colors;
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.foreground }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: colors.input, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SocialButton({
  label,
  icon,
  bgColor,
  textColor,
  borderColor,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.socialBtn, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.socialBtnIcon}>{icon}</View>
      <Text style={[styles.socialBtnText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function LoginScreen() {
  const colors = useColors();
  const { login, register, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (mode === "register" && !name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError(null);
  };

  const handleGoogleAuth = () => {
    Alert.alert(
      "Google Sign-In",
      "Sign in with Google is coming soon! You can create a free email account right now.",
      [{ text: "OK", style: "default" }]
    );
  };

  const handleAppleAuth = () => {
    Alert.alert(
      "Apple Sign-In",
      "Apple Sign-In is coming soon! You can create a free email account right now.",
      [{ text: "OK", style: "default" }]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <NigeriaBadge />
            <Text style={[styles.appTitle, { color: colors.foreground }]}>Naija Trivia</Text>
            <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
              Explore Nigeria's rich history, geography & culture
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Mode Tabs */}
            <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
              <TabButton
                label="Sign In"
                active={mode === "login"}
                onPress={() => switchMode("login")}
                colors={colors}
              />
              <TabButton
                label="Create Account"
                active={mode === "register"}
                onPress={() => switchMode("register")}
                colors={colors}
              />
            </View>

            {/* Input Form */}
            <View style={styles.form}>
              {mode === "register" && (
                <FormInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Chinua Achebe"
                  autoCapitalize="words"
                  colors={colors}
                />
              )}

              <FormInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                colors={colors}
              />

              <FormInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder={mode === "register" ? "At least 6 characters" : "Enter password"}
                secureTextEntry
                colors={colors}
              />

              {error && (
                <View style={[styles.errorBox, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
                  <Feather name="alert-circle" size={15} color={colors.destructive} />
                  <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: colors.primary },
                  isSubmitting && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === "login" ? "Sign In" : "Create Free Account"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.orDivider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.mutedForeground }]}>
                OR CONTINUE WITH
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialSection}>
              <SocialButton
                label="Google"
                icon={<Text style={{ fontSize: 16, fontWeight: "bold" }}>G</Text>}
                bgColor={colors.card}
                textColor={colors.foreground}
                borderColor={colors.border}
                onPress={handleGoogleAuth}
              />
              <SocialButton
                label="Apple"
                icon={<Feather name="smartphone" size={16} color={colors.foreground} />}
                bgColor={colors.card}
                textColor={colors.foreground}
                borderColor={colors.border}
                onPress={handleAppleAuth}
              />
            </View>
          </View>

          {/* Guest Escape Hatch */}
          <View style={styles.guestSection}>
            <TouchableOpacity
              style={[
                styles.guestBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={continueAsGuest}
              activeOpacity={0.7}
            >
              <Feather name="play-circle" size={18} color={colors.primary} />
              <Text style={[styles.guestBtnText, { color: colors.foreground }]}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
            <Text style={[styles.guestHint, { color: colors.mutedForeground }]}>
              Play offline immediately · Sync scores later
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 36 },

  header: { alignItems: "center", paddingTop: 32, paddingBottom: 24 },
  badgeWrap: { flexDirection: "row", marginBottom: 16, borderRadius: 4, overflow: "hidden" },
  badgeStripe: { width: 34, height: 6 },
  appTitle: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 6 },
  appTagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },

  card: { borderRadius: 24, padding: 22, borderWidth: 1, marginBottom: 20 },
  tabs: { flexDirection: "row", borderRadius: 14, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  form: { gap: 14 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { padding: 8 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    height: 52,
    marginTop: 4,
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_700Bold" },

  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  orText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },

  socialSection: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    height: 48,
    gap: 8,
  },
  socialBtnIcon: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  socialBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  guestSection: { alignItems: "center", gap: 8 },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  guestBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  guestHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
