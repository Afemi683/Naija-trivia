import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

function NigeriaStripes({ colors }: { colors: Colors }) {
  return (
    <View style={styles.stripes}>
      <View style={[styles.stripe, { backgroundColor: colors.primary }]} />
      <View style={[styles.stripe, { backgroundColor: colors.card }]} />
      <View style={[styles.stripe, { backgroundColor: colors.primary }]} />
    </View>
  );
}

function TabButton({
  label, active, onPress, colors,
}: { label: string; active: boolean; onPress: () => void; colors: Colors }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && { backgroundColor: colors.primary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, { color: active ? colors.primaryForeground : colors.mutedForeground }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FormInput({
  label, value, onChangeText, placeholder, secureTextEntry = false,
  autoCapitalize = "none", keyboardType = "default", colors,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  colors: Colors;
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
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
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
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

function GoogleIcon() {
  return (
    <View style={styles.googleIconWrap}>
      <Text style={styles.googleG}>G</Text>
    </View>
  );
}

function AppleIcon({ color }: { color: string }) {
  return <Text style={[styles.appleIconText, { color }]}></Text>;
}

function XIcon({ color }: { color: string }) {
  return <Text style={[styles.xIconText, { color }]}>𝕏</Text>;
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
    if (mode === "register" && !name.trim()) { setError("Please enter your name"); return; }
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (m: "login" | "register") => { setMode(m); setError(null); };

  const handleGoogleAuth = () => {
    Alert.alert(
      "Google Sign-In",
      "Google Sign-In is coming soon! For now, create a free account with your email.",
      [{ text: "OK", style: "default" }]
    );
  };

  const handleAppleAuth = () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Apple Sign-In", "Apple Sign-In is only available on iOS devices.");
      return;
    }
    Alert.alert(
      "Apple Sign-In",
      "Apple Sign-In is coming soon! For now, create a free account with your email.",
      [{ text: "OK", style: "default" }]
    );
  };

  const handleXAuth = () => {
    Alert.alert(
      "X Sign-In",
      "X (Twitter) Sign-In is coming soon! For now, create a free account with your email.",
      [{ text: "OK", style: "default" }]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <NigeriaStripes colors={colors} />
            <View style={[styles.logoCircle, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <Text style={styles.logoEmoji}>🇳🇬</Text>
            </View>
            <Text style={[styles.appTitle, { color: colors.foreground }]}>Naija Trivia</Text>
            <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>Test your knowledge of Nigeria</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.tabs, { backgroundColor: colors.background }]}>
              <TabButton label="Log In" active={mode === "login"} onPress={() => switchMode("login")} colors={colors} />
              <TabButton label="Sign Up" active={mode === "register"} onPress={() => switchMode("register")} colors={colors} />
            </View>

            {/* Social Auth Buttons */}
            <View style={styles.socialSection}>
              <SocialButton
                label="Continue with Google"
                icon={<GoogleIcon />}
                bgColor="#FFFFFF"
                textColor="#1F1F1F"
                borderColor="#E0E0E0"
                onPress={handleGoogleAuth}
              />
              <SocialButton
                label="Continue with Apple"
                icon={<AppleIcon color="#FFFFFF" />}
                bgColor="#000000"
                textColor="#FFFFFF"
                borderColor="#333333"
                onPress={handleAppleAuth}
              />
              <SocialButton
                label="Continue with X"
                icon={<XIcon color="#FFFFFF" />}
                bgColor="#000000"
                textColor="#FFFFFF"
                borderColor="#333333"
                onPress={handleXAuth}
              />
            </View>

            {/* Divider */}
            <View style={styles.orDivider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.mutedForeground }]}>or use email</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Email/Password Form */}
            <View style={styles.form}>
              {mode === "register" && (
                <FormInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  colors={colors}
                />
              )}
              <FormInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                colors={colors}
              />
              <FormInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder={mode === "register" ? "Create a password (6+ chars)" : "Enter your password"}
                secureTextEntry
                colors={colors}
              />

              {error && (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={14} color={colors.destructive} />
                  <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
                    {mode === "login" ? "Log In" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest option */}
          <View style={styles.guestContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.guestBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={continueAsGuest}
            activeOpacity={0.7}
          >
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <Text style={[styles.guestBtnText, { color: colors.mutedForeground }]}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={[styles.guestNote, { color: colors.mutedForeground }]}>Scores will not sync across devices</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },

  header: { alignItems: "center", paddingTop: 40, paddingBottom: 28 },
  stripes: { flexDirection: "row", marginBottom: 20, borderRadius: 4, overflow: "hidden" },
  stripe: { width: 36, height: 6 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    marginBottom: 16, borderWidth: 2,
  },
  logoEmoji: { fontSize: 36 },
  appTitle: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 6 },
  appTagline: { fontSize: 15, fontFamily: "Inter_400Regular" },

  card: { borderRadius: 20, padding: 24, borderWidth: 1 },

  tabs: { flexDirection: "row", borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  socialSection: { gap: 10, marginBottom: 20 },
  socialBtn: {
    flexDirection: "row", alignItems: "center", borderRadius: 13,
    borderWidth: 1, paddingVertical: 13, paddingHorizontal: 16, gap: 10,
  },
  socialBtnIcon: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  socialBtnText: { flex: 1, textAlign: "center", fontSize: 15, fontFamily: "Inter_600SemiBold" },

  googleIconWrap: {
    width: 22, height: 22, borderRadius: 4, backgroundColor: "#4285F4",
    alignItems: "center", justifyContent: "center",
  },
  googleG: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  appleIconText: { fontSize: 20, lineHeight: 22 },
  xIconText: { fontSize: 16, fontFamily: "Inter_700Bold" },

  orDivider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1 },
  orText: { fontSize: 12, fontFamily: "Inter_400Regular" },

  form: { gap: 16 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
  },
  input: { flex: 1, height: 50, paddingHorizontal: 16, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { paddingHorizontal: 14, height: 50, justifyContent: "center" },

  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(248, 113, 113, 0.1)", borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(248, 113, 113, 0.2)",
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  submitBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 4 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },

  guestContainer: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 14, gap: 12 },
  dividerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  guestBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1,
  },
  guestBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  guestNote: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 10, opacity: 0.7 },
});
