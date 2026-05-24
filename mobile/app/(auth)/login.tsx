import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, Snackbar, Surface } from 'react-native-paper';
import { useAuth } from '../../src/hooks/useAuth';

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  async function handleLogin() {
    try {
      await login(email, password, tenantSlug);
    } catch {
      setSnackVisible(true);
    }
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>Sign In</Text>
        <TextInput
          label="Organization"
          value={tenantSlug}
          onChangeText={setTenantSlug}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading || !email || !password || !tenantSlug}
          style={styles.button}
        >
          Sign In
        </Button>
      </Surface>
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={4000}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {error ?? 'Login failed. Please try again.'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { padding: 24, borderRadius: 12 },
  title: { marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
});
