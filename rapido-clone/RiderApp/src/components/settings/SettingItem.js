import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../../theme';
import { StatusBadge } from '../common/StatusBadge';

export const SettingItem = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  badgeText,
  badgeColor,
  rightValue,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
  isDestructive = false,
  showChevron = true,
  style,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          borderBottomColor: colors.border,
        },
        style,
      ]}
      onPress={isSwitch ? () => onSwitchChange && onSwitchChange(!switchValue) : onPress}
      disabled={!onPress && !isSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.leftRow}>
        {icon && (
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor:
                  iconBgColor ||
                  (isDark ? colors.surfaceSubtle : colors.primaryLight),
              },
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={iconColor || (isDestructive ? colors.danger : colors.primary)}
            />
          </View>
        )}

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                Typography.title,
                {
                  color: isDestructive ? colors.danger : colors.textPrimary,
                  fontWeight: '600',
                },
              ]}
            >
              {title}
            </Text>
            {badgeText && (
              <StatusBadge
                text={badgeText}
                color={badgeColor || colors.primary}
                size="small"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          {subtitle && (
            <Text
              style={[
                Typography.caption,
                { color: colors.textSecondary, marginTop: 2 },
              ]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightRow}>
        {rightValue && (
          <Text
            style={[
              Typography.caption,
              { color: colors.textSecondary, marginRight: 6, fontWeight: '600' },
            ]}
          >
            {rightValue}
          </Text>
        )}

        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={'#FFFFFF'}
          />
        ) : showChevron ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textMuted}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
