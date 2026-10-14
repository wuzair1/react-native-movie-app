import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Keyboard, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { fetchInstagramEmbed, isInstagramNavigation, normalizeReelUrl } from "@/services/instagram";

export default function InstagramReelPlayer() {
  const configured = Boolean(process.env.EXPO_PUBLIC_INSTAGRAM_OEMBED_ENDPOINT);
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [webLoading, setWebLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(AppState.currentState === "active");
  const controller = useRef<AbortController | null>(null);
  const webTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancel = useCallback(() => {
    controller.current?.abort(); controller.current = null;
    clearTimeout(webTimer.current); setLoading(false); setWebLoading(false); setHtml(null);
  }, []);
  useFocusEffect(useCallback(() => () => cancel(), [cancel]));
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      setActive(state === "active");
      if (state !== "active") cancel();
    });
    return () => { subscription.remove(); cancel(); };
  }, [cancel]);
  const play = async () => {
    Keyboard.dismiss();
    if (!configured) {
      try { const normalized = normalizeReelUrl(url); setError(null); external(normalized); }
      catch (e) { setError(e instanceof Error ? e.message : "Paste a valid Instagram Reel URL."); }
      return;
    }
    if (controller.current) return;
    const request = new AbortController(); controller.current = request;
    setLoading(true); setError(null); setHtml(null);
    const timeout = setTimeout(() => request.abort(), 15000);
    try {
      const result = await fetchInstagramEmbed(url, request.signal);
      if (controller.current === request && !request.signal.aborted) {
        setHtml(result); setWebLoading(true);
        webTimer.current = setTimeout(() => { setWebLoading(false); setError("Instagram took too long to load. Try again or open the Reel in your browser."); }, 20000);
      }
    } catch (e) {
      if (controller.current === request) setError(request.signal.aborted ? "Request timed out. Try again." : e instanceof Error ? e.message : "Unable to load this Reel.");
    } finally {
      clearTimeout(timeout);
      if (controller.current === request) { controller.current = null; setLoading(false); }
    }
  };
  const external = (raw: string) => {
    try { const parsed = new URL(raw); if (parsed.protocol === "https:" && !parsed.username && !parsed.password) void Linking.openURL(raw).catch(() => setError("Could not open your browser.")); } catch {}
  };
  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 90 }}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={{ flexGrow: html ? 0 : 1, maxHeight: html ? 300 : undefined }} contentContainerStyle={{ paddingBottom: 16 }}>
      <TouchableOpacity accessibilityRole="button" onPress={() => external("https://www.instagram.com/reels/")} style={{ backgroundColor: "#0F0D23", borderColor: "#AB8BFF", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 }}>
        <Text style={{ color: "#AB8BFF", textAlign: "center", fontWeight: "bold" }}>Browse Reels on Instagram ↗</Text>
      </TouchableOpacity>
      <Text style={{ color: "#A8B5DB", marginBottom: 16 }}>Opens Instagram for browsing. Instagram may require login.</Text>
      <Text style={{ color: "#fff", marginBottom: 8 }}>{configured ? "Paste a public Instagram Reel URL" : "Or paste a Reel link to open on Instagram"}</Text>
      <TextInput accessibilityLabel="Instagram Reel URL" editable={!loading} value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://www.instagram.com/reel/…" placeholderTextColor="#9CA4AB" style={{ color: "#fff", backgroundColor: "#0F0D23", padding: 12, borderRadius: 12 }} />
      <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={play} style={{ backgroundColor: "#AB8BFF", opacity: loading ? 0.5 : 1, borderRadius: 12, padding: 12, marginVertical: 12 }}>
        <Text style={{ textAlign: "center", fontWeight: "bold" }}>{configured ? "Play Reel" : "Open Reel on Instagram ↗"}</Text>
      </TouchableOpacity>
      {(loading || webLoading) && <ActivityIndicator accessibilityLabel="Loading Reel" color="#AB8BFF" />}
      {error && <Text accessibilityRole="alert" style={{ color: "#ffb4b4", marginVertical: 8 }}>{error}</Text>}
      {configured && Platform.OS === "web" && <Text style={{ color: "#fff" }}>Embedded playback is supported on Android and iOS.</Text>}
      </ScrollView>
      {html && active && Platform.OS !== "web" && <WebView
        source={{ html, baseUrl: "https://www.instagram.com/" }} style={{ flex: 1, marginTop: 8 }}
        javaScriptEnabled domStorageEnabled thirdPartyCookiesEnabled
        sharedCookiesEnabled={false} mixedContentMode="never" allowFileAccess={false}
        allowFileAccessFromFileURLs={false} allowUniversalAccessFromFileURLs={false}
        javaScriptCanOpenWindowsAutomatically={false} setSupportMultipleWindows
        mediaPlaybackRequiresUserAction allowsFullscreenVideo
        originWhitelist={["*"]}
        onShouldStartLoadWithRequest={request => {
          if (request.url === "about:blank" || isInstagramNavigation(request.url)) return true;
          external(request.url); return false;
        }}
        onOpenWindow={event => external(event.nativeEvent.targetUrl)}
        onLoadEnd={() => { clearTimeout(webTimer.current); setWebLoading(false); }}
        onError={() => { clearTimeout(webTimer.current); setWebLoading(false); setError("Instagram could not load. Check your connection or open the Reel in your browser."); }}
        onHttpError={event => { if (event.nativeEvent.statusCode >= 400) setError("Instagram content is unavailable or restricted."); }}
        onContentProcessDidTerminate={() => { cancel(); setError("The player stopped. Tap Play Reel to reload."); }}
        onRenderProcessGone={() => { cancel(); setError("The player stopped. Tap Play Reel to reload."); }}
      />}
      {html && <Text style={{ color: "#A8B5DB", marginTop: 8 }}>Tap the Instagram player to start. Private, restricted, or embedding-disabled Reels may be unavailable.</Text>}
    </View>
  );
}




