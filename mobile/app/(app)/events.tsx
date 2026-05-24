import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, Text, Button, Snackbar, Switch } from 'react-native-paper';
import { eventsApi } from '../../src/api/eventsApi';

interface HealthEvent {
  id: string;
  title: string;
  description: string;
  startAt: string;
  location?: string;
  category: string;
  capacity?: number;
  rsvpCount: number;
  myRsvpStatus?: string;
  meetingUrl?: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [myOnly, setMyOnly] = useState(false);
  const [selected, setSelected] = useState<HealthEvent | null>(null);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    eventsApi.getEvents(myOnly).then(setEvents).catch(() => {});
  }, [myOnly]);

  async function handleRsvp(event: HealthEvent) {
    try {
      if (event.myRsvpStatus) {
        await eventsApi.cancelRsvp(event.id);
        setSnackbar('RSVP cancelled');
      } else {
        const rsvp = await eventsApi.createRsvp(event.id);
        setSnackbar(`RSVP: ${rsvp.status}`);
      }
      const updated = await eventsApi.getEvents(myOnly);
      setEvents(updated);
      setSelected(null);
    } catch {
      setSnackbar('Could not update RSVP');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text>My Events only</Text>
        <Switch value={myOnly} onValueChange={setMyOnly} />
      </View>
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => setSelected(item)}>
            <Card.Title
              title={item.title}
              subtitle={new Date(item.startAt).toLocaleDateString()}
              right={() => item.myRsvpStatus ? <Chip compact>{item.myRsvpStatus}</Chip> : undefined}
            />
            <Card.Content>
              <Text variant="bodySmall">{item.location}</Text>
            </Card.Content>
          </Card>
        )}
      />
      {selected && (
        <View style={styles.detail}>
          <Text variant="titleMedium">{selected.title}</Text>
          <Text variant="bodyMedium">{selected.description}</Text>
          {selected.meetingUrl && <Text variant="labelSmall">Meeting: {selected.meetingUrl}</Text>}
          <Button mode="contained" onPress={() => handleRsvp(selected)}>
            {selected.myRsvpStatus ? 'Cancel RSVP' : 'RSVP'}
          </Button>
          <Button onPress={() => setSelected(null)}>Close</Button>
        </View>
      )}
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>{snackbar}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center' },
  card: { margin: 8 },
  detail: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#ccc', gap: 8 },
});
