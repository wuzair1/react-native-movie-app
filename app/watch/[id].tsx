import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { getArchivePageUrl, getFreeMovie } from "@/constants/freeMovies";
import { useLibrary } from "@/services/library";
import { buildPlayerHtml } from "@/services/playback";
import { useDemo } from "@/services/demo";

export default function Watch() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { saved, toggleMovie, ready } = useLibrary();
  const focused = useIsFocused();
  const demo = useDemo();
  const movie = getFreeMovie(id);
  const resume = useRef<{ id: string; seconds: number } | null>(null);
  if (demo.ready && resume.current?.id !== id) resume.current = { id, seconds: demo.state.progress[id] || 0 };
  const startSeconds = resume.current?.seconds || 0;
  const html = useMemo(() => movie && movie.archiveId ? buildPlayerHtml(movie, startSeconds) : "", [movie, startSeconds]);

  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webView = useRef<WebView>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [id, attempt, focused]);

  useEffect(() => {
    if (!loading || !focused || !movie || Platform.OS === "web") return;
    const timeout = setTimeout(() => {
      setLoading(false);
      setError("The video is taking too long to load. Check your connection and try again.");
    }, 30000);
    return () => clearTimeout(timeout);
  }, [loading, focused, movie]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        webView.current?.injectJavaScript("document.getElementById('movie')?.pause(); true;");
      }
    });
    return () => subscription.remove();
  }, []);

  const goBack = () => router.canGoBack() ? router.back() : router.replace("/");
  const failed = () => {
    setLoading(false);
    setError("Unable to play this video. Check your internet connection or try the source page.");
  };
  const openLink = async (url: string) => {
    try { await Linking.openURL(url); }
    catch { setError("Unable to open the link. Please check your connection."); }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
        <TouchableOpacity onPress={goBack} accessibilityRole="button" className="self-start py-3 mb-3">
          <Text className="text-accent font-semibold">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold mb-2">{movie?.title ?? "Streaming"}</Text>
        {!movie ? (
          <Text className="text-light-200">This movie is unavailable.</Text>
        ) : (
          <>
            <TouchableOpacity accessibilityRole="button" disabled={!ready} onPress={() => toggleMovie({ id: movie.tmdbId, title: movie.title, poster_path: null, release_date: String(movie.year), vote_average: 0 })} className="py-3 mb-2">
              <Text className="text-accent">{saved.some(item => item.id === movie.tmdbId) ? "Remove from saved" : "Save movie"}</Text>
            </TouchableOpacity>
            <Text className="text-light-200 mb-5">{movie.year} · Free film · CC BY 3.0</Text>
            <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" }}>
              {focused && demo.ready && !error && Platform.OS !== "web" && (
                <WebView
                  ref={webView}
                  key={`${id}-${attempt}`}
                  source={{ html, baseUrl: "https://archive.org/" }}
                  style={{ flex: 1, backgroundColor: "#000" }}
                  originWhitelist={["*"]}
                  javaScriptEnabled
                  domStorageEnabled
                  mixedContentMode="never"
                  allowFileAccess={false}
                  javaScriptCanOpenWindowsAutomatically={false}
                  onShouldStartLoadWithRequest={request => request.url === "about:blank" || request.url === "https://archive.org/"}
                  allowsFullscreenVideo
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction
                  setSupportMultipleWindows={false}
                  onError={failed}
                  onHttpError={failed}
                  onRenderProcessGone={failed}
                  onContentProcessDidTerminate={failed}
                  onLoadEnd={() => setLoading(false)}
                  onMessage={({ nativeEvent }) => {
                    if (nativeEvent.data === "ready") setLoading(false);
                    if (nativeEvent.data === "error") failed();
                    try {
                      const message = JSON.parse(nativeEvent.data);
                      if (movie && (message.type === 'progress' || message.type === 'ended')) demo.record(movie.tmdbId, message.seconds, message.type === 'ended');
                    } catch { /* Non-JSON player status messages are handled above. */ }
                  }}
                />
              )}
              {loading && !error && Platform.OS !== "web" && (
                <View pointerEvents="none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, justifyContent: "center" }}>
                  <ActivityIndicator color="#AB8BFF" accessibilityLabel="Loading video" />
                </View>
              )}
              {Platform.OS === "web" && (
                <View className="flex-1 justify-center p-5">
                  <Text className="text-white text-center">Open the source page below to watch in your browser.</Text>
                </View>
              )}
            </View>
            <Text className="text-light-200 text-sm mt-3">Tap Play to start. Use the player controls for seeking and fullscreen.</Text>
            {error && (
              <View className="mt-4">
                <Text className="text-red-400">{error}</Text>
                <TouchableOpacity onPress={() => setAttempt((value) => value + 1)} accessibilityRole="button" className="bg-accent rounded-lg p-4 mt-3">
                  <Text className="text-primary text-center font-semibold">Try again</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text className="text-light-200 text-sm mt-5">{movie.attribution}</Text>
            {movie.licenseUrl && <TouchableOpacity accessibilityRole="link" onPress={() => void openLink(movie.licenseUrl!)} className="py-2"><Text className="text-accent">Creative Commons Attribution 3.0 license ↗</Text></TouchableOpacity>}
            {movie.projectUrl && <TouchableOpacity accessibilityRole="link" onPress={() => void openLink(movie.projectUrl!)} className="py-2"><Text className="text-accent">Creator and credits ↗</Text></TouchableOpacity>}
            <TouchableOpacity onPress={() => void openLink(getArchivePageUrl(movie))} accessibilityRole="link" className="py-3 mt-4">
              <Text className="text-accent">View original film source ↗</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


