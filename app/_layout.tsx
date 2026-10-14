import "react-native-url-polyfill/auto";
import { LibraryProvider } from "@/services/library";
import { DemoProvider } from "@/services/demo";
import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <LibraryProvider><DemoProvider>
      <StatusBar barStyle="light-content" backgroundColor="#030014" />

      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="movie/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="watch/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="drama" options={{ headerShown: false }} />
      </Stack>
    </DemoProvider></LibraryProvider>
  );
}
