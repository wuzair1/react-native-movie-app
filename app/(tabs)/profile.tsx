import { useState } from "react";
import { Alert, Linking, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { tmdbLogo } from "@/constants/tmdbLogo";
import { useLibrary } from "@/services/library";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
  const { nickname, saved, analytics, setAnalytics, setNickname, clearSaved, ready, error } = useLibrary();
  const [draft, setDraft] = useState("");
  const open = (url: string) => Linking.openURL(url).catch(() => Alert.alert("Unable to open link", "Please try again."));
  return <SafeAreaView className="bg-primary flex-1">
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
      <Text className="text-white text-2xl font-bold mb-4">Profile</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/drama')} className="bg-dark-100 p-4 rounded-xl mb-4"><Text className="text-accent font-bold">Stories, demo rewards & wallet</Text><Text className="text-light-200 mt-1">No cash value · Simulated withdrawals</Text></TouchableOpacity>
      <Text className="text-white text-lg">Hello, {nickname}</Text>
      <Text className="text-light-200 mt-2 mb-5">{saved.length} saved movies · Stored on this device</Text>
      <Text className="text-light-100 mb-2">Display name</Text>
      <TextInput accessibilityLabel="Display name" placeholder={nickname} placeholderTextColor="#9CA4AB" value={draft} onChangeText={setDraft} maxLength={40} className="bg-dark-100 text-white p-4 rounded-xl" />
      <TouchableOpacity accessibilityRole="button" disabled={!ready} onPress={() => { setNickname(draft || nickname); setDraft(""); }} className="bg-accent p-4 rounded-xl mt-3"><Text className="text-primary text-center font-bold">Save name</Text></TouchableOpacity>
      <View className="flex-row items-center justify-between mt-7">
        <Text className="text-white flex-1 mr-3">Share search statistics</Text>
        <Switch accessibilityLabel="Share search statistics" value={analytics} onValueChange={setAnalytics} disabled={!ready} trackColor={{ true: "#AB8BFF" }} />
      </View>
      <Text className="text-light-200 mt-2">Optional. When enabled, search terms and matching movies may be sent to the app's analytics service to build its trending list. Off by default.</Text>
      <TouchableOpacity accessibilityRole="button" disabled={!ready || saved.length === 0} className="mt-6 py-3" onPress={() => Alert.alert("Clear saved movies?", "This removes your saved list from this device.", [{ text: "Cancel", style: "cancel" }, { text: "Clear", style: "destructive", onPress: clearSaved }])}><Text className="text-red-400">Clear saved movies</Text></TouchableOpacity>
      {error && <Text className="text-red-400">{error}</Text>}
      <Text className="text-white text-lg font-bold mt-7">About this app</Text>
      <Text className="text-light-200 mt-3">Movie discovery, saved favorites, licensed free films, and links to Instagram and YouTube. Availability and login requirements depend on each service.</Text>
      <View style={{ marginTop: 20 }}><SvgXml xml={tmdbLogo} width={120} height={18} /></View>
      <Text className="text-light-200 mt-4">This product uses the TMDB API but is not endorsed or certified by TMDB.</Text>
      <TouchableOpacity accessibilityRole="link" onPress={() => open("https://www.themoviedb.org/")} className="py-3"><Text className="text-accent">Movie data from TMDB ↗</Text></TouchableOpacity>
      <Text className="text-white font-bold mt-5">Privacy</Text>
      <Text className="text-light-200 mt-2">Your name and saved list stay on this device. Movie searches go to TMDB. Optional search statistics are sent only when enabled. Opening external videos uses that provider's app or browser and privacy policy. No account password is collected by this app.</Text>
      <TouchableOpacity accessibilityRole="link" onPress={() => open("https://www.themoviedb.org/privacy-policy")} className="py-3"><Text className="text-accent">TMDB privacy policy ↗</Text></TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}
