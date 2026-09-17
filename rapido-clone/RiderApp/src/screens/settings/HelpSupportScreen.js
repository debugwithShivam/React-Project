import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { SettingItem } from '../../components/settings/SettingItem';

export const HelpSupportScreen = () => {
  const { colors, isDark } = useTheme();

  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 'faq_1',
      question: 'How do I report a lost item in my ride?',
      answer: 'Go to My Rides Activity, select the ride during which you lost the item, and tap "Report Lost Item". We will immediately connect you with the captain while keeping your phone number masked.',
    },
    {
      id: 'faq_2',
      question: 'How is the ride fare calculated?',
      answer: 'Fares are calculated upfront based on base price, distance per kilometer, estimated travel time, and a nominal platform insurance fee. Surge pricing may apply during high demand or heavy rain.',
    },
    {
      id: 'faq_3',
      question: 'What if the captain asks for extra cash?',
      answer: 'Our captains are strictly prohibited from asking for extra money over the app fare. If this happens, please decline and report the captain immediately in the app.',
    },
    {
      id: 'faq_4',
      question: 'Are bike helmets sanitized?',
      answer: 'Yes, every bike captain is supplied with sanitized helmets and disposable inner hair caps for your safety and hygiene.',
    },
  ];

  const handleStartChat = () => {
    Alert.alert('24/7 Support Desk', 'Connecting to an UrbanRide safety & support specialist...');
  };

  const handleCallHelpline = () => {
    Alert.alert('Helpline', 'Dialing UrbanRide 24x7 toll-free helpline: 1800-420-9999');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
      ]}
    >
      <CustomHeader
        title="Help & Support"
        subtitle="24/7 customer assistance, FAQs & lost items"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Contact Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
              borderColor: colors.accent,
            },
          ]}
        >
          <View style={styles.heroLeft}>
            <MaterialCommunityIcons name="headset" size={32} color={colors.accent} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={[
                  Typography.title,
                  { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                Need Instant Help?
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                Our 24x7 support team typically responds within 2 minutes.
              </Text>
            </View>
          </View>

          <View style={styles.heroBtnRow}>
            <TouchableOpacity
              style={[styles.actionPill, { backgroundColor: colors.accent }]}
              onPress={handleStartChat}
            >
              <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />
              <Text style={styles.actionPillText}>Start Live Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionPillOutline,
                { borderColor: colors.accent },
              ]}
              onPress={handleCallHelpline}
            >
              <Ionicons name="call" size={16} color={colors.accent} />
              <Text style={[styles.actionPillText, { color: colors.accent }]}>Call 24/7 Desk</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Common Issue Shortcuts */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.xl,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          REPORT AN ISSUE
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            icon="briefcase-search-outline"
            title="I lost an item in a ride"
            subtitle="Connect with captain or report misplaced belongings"
            onPress={() => Alert.alert('Lost Item', 'Please select the ride from your activity to initiate captain contact.')}
          />
          <SettingItem
            icon="cash-refund"
            title="Fare or payment discrepancy"
            subtitle="Incorrect amount charged or double deduction"
            onPress={() => Alert.alert('Fare Review', 'Select the ride to request an automatic fare recalculation.')}
          />
          <SettingItem
            icon="shield-alert-outline"
            title="Driver or safety concern"
            subtitle="Report unsafe driving or misconduct"
            onPress={() => Alert.alert('Safety Desk', 'Our senior safety auditor will review and contact you within 15 minutes.')}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Frequently Asked Questions */}
        <Text
          style={[
            Typography.caption,
            {
              color: colors.textSecondary,
              marginTop: Spacing.xl,
              marginBottom: Spacing.sm,
              fontWeight: '700',
              paddingHorizontal: Spacing.xs,
            },
          ]}
        >
          FREQUENTLY ASKED QUESTIONS
        </Text>

        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                style={[
                  styles.faqItem,
                  {
                    borderBottomWidth: index === faqs.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => setExpandedFaq(isExpanded ? null : faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeaderRow}>
                  <Text
                    style={[
                      Typography.title,
                      { color: colors.textPrimary, fontSize: 14, flex: 1, paddingRight: 8 },
                    ]}
                  >
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textMuted}
                  />
                </View>
                {isExpanded && (
                  <Text
                    style={[
                      Typography.body,
                      { color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
                    ]}
                  >
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBtnRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    marginRight: 8,
  },
  actionPillOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  cardSection: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqItem: {
    padding: Spacing.lg,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
