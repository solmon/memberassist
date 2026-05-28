import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  List,
  Modal,
  Portal,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { computeAge, useDependants } from '../../src/hooks/useDependants';
import { Dependant } from '../../src/types/dependant';
import { AppTheme } from '../../src/theme/theme';

function formatDate(date: string | null): string {
  if (!date) {
    return 'N/A';
  }

  return new Date(date).toLocaleDateString();
}

export default function DependentsScreen() {
  const { dependants, isLoading, error, refetch } = useDependants();
  const [selectedDependant, setSelectedDependant] = useState<Dependant | null>(null);
  const theme = useTheme<AppTheme>();

  return (
    <View style={styles.container}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Dependants</List.Subheader>
          {isLoading && <ActivityIndicator style={styles.stateSpacing} />}

          {error && (
            <Surface style={[styles.stateContainer, { backgroundColor: theme.colors.errorContainer }]}> 
              <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>
                Unable to load dependants.
              </Text>
              <Button mode="contained-tonal" onPress={refetch} style={styles.retryButton}>
                Retry
              </Button>
            </Surface>
          )}

          {!isLoading && !error && dependants.length === 0 && (
            <Surface style={styles.stateContainer}>
              <Text variant="bodyMedium">No dependants on record</Text>
            </Surface>
          )}

          {!isLoading && !error && dependants.map((dep) => (
            <List.Item
              key={dep.id}
              title={`${dep.firstName} ${dep.lastName}`}
              description={`${dep.relationship} • Age ${computeAge(dep.dateOfBirth)}`}
              onPress={() => setSelectedDependant(dep)}
              right={() => <Chip>{dep.coverageStatus}</Chip>}
            />
          ))}
        </List.Section>
      </ScrollView>

      <Portal>
        <Modal
          visible={!!selectedDependant}
          onDismiss={() => setSelectedDependant(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {selectedDependant && (
            <>
              <Text variant="titleMedium" style={styles.modalTitle}>
                {selectedDependant.firstName} {selectedDependant.lastName}
              </Text>

              {selectedDependant.digitalCard ? (
                <Card>
                  <Card.Content>
                    <Text variant="bodyLarge">{selectedDependant.digitalCard.cardholderName}</Text>
                    <Text variant="bodyMedium">Member ID: {selectedDependant.digitalCard.memberIdNumber}</Text>
                    <Text variant="bodyMedium">Group #: {selectedDependant.digitalCard.groupNumber}</Text>
                    <Text variant="bodyMedium">Plan: {selectedDependant.digitalCard.planName}</Text>
                    <Text variant="bodyMedium">
                      Effective: {formatDate(selectedDependant.digitalCard.effectiveDate)}
                    </Text>
                    <Text variant="bodyMedium">
                      Termination: {formatDate(selectedDependant.digitalCard.terminationDate)}
                    </Text>
                  </Card.Content>
                </Card>
              ) : (
                <Text variant="bodyMedium">Card not yet issued — contact your plan administrator</Text>
              )}
              <Button onPress={() => setSelectedDependant(null)} style={styles.closeButton}>
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modal: { margin: 20, padding: 20, borderRadius: 12 },
  modalTitle: { marginBottom: 16 },
  stateSpacing: { marginVertical: 12 },
  stateContainer: { marginHorizontal: 16, marginVertical: 8, padding: 12, borderRadius: 12 },
  retryButton: { marginTop: 10, alignSelf: 'flex-start' },
  closeButton: { marginTop: 12, alignSelf: 'flex-end' },
});
