import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, BorderRadius, Spacing } from '../../theme';

export const StatusBadge = ({
  text,
  color = '#0EA5E9',
  textColor,
  size = 'medium',
  style,
}) => {
  const isSmall = size === 'small';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + '1F', // 12% opacity tint
          borderColor: color + '4D', // 30% border opacity
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 8 : 10,
        },
        style,
      ]}
    >
      <Text
        style={[
          isSmall ? Typography.captionSmall : Typography.caption,
          {
            color: textColor || color,
            fontWeight: '700',
            letterSpacing: 0.4,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
