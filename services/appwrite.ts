import { Client, Databases, ID, Query } from "react-native-appwrite";
import Constants from "expo-constants";
import { hasSearchConsent } from "./library";
import { Platform } from "react-native";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const configured = Boolean(projectId && DATABASE_ID && COLLECTION_ID);
const client = new Client().setEndpoint(
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
);
if (projectId) client.setProject(projectId);
const platform = Platform.OS === "android"
  ? Constants.expoConfig?.android?.package
  : Constants.expoConfig?.ios?.bundleIdentifier;
if (platform) client.setPlatform(platform);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  if (!configured || !(await hasSearchConsent())) return;
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  if (!configured) return [];
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
