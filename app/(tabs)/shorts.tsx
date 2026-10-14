import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { buildShortsSearchUrl, fetchRealtimeShorts, ShortItem } from "@/services/shorts";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { Linking } from "react-native";

export default function ShortsScreen() {
  const [query, setQuery] = useState("funny cat");
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShorts = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRealtimeShorts(searchQuery);
      setShorts(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch shorts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShorts(query);
  }, []);

  return (
    <SafeAreaView className="bg-primary flex-1 px-5 pt-5">
      <Text className="text-white text-2xl font-bold mb-4">Shorts</Text>
      <SearchBar
        placeholder="Search shorts (e.g. funny cat, trailer)..."
        value={query}
        onChangeText={(text) => setQuery(text)}
        onSubmit={() => loadShorts(query)}
      />

      <TouchableOpacity accessibilityRole="link" className="bg-accent rounded-xl p-4 mt-4" onPress={() => Linking.openURL(buildShortsSearchUrl(query)).catch(() => setError("Unable to open YouTube."))}>
        <Text className="text-primary text-center font-bold">Find Shorts on YouTube ↗</Text>
      </TouchableOpacity>
      <Text className="text-light-200 mt-3">Free browsing opens YouTube. Search for clips, trailers, or creators.</Text>
      {loading && (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#AB8BFF" />
        </View>
      )}

      {error && (
        <Text className="text-red-400 text-center mt-5">{error}</Text>
      )}

      {!loading && !error && (
        <FlatList
          data={shorts}
          keyExtractor={(item, index) => item.id || index.toString()}
          className="mt-4"
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => Linking.openURL(item.url).catch(() => setError("Unable to open the clip."))}
              className="bg-dark-100 rounded-xl p-3 mb-4 flex-row items-center"
            >
              {item.thumbnail ? (
                <Image source={{ uri: item.thumbnail }} className="w-24 h-16 rounded-lg mr-3" resizeMode="cover" />
              ) : (
                <View className="w-24 h-16 bg-dark-200 rounded-lg mr-3 justify-center items-center">
                  <Image source={icons.play} className="size-6" tintColor="#AB8BFF" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-white font-bold text-sm" numberOfLines={2}>
                  {item.title || "Untitled Short"}
                </Text>
                <Text className="text-light-200 text-xs mt-1">
                  {item.channelTitle || "Video clip"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="text-light-200 text-center mt-10">Use the button above to browse Shorts for free.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

