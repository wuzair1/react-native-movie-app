import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { freeMovies } from '@/constants/freeMovies';
import { useDemo } from '@/services/demo';
import { useLibrary } from '@/services/library';

export default function Drama() {
  const router = useRouter();
  const demo = useDemo();
  const library = useLibrary();
  const [tab, setTab] = useState('Stories');
  const [query, setQuery] = useState('');
  const [historyOnly, setHistoryOnly] = useState(false);
  const today = `daily:${new Date().toISOString().slice(0, 10)}`;
  const checked = demo.state.entries.some(e => e.id === today);
  const button = (label: string, action: () => void, disabled = false) => <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={action} style={{ opacity: disabled ? 0.5 : 1 }} className="bg-accent p-4 rounded-xl mt-3"><Text className="text-primary font-bold text-center">{label}</Text></TouchableOpacity>;
  return <SafeAreaView className="flex-1 bg-primary"><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
    <TouchableOpacity accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} className="py-3"><Text className="text-accent">← Back</Text></TouchableOpacity>
    <Text className="text-white text-3xl font-bold">Stories & rewards</Text>
    <View className="bg-dark-100 rounded-xl p-4 mt-4"><Text className="text-accent font-bold">DEMO · No cash value</Text><Text className="text-light-200 mt-2">Licensed sample films stand in for drama episodes. Points and withdrawals are simulations. No ads, payments, or real earnings.</Text></View>
    <View className="flex-row mt-5">{['Stories', 'Rewards', 'Wallet'].map(name => <TouchableOpacity key={name} accessibilityRole="button" accessibilityState={{ selected: tab === name }} onPress={() => setTab(name)} className="flex-1 py-3"><Text className={tab === name ? 'text-accent text-center font-bold' : 'text-light-200 text-center'}>{name}</Text></TouchableOpacity>)}</View>
    {tab === 'Stories' && <>
      <TextInput accessibilityLabel="Search sample stories" value={query} onChangeText={setQuery} placeholder="Search sample stories" placeholderTextColor="#9CA4AB" className="bg-dark-100 rounded-xl p-4 text-white mt-3" />
      <TouchableOpacity accessibilityRole="button" onPress={() => setHistoryOnly(!historyOnly)} className="py-4"><Text className="text-accent">{historyOnly ? 'Show all stories' : 'Viewing history'}</Text></TouchableOpacity>
      {freeMovies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()) && (!historyOnly || m.tmdbId in demo.state.progress)).map(movie => <View key={movie.tmdbId} className="bg-dark-100 rounded-xl p-5 mb-4">
        <Text className="text-white text-xl font-bold">{movie.title}</Text><Text className="text-light-200 mt-2">{movie.year} · Animation · 1 sample episode</Text>
        <Text className="text-light-200 mt-2">{movie.tmdbId === 10378 ? 'A gentle rabbit faces a trio of forest troublemakers.' : 'A young traveller searches for a lost dragon companion.'}</Text>
        <Text className="text-light-200 mt-3">{movie.attribution} · CC BY 3.0</Text>
        {button(demo.state.progress[movie.tmdbId] > 0 ? `Resume episode 1 · ${Math.floor(demo.state.progress[movie.tmdbId] / 60)} min` : 'Play episode 1', () => router.push(`/watch/${movie.tmdbId}`), !demo.ready)}
        <TouchableOpacity accessibilityRole="button" disabled={!library.ready} className="py-3" onPress={() => library.toggleMovie({ id: movie.tmdbId, title: movie.title, poster_path: null, release_date: String(movie.year), vote_average: 0 })}><Text className="text-accent">{library.saved.some(m => m.id === movie.tmdbId) ? 'Remove favourite' : 'Save favourite'}</Text></TouchableOpacity>
      </View>)}
      {!freeMovies.some(m => m.title.toLowerCase().includes(query.toLowerCase()) && (!historyOnly || m.tmdbId in demo.state.progress)) && <Text className="text-light-200">No matching stories yet.</Text>}
    </>}
    {tab === 'Rewards' && <>
      <Text className="text-white text-xl font-bold mt-4">Demo activities</Text><Text className="text-light-200 mt-3">Check in once per UTC day for 100 demo points. Finish each sample episode once for 50 demo points. These points cannot be redeemed for money.</Text>
      {button(checked ? 'Today’s check-in claimed' : 'Claim daily demo check-in', demo.checkIn, !demo.ready || checked)}
      {freeMovies.map(m => <Text key={m.tmdbId} className="text-light-200 mt-4">{m.title}: {demo.state.entries.some(e => e.id === `episode:${m.tmdbId}`) ? '50 demo points claimed' : 'Finish playback to claim 50 demo points'}</Text>)}
    </>}
    {tab === 'Wallet' && <>
      <Text className="text-white text-3xl font-bold mt-5">{demo.points} demo points</Text><Text className="text-light-200 mt-3">Simulation only. A demo withdrawal deducts 100 points and records an entry. No money is sent and no bank information is requested.</Text>
      {button('Simulate withdrawal · 100 points', () => Alert.alert('Simulate withdrawal?', 'This is a demo. No payment will be made.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Simulate', onPress: demo.withdraw }]), !demo.ready || demo.points < 100)}
      <Text className="text-white text-xl font-bold mt-6">Activity history</Text>
      {[...demo.state.entries].reverse().map(entry => <View key={entry.id} className="py-4 border-b border-dark-100"><Text className="text-white">{entry.label}</Text><Text className="text-accent mt-1">{entry.points > 0 ? '+' : ''}{entry.points} demo points</Text></View>)}
      {!demo.state.entries.length && <Text className="text-light-200 mt-3">No demo activity yet.</Text>}
    </>}
    {!demo.ready && <Text className="text-light-200 mt-4">Loading demo history…</Text>}{!!demo.error && <Text className="text-red-400 mt-4">{demo.error}</Text>}
  </ScrollView></SafeAreaView>;
}
