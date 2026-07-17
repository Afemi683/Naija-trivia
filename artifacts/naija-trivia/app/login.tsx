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

const COLORS = {
  bg: "#0B1426",
  card: "#152035",
  green: "#00B368",
  greenDark: "#008751",
  gold: "#E9A012",
  white: "#FFFFFF",
  muted: "#8899B4",
  inputBg: "#1E2F47",
  border: "#243650",
  error: "#F87171",
};

function NigeriaStripes() {
  return (
    <View style={styles.stripes}>
      <View style={[styles.stripe, { backgroundColor: COLORS.greenDark }]} />
      <View style={[styles.stripe, { backgroundColor: "#FFFFFF" }]} />
      <View style={[styles.stripe, { backgroundColor: COLORS.greenDark }]} />
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function FormInput({
  label, value, onChangeText, placeholder, secureTextEntry = false,
  autoCapitalize = "none", keyboardType = "default",
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={COLORS.muted} />
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <NigeriaStripes />
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🇳🇬</Text>
            </View>
            <Text style={styles.appTitle}>Naija Trivia</Text>
            <Text style={styles.appTagline}>Test your knowledge of Nigeria</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.tabs}>
              <TabButton label="Log In" active={mode === "login"} onPress={() => switchMode("login")} />
              <TabButton label="Sign Up" active={mode === "register"} onPress={() => switchMode("register")} />
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
              <View style={[styles.dividerLine, { backgroundColor: COLORS.border }]} />
              <Text style={styles.orText}>or use email</Text>
              <View style={[styles.dividerLine, { backgroundColor: COLORS.border }]} />
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
                />
              )}
              <FormInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              <FormInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder={mode === "register" ? "Create a password (6+ chars)" : "Enter your password"}
                secureTextEntry
              />

              {error && (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={14} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === "login" ? "Log In" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest option */}
          <View style={styles.guestContainer}>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.border }]} />
            <Text style={styles.dividerText}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.border }]} />
          </View>

          <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} activeOpacity={0.7}>
            <Feather name="user" size={16} color={COLORS.muted} />
            <Text style={styles.guestBtnText}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={styles.guestNote}>Scores will not sync across devices</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },

  header: { alignItems: "center", paddingTop: 40, paddingBottom: 28 },
  stripes: { flexDirection: "row", marginBottom: 20, borderRadius: 4, overflow: "hidden" },
  stripe: { width: 36, height: 6 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.card, alignItems: "center", justifyContent: "center",
    marginBottom: 16, borderWidth: 2, borderColor: COLORS.green,
  },
  logoEmoji: { fontSize: 36 },
  appTitle: { fontSize: 32, fontFamily: "Inter_700Bold", color: COLORS.white, letterSpacing: -0.5, marginBottom: 6 },
  appTagline: { fontSize: 15, fontFamily: "Inter_400Regular", color: COLORS.muted },

  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border },

  tabs: { flexDirection: "row", backgroundColor: COLORS.bg, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.green },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.muted },
  tabTextActive: { color: COLORS.white },

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
  orText: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.muted },

  form: { gap: 16 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  input: { flex: 1, height: 50, paddingHorizontal: 16, fontSize: 15, fontFamily: "Inter_400Regular", color: COLORS.white },
  eyeBtn: { paddingHorizontal: 14, height: 50, justifyContent: "center" },

  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(248, 113, 113, 0.1)", borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(248, 113, 113, 0.2)",
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.error, flex: 1 },

  submitBtn: { height: 52, backgroundColor: COLORS.green, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 4 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.white, letterSpacing: 0.2 },

  guestContainer: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 14, gap: 12 },
  dividerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.muted },
  guestBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  guestBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: COLORS.muted },
  guestNote: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.muted, marginTop: 10, opacity: 0.7 },
});
