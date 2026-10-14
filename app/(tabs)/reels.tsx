import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { buildShortsSearchUrl, fetchRealtimeShorts } from "@/services/shorts";
import InstagramReelPlayer from "@/components/InstagramReelPlayer";
import { icons } from "@/constants/icons";
import { Linking } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ReelsScreen() {
  const [activeTab, setActiveTab] = useState<"trending" | "instagram">("instagram");
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReels = async (tab: "trending" | "instagram") => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRealtimeShorts(tab === "instagram" ? "instagram reels movie clips" : "trending reels movie shorts");
      setReels(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch reels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "trending") loadReels(activeTab);
  }, [activeTab]);

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Top Floating Category Switcher */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-30 px-4 pt-2">
        <View className="flex-row bg-dark-100/90 p-1 rounded-xl self-center border border-white/20">
          <TouchableOpacity
            onPress={() => setActiveTab("instagram")}
            className={`px-4 py-2 rounded-lg items-center ${activeTab === "instagram" ? "bg-accent" : ""}`}
          >
            <Text className={`font-bold text-xs ${activeTab === "instagram" ? "text-primary" : "text-white"}`}>
              Instagram Reels
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("trending")}
            className={`px-4 py-2 rounded-lg items-center ${activeTab === "trending" ? "bg-accent" : ""}`}
          >
            <Text className={`font-bold text-xs ${activeTab === "trending" ? "text-primary" : "text-white"}`}>
              Trending Reels
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {activeTab === "instagram" ? <View style={{ flex: 1, paddingTop: 100 }}><InstagramReelPlayer /></View> : <FlatList
        ListHeaderComponent={<View style={{ paddingTop: 110, paddingHorizontal: 20 }}>
          <TouchableOpacity accessibilityRole="link" className="bg-accent rounded-xl p-4" onPress={() => Linking.openURL(buildShortsSearchUrl("trending movie clips")).catch(() => setError("Unable to open YouTube."))}>
            <Text className="text-primary text-center font-bold">Browse trending clips on YouTube ↗</Text>
          </TouchableOpacity>
          {error && <Text className="text-red-400 mt-3">{error}</Text>}
        </View>}
        ListEmptyComponent={<Text className="text-light-200 text-center p-5">Browse clips for free using the button above.</Text>}
        data={reels}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => {
          const mediaUrl = item.thumbnail_url || item.media_url || item.thumbnail;
          const caption = item.caption || item.title || "Instagram Reel · Movie Clips";
          const permalink = item.permalink || item.url || "https://www.instagram.com/reels/";

          return (
            <View style={{ height: SCREEN_HEIGHT }} className="w-full relative justify-end bg-black">
              {/* Background Thumbnail / Video Preview */}
              {mediaUrl ? (
                <Image source={{ uri: mediaUrl }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
              ) : (
                <View className="absolute inset-0 bg-dark-200 justify-center items-center">
                  <Image source={icons.play} className="size-16" tintColor="#fff" />
                </View>
              )}

              {/* Gradient Overlay for Readability */}
              <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Bottom Content / Caption Bar */}
              <View className="p-5 pb-24 z-20">
                <View className="flex-row items-center mb-3">
                  <View className="size-10 bg-accent rounded-full justify-center items-center mr-3 border border-white">
                    <Text className="text-primary font-bold">IG</Text>
                  </View>
                  <Text className="text-white font-bold text-base mr-3">
                    {item.channelTitle || "instagram_user"}
                  </Text>

                </View>

                <Text className="text-white text-sm font-normal mb-3" numberOfLines={3}>
                  {caption}
                </Text>

                {/* Audio Track Tag */}
                <View className="flex-row items-center">
                  <Image source={icons.play} className="size-4 mr-2" tintColor="#fff" />
                  <Text className="text-white text-xs">Original Audio - Instagram Reels</Text>
                </View>

                {/* Watch on Instagram Button */}
                <TouchableOpacity
                  onPress={() => Linking.openURL(permalink).catch(() => setError("Unable to open this clip."))}
                  className="bg-accent rounded-xl py-3 mt-4 items-center"
                >
                  <Text className="text-primary font-bold text-sm">Open video clip ↗</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />}
    </View>
  );
}



