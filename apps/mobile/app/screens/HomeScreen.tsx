import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function HomeScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FinanStar</Text>
      <Text style={styles.subtitle}>
        Fase 0 lista: monorepo, TypeScript estricto y navegacion base.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4b5563',
  },
});
