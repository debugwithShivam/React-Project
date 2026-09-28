import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/api/axios';

type LegalPage = { title: string; content_html: string; updated_at?: string };
const TITLES: Record<string, string> = { 'privacy-policy': 'Privacy Policy', 'terms-conditions': 'Terms & Conditions' };
function htmlToText(html: string) {
  return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h[1-6]|li|section|tr)>/gi, '\n\n').replace(/<li\b[^>]*>/gi, '• ').replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
export default function LegalPageScreen() {
  const { slug: routeSlug } = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(routeSlug) ? routeSlug[0] : routeSlug;
  const [page, setPage] = useState<LegalPage | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let active = true; if (!slug || !TITLES[slug]) { setError('This page is not available.'); setLoading(false); return; } api.get(`/pages/${slug}`).then(({ data }) => { if (active) setPage(data.page); }).catch((e: any) => { if (active) setError(e?.response?.status === 404 ? 'This page has not been published yet.' : 'Could not load this page. Check your connection and try again.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [slug]);
  return <SafeAreaView style={s.safe}><Stack.Screen options={{ title: TITLES[slug] || 'Information', headerShown: true }} />{loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#111" /> : error ? <View style={s.center}><Text style={s.error}>{error}</Text></View> : <ScrollView contentContainerStyle={s.body}><Text style={s.title}>{page?.title || TITLES[slug]}</Text>{page?.updated_at ? <Text style={s.updated}>Updated {new Date(page.updated_at).toLocaleDateString()}</Text> : null}<Text selectable style={s.content}>{htmlToText(page?.content_html || '')}</Text></ScrollView>}</SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#fff' }, body: { padding: 20, paddingBottom: 40 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, title: { color: '#111', fontSize: 24, lineHeight: 31, fontWeight: '900', marginBottom: 8 }, updated: { color: '#888', fontSize: 12, marginBottom: 20 }, content: { color: '#444', fontSize: 15, lineHeight: 24 }, error: { color: '#666', textAlign: 'center', lineHeight: 22 } });
