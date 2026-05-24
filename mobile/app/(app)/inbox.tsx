import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, SegmentedButtons, Text } from 'react-native-paper';
import { communicationsApi } from '../../src/api/communicationsApi';
import { UnreadBadge } from '../../src/components/UnreadBadge';

interface Message {
  id: string;
  subject: string;
  body: string;
  channel: string;
  sentAt: string;
  readAt?: string;
}

const CHANNELS = [
  { value: 'BROKER_NOTICE', label: 'Broker Notices' },
  { value: 'DISTRICT_ALERT', label: 'District Updates' },
];

export default function InboxScreen() {
  const [channel, setChannel] = useState('BROKER_NOTICE');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);

  useEffect(() => {
    communicationsApi.getMessages(channel).then(setMessages).catch(() => {});
  }, [channel]);

  async function handlePress(msg: Message) {
    const updated = await communicationsApi.getMessage(msg.id);
    setSelected(updated);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, readAt: new Date().toISOString() } : m));
  }

  if (selected) {
    return (
      <ScrollView style={styles.container}>
        <Text variant="titleMedium" style={styles.heading}>{selected.subject}</Text>
        <Text variant="bodySmall" style={styles.meta}>{new Date(selected.sentAt).toLocaleString()}</Text>
        <Text variant="bodyMedium" style={styles.body}>{selected.body}</Text>
        <List.Item
          title="← Back to Inbox"
          onPress={() => setSelected(null)}
          left={(props) => <List.Icon {...props} icon="arrow-left" />}
        />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={channel}
        onValueChange={setChannel}
        buttons={CHANNELS}
        style={styles.tabs}
      />
      <ScrollView>
        {messages.length === 0 && <Text style={styles.empty}>No messages</Text>}
        {messages.map((msg) => (
          <List.Item
            key={msg.id}
            title={msg.subject}
            description={new Date(msg.sentAt).toLocaleDateString()}
            onPress={() => handlePress(msg)}
            right={() => !msg.readAt ? <UnreadBadge count={1} /> : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { margin: 8 },
  empty: { padding: 16, opacity: 0.5, textAlign: 'center' },
  heading: { padding: 16 },
  meta: { paddingHorizontal: 16, opacity: 0.6, marginBottom: 8 },
  body: { padding: 16 },
});
