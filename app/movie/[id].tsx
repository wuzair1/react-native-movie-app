import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import useFetch from "@/services/usefetch";
import { fetchMovieDetails } from "@/services/api";
import { useLibrary } from "@/services/library";
import { getFreeMovie } from "@/constants/freeMovies";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value ?? "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { saved, toggleMovie, ready } = useLibrary();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: movie, loading, error, refetch } = useFetch(() =>
    fetchMovieDetails(id)
  );
  const goBack = () => router.canGoBack() ? router.back() : router.replace("/");
  const freeMovie = getFreeMovie(id);

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <ActivityIndicator color="#AB8BFF" />
      </SafeAreaView>
    );

  if (error || !movie) return (
    <SafeAreaView className="bg-primary flex-1 justify-center px-5">
      <Text className="text-white text-center">{error?.message ?? "Movie not found."}</Text>
      <TouchableOpacity onPress={() => void refetch()} className="bg-accent rounded-lg p-4 mt-5" accessibilityRole="button">
        <Text className="text-primary text-center">Try again</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goBack} className="p-4" accessibilityRole="button">
        <Text className="text-white text-center">Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 90 }}>
        <View>
          <Image
            source={{
              uri: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://placehold.co/600x900/1a1a1a/FFFFFF.png",
            }}
            className="w-full"
            style={{ aspectRatio: 2 / 3 }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/reels")}
            className="absolute top-4 right-4 bg-dark-100/80 p-3 rounded-full border border-accent z-50"
            accessibilityRole="button"
            accessibilityLabel="Open Reels"
          >
            <Image source={icons.play} className="size-6" tintColor="#AB8BFF" />
          </TouchableOpacity>
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          {freeMovie ? (
            <View className="w-full gap-y-3 mt-4">
              <TouchableOpacity
                onPress={() => router.push(`/watch/${movie.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Watch ${movie.title}`}
                className="w-full bg-accent rounded-lg py-4"
              >
                <Text className="text-primary text-center font-bold">Watch Movie · Free</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/reels")}
                accessibilityRole="button"
                accessibilityLabel="View Reels and Clips"
                className="w-full bg-dark-100 border border-accent rounded-lg py-4"
              >
                <Text className="text-accent text-center font-bold">Watch Reels & Clips 🎥</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-light-200 text-sm mt-4">Streaming unavailable for this movie.</Text>
          )}
          <TouchableOpacity accessibilityRole="button" disabled={!ready} onPress={() => toggleMovie({ id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, vote_average: movie.vote_average })} className="bg-dark-100 border border-accent rounded-lg p-4 mt-4 w-full">
            <Text className="text-accent text-center font-bold">{saved.some(item => item.id === movie.id) ? "Remove from saved" : "Save movie"}</Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>

            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row flex-wrap gap-5 w-full">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        style={{ bottom: Math.max(insets.bottom, 12) }}
        onPress={goBack}
        accessibilityRole="button"
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Details;
