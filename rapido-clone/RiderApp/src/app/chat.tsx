import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import api from '@/api/axios';
import { getSocket } from '@/api/socket';

type Msg = {
  id: number;
  ride_id: number;
  sender_id: number;
  sender_role?: string;
  sender_name?: string;
  body: string;
  created_at: string;
};

export default function ChatScreen() {
  const params = useLocalSearchParams<{ rideId?: string }>();
  const rideId = params.rideId;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  const appendMessage = useCallback((m: Msg) => {
    setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
  }, []);

  useEffect(() => {
    if (!rideId) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/rides/${rideId}/messages`);
        if (mounted) setMessages(res.data?.messages || []);
      } catch (e) {
        console.log('CHAT LOAD ERROR', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [rideId]);

  useEffect(() => {
    if (!rideId) return;
    let socket: any;
    let mounted = true;
    (async () => {
      socket = await getSocket();
      socket.on('chat:message', (m: Msg) => {
        if (!mounted) return;
        if (String(m?.ride_id) === String(rideId)) appendMessage(m);
      });
    })();
    return () => {
      mounted = false;
      if (socket) socket.off('chat:message');
    };
  }, [rideId, appendMessage]);

  const handleSend = async () => {
    const body = text.trim();
    if (!body || !rideId || sending) return;
    setSending(true);
    setText('');
    try {
      await api.post(`/rides/${rideId}/messages`, { body });
    } catch (e: any) {
      setText(body);
      console.log('CHAT SEND ERROR', e?.response?.data || e?.message);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const mine = String(item.sender_role || '').toUpperCase() === 'DRIVER';
    return (
      <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
          <Text style={[styles.time, mine && styles.timeMine]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Chat with rider</Text>
          <Text style={styles.headerSubtitle}>Ride #{rideId}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.yellow} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="chatbubbles-outline" size={34} color="#59615E" />
              <Text style={styles.emptyText}>No messages yet.</Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inputBar}
      >
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#8D9691"
          multiline
        />
        <Pressable
          style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="send" size={18} color={COLORS.ink} />
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.ink,
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inkSoft,
  },
  headerTitleWrap: { marginLeft: 12 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 11.5, color: '#B6BCB9', marginTop: 2 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 10 },
  listContent: { padding: 16, paddingBottom: 8 },
  bubbleRow: { marginVertical: 4, flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '76%', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9 },
  bubbleMine: { backgroundColor: COLORS.yellow, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: COLORS.paper, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14.5, color: COLORS.ink, lineHeight: 19 },
  bubbleTextMine: { color: COLORS.ink },
  time: { fontSize: 10, color: '#8a7a1a', marginTop: 4, alignSelf: 'flex-end' },
  timeMine: { color: '#7a6a10' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E3E6E3',
    backgroundColor: COLORS.paper,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 42,
    borderRadius: 20,
    backgroundColor: '#F0EFEB',
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 14.5,
    color: COLORS.ink,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: { backgroundColor: '#E4DFA8' },
});
