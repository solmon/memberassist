import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Searchbar, Chip, Card, Text, Button, Snackbar, Switch } from 'react-native-paper';
import { careApi } from '../../src/api/careApi';
import { NetworkBadge } from '../../src/components/NetworkBadge';

const SPECIALTIES = ['Primary Care', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics'];

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  clinicName?: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  acceptingNew: boolean;
  networkTiers: string;
  distanceMiles?: number;
}

export default function CareFinderScreen() {
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selected, setSelected] = useState<Provider | null>(null);
  const [snackbar, setSnackbar] = useState('');

  async function search() {
    try {
      const results = await careApi.searchProviders({
        specialty: specialty || undefined,
        acceptingNewPatients: acceptingOnly || undefined,
      });
      setProviders(results);
    } catch {
      setSnackbar('Search failed');
    }
  }

  async function handlePcpSelect(providerId: string) {
    try {
      await careApi.submitPcpChange(providerId);
      setSnackbar('PCP change submitted!');
      setSelected(null);
    } catch {
      setSnackbar('Could not submit PCP change');
    }
  }

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search by location or name" value={location} onChangeText={setLocation} onSubmitEditing={search} style={styles.searchbar} />
      <View style={styles.filters}>
        {SPECIALTIES.map((s) => (
          <Chip key={s} selected={specialty === s} onPress={() => setSpecialty(specialty === s ? '' : s)} compact style={styles.chip}>{s}</Chip>
        ))}
        <View style={styles.toggle}>
          <Text>Accepting new patients</Text>
          <Switch value={acceptingOnly} onValueChange={setAcceptingOnly} />
        </View>
      </View>
      <FlatList
        data={providers}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => setSelected(item)}>
            <Card.Title
              title={`${item.firstName} ${item.lastName}`}
              subtitle={item.specialty}
              right={() => {
                let inNetwork = true;
                try { inNetwork = JSON.parse(item.networkTiers).length > 0; } catch {}
                return <NetworkBadge inNetwork={inNetwork} />;
              }}
            />
            <Card.Content>
              <Text variant="bodySmall">{item.city}, {item.state}</Text>
              {item.distanceMiles && <Text variant="labelSmall">{item.distanceMiles.toFixed(1)} mi</Text>}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Search for providers</Text>}
      />
      {selected && (
        <View style={styles.detail}>
          <Text variant="titleMedium">{selected.firstName} {selected.lastName}</Text>
          <Text variant="bodySmall">{selected.address}, {selected.city}, {selected.state}</Text>
          {selected.phone && <Text variant="bodySmall">Phone: {selected.phone}</Text>}
          <Text variant="labelSmall">{selected.acceptingNew ? 'Accepting new patients' : 'Not accepting new patients'}</Text>
          <Button mode="contained" onPress={() => handlePcpSelect(selected.id)}>Select as PCP</Button>
          <Button onPress={() => setSelected(null)}>Close</Button>
        </View>
      )}
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>{snackbar}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchbar: { margin: 8 },
  filters: { padding: 8 },
  chip: { margin: 2 },
  toggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  card: { margin: 8 },
  empty: { padding: 16, textAlign: 'center', opacity: 0.5 },
  detail: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#ccc', gap: 8 },
});
