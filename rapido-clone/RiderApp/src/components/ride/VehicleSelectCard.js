import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { StatusBadge } from '../common/StatusBadge';

export const VehicleSelectCard = ({
  vehicle,
  isSelected,
  onSelect,
  calculatedFare,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? (isDark ? '#162238' : '#F0F9FF')
            : (isDark ? colors.surface : '#FFFFFF'),
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={() => onSelect(vehicle)}
      activeOpacity={0.8}
    >
      <View style={styles.leftCol}>
        {/* Vehicle Icon Badge */}
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isSelected
                ? colors.primaryLight
                : (isDark ? colors.surfaceSubtle : '#F1F5F9'),
            },
          ]}
        >
          <MaterialCommunityIcons
            name={vehicle.iconName}
            size={28}
            color={isSelected ? colors.primary : colors.textPrimary}
          />
        </View>

        {/* Details */}
        <View style={styles.detailsCol}>
          <View style={styles.titleRow}>
            <Text
              style={[
                Typography.title,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              {vehicle.name}
            </Text>
            {vehicle.badge && (
              <StatusBadge
                text={vehicle.badge}
                color={vehicle.badgeColor}
                size="small"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>

          <Text
            style={[
              Typography.caption,
              { color: colors.textSecondary, marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {vehicle.tagline}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={12}
                color={colors.textMuted}
              />
              <Text
                style={[
                  Typography.captionSmall,
                  { color: colors.textMuted, marginLeft: 3 },
                ]}
              >
                {vehicle.etaMinutes} min away
              </Text>
            </View>

            <View style={[styles.metaItem, { marginLeft: 12 }]}>
              <MaterialCommunityIcons
                name="account"
                size={12}
                color={colors.textMuted}
              />
              <Text
                style={[
                  Typography.captionSmall,
                  { color: colors.textMuted, marginLeft: 2 },
                ]}
              >
                {vehicle.capacity} seats
              </Text>
            </View>

            {vehicle.helmetProvided && (
              <View style={[styles.metaItem, { marginLeft: 12 }]}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={12}
                  color="#10B981"
                />
                <Text
                  style={[
                    Typography.captionSmall,
                    { color: '#10B981', marginLeft: 2, fontWeight: '600' },
                  ]}
                >
                  Helmet Inc.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Fare Column */}
      <View style={styles.fareCol}>
        <Text
          style={[
            Typography.headerSmall,
            { color: isSelected ? colors.primary : colors.textPrimary },
          ]}
        >
          ₹{calculatedFare || vehicle.basePrice}
        </Text>
        <Text
          style={[
            Typography.captionSmall,
            { color: colors.textMuted, textDecorationLine: 'line-through' },
          ]}
        >
          ₹{Math.round((calculatedFare || vehicle.basePrice) * 1.25)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  detailsCol: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fareCol: {
    alignItems: 'flex-end',
    minWidth: 65,
  },
});
