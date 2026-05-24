import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, Text, Button, Snackbar, Portal, Modal } from 'react-native-paper';
import { marketplaceApi } from '../../src/api/marketplaceApi';

const CATEGORIES = ['DENTAL', 'VISION', 'WELLNESS', 'SUPPLEMENTAL', 'OTHER'];

interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  eligibleTiers: string;
  priceAmount?: number;
  priceCycle?: string;
}

export default function MarketplaceScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Offer | null>(null);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    marketplaceApi.getOffers(category || undefined).then(setOffers).catch(() => {});
  }, [category]);

  async function handleInterest() {
    if (!selected) return;
    try {
      await marketplaceApi.expressInterest(selected.id);
      setSnackbar('Interest submitted!');
    } catch {
      setSnackbar('Could not submit interest');
    }
    setSelected(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            selected={category === c}
            onPress={() => setCategory(category === c ? '' : c)}
            style={styles.chip}
          >
            {c}
          </Chip>
        ))}
      </View>
      <FlatList
        data={offers}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => setSelected(item)}>
            <Card.Title title={item.title} subtitle={item.category} />
            <Card.Content>
              <Text variant="bodySmall">{item.description.slice(0, 80)}...</Text>
              {item.priceAmount && (
                <Text variant="labelMedium">${item.priceAmount}/{item.priceCycle}</Text>
              )}
            </Card.Content>
          </Card>
        )}
      />
      <Portal>
        <Modal visible={!!selected} onDismiss={() => setSelected(null)} contentContainerStyle={styles.modal}>
          {selected && (
            <>
              <Text variant="titleMedium" style={styles.modalTitle}>{selected.title}</Text>
              <Text variant="bodyMedium" style={styles.body}>{selected.description}</Text>
              <Button mode="contained" onPress={handleInterest}>Express Interest</Button>
              <Button onPress={() => setSelected(null)}>Close</Button>
            </>
          )}
        </Modal>
      </Portal>
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>{snackbar}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  chip: { margin: 4 },
  card: { margin: 8 },
  modal: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 12 },
  modalTitle: { marginBottom: 12 },
  body: { marginBottom: 16 },
});
