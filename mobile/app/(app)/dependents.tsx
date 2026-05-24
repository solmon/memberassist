import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, FAB, Portal, Modal, TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import { dependentsApi } from '../../src/api/dependentsApi';
import { plansApi } from '../../src/api/plansApi';
import { DigitalIdCard } from '../../src/components/DigitalIdCard';

const RELATIONSHIPS = ['SPOUSE', 'CHILD', 'DOMESTIC_PARTNER', 'OTHER'];

interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  digitalCards?: Array<{ memberIdNumber: string; groupNumber: string }>;
}

export default function DependentsScreen() {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selected, setSelected] = useState<Dependent | null>(null);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [relationship, setRelationship] = useState('SPOUSE');

  useEffect(() => {
    dependentsApi.getDependents().then(setDependents).catch(() => {});
    plansApi.getEnrollment().then((e: { id: string }) => setEnrollmentId(e.id)).catch(() => {});
  }, []);

  async function handleAdd() {
    await dependentsApi.createDependent({ firstName, lastName, dateOfBirth: dob, relationship, enrollmentId });
    const updated = await dependentsApi.getDependents();
    setDependents(updated);
    setShowAdd(false);
    setFirstName(''); setLastName(''); setDob('');
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Dependents</List.Subheader>
          {dependents.map((dep) => (
            <List.Item
              key={dep.id}
              title={`${dep.firstName} ${dep.lastName}`}
              description={dep.relationship}
              onPress={() => setSelected(dep)}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          ))}
        </List.Section>
      </ScrollView>

      <Portal>
        <Modal visible={!!selected} onDismiss={() => setSelected(null)} contentContainerStyle={styles.modal}>
          {selected && (
            <>
              <Text variant="titleMedium" style={styles.modalTitle}>{selected.firstName} {selected.lastName}</Text>
              {selected.digitalCards?.[0] && (
                <DigitalIdCard
                  memberName={`${selected.firstName} ${selected.lastName}`}
                  memberId={selected.digitalCards[0].memberIdNumber}
                  groupNumber={selected.digitalCards[0].groupNumber}
                  planTier=""
                  effectiveDate={selected.dateOfBirth}
                />
              )}
              <Button onPress={() => setSelected(null)}>Close</Button>
            </>
          )}
        </Modal>

        <Modal visible={showAdd} onDismiss={() => setShowAdd(false)} contentContainerStyle={styles.modal}>
          <Text variant="titleMedium" style={styles.modalTitle}>Add Dependent</Text>
          <TextInput label="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} />
          <TextInput label="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} />
          <TextInput label="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} style={styles.input} />
          <SegmentedButtons
            value={relationship}
            onValueChange={setRelationship}
            buttons={RELATIONSHIPS.map((r) => ({ value: r, label: r }))}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleAdd} disabled={!firstName || !lastName || !dob}>Add</Button>
        </Modal>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => setShowAdd(true)} label="Add Dependent" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  modal: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 12 },
  modalTitle: { marginBottom: 16 },
  input: { marginBottom: 12 },
});
