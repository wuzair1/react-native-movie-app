import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useLibrary } from "@/services/library";
import { getFreeMovie } from "@/constants/freeMovies";

export default function Save() {
  const { saved, ready, error, toggleMovie } = useLibrary();
  return <SafeAreaView className="bg-primary flex-1 px-5">
    <Text className="text-white text-2xl font-bold mt-5 mb-4">Saved movies</Text>
    {error && <Text className="text-red-400 mb-3">{error}</Text>}
    {!ready ? <ActivityIndicator color="#AB8BFF" /> : <FlatList data={saved} keyExtractor={item => String(item.id)}
      contentContainerStyle={{ paddingBottom: 110 }}
      ListEmptyComponent={<Text className="text-light-200 mt-5">Save a movie from its details screen to find it here. Your list stays on this device.</Text>}
      renderItem={({ item }) => <View className="bg-dark-100 rounded-xl p-4 mb-3">
        <Link href={getFreeMovie(item.id) ? `/watch/${item.id}` : `/movie/${item.id}`} asChild>
          <TouchableOpacity accessibilityRole="button"><Text className="text-white font-bold text-lg">{item.title}</Text><Text className="text-light-200 mt-1">{item.release_date?.slice(0, 4) || "Movie"}</Text></TouchableOpacity>
        </Link>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${item.title} from saved`} onPress={() => toggleMovie(item)} className="pt-3">
          <Text className="text-accent">Remove from saved</Text>
        </TouchableOpacity>
      </View>} />}
  </SafeAreaView>;
}
