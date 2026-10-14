import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { freeMovies } from "@/constants/freeMovies";
import { icons } from "@/constants/icons";

export default function FreeMovies() {
  return (
    <View className="mt-5 mb-5">
      <Text className="text-lg text-white font-bold">Watch for free</Text>
      <Text className="text-light-200 text-sm mt-1 mb-3">
        Free short films · Streamed from Internet Archive
      </Text>
      <View className="flex-row gap-3">
        {freeMovies.map((movie) => (
          <Link key={movie.tmdbId} href={`/watch/${movie.tmdbId}`} asChild>
            <TouchableOpacity
              className="flex-1 bg-dark-200 rounded-xl p-4"
              accessibilityRole="button"
              accessibilityLabel={`Watch ${movie.title} for free`}
            >
              <Image source={icons.play} className="size-6 mb-3" tintColor="#AB8BFF" />
              <Text className="text-white font-bold">{movie.title}</Text>
              <Text className="text-light-200 text-sm mt-1">{movie.year} · Short film</Text>
              <Text className="text-accent font-semibold mt-3">Watch now</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </View>
  );
}
