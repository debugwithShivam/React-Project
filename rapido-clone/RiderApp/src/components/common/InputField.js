import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../../theme';

export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  secureTextEntry = false,
  error,
  editable = true,
  multiline = false,
  style,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            Typography.caption,
            { color: colors.textSecondary, marginBottom: 6, fontWeight: '600' },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          multiline={multiline}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              minHeight: multiline ? 80 : 44,
            },
          ]}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text
          style={[
            Typography.captionSmall,
            { color: colors.danger, marginTop: 4 },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
});
