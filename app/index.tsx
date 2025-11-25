import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DrinkGraph from '../components/DrinkGraph';
import ManualCalculator from '../components/ManualCalculator';
import SmartInput from '../components/SmartInput';
import { useDrinks } from '../context/DrinksContext';
import { CalculationMode, Gender } from '../types';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.MANUAL);
  const { drinks, addDrink, removeDrink: removeDrinkContext, updateDrinkTime: updateDrinkTimeContext, clearSession: clearSessionContext } = useDrinks();
  const [totalStdDrinks, setTotalStdDrinks] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [firstHourBurn, setFirstHourBurn] = useState(2);
  const [subsequentHourBurn, setSubsequentHourBurn] = useState(1);
  const [weight, setWeight] = useState(80);
  const [gender, setGender] = useState<Gender>('male');

  // Edit Mode State
  const [editingDrinkId, setEditingDrinkId] = useState<string | null>(null);
  const [editingTimeText, setEditingTimeText] = useState<string>('');
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update totals when drinks change
  useEffect(() => {
    const total = drinks.reduce((sum, drink) => sum + drink.standardDrinks, 0);
    setTotalStdDrinks(total);
  }, [drinks]);

  // Update current time every minute for session duration calculation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate session duration based on the oldest drink
  const sessionInfo = useMemo(() => {
    if (drinks.length === 0) return null;

    const startTime = Math.min(...drinks.map(d => d.timestamp));
    const diffMs = currentTime - startTime;
    const validDiff = Math.max(0, diffMs);

    const hours = Math.floor(validDiff / (1000 * 60 * 60));
    const mins = Math.floor((validDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, mins, startTime };
  }, [drinks, currentTime]);



  const removeDrink = (id: string) => {
    removeDrinkContext(id);
  };

  const updateDrinkTime = (id: string, newTimestamp: number) => {
    updateDrinkTimeContext(id, newTimestamp);
    setEditingDrinkId(null);
  };

  const clearSession = () => {
    Alert.alert('Clear Session', 'Are you sure you want to clear your session?', [
      { text: 'Cancel', onPress: () => { }, style: 'cancel' },
      {
        text: 'Clear',
        onPress: clearSessionContext,
        style: 'destructive'
      }
    ]);
  };

  const handleWeightChange = (text: string) => {
    const num = parseInt(text) || 0;
    setWeight(Math.max(1, num));
  };

  const handleFirstHourBurnChange = (text: string) => {
    const num = parseFloat(text) || 0;
    setFirstHourBurn(Math.max(0, Math.min(4, num)));
  };

  const handleSubsequentHourBurnChange = (text: string) => {
    const num = parseFloat(text) || 0;
    setSubsequentHourBurn(Math.max(0, Math.min(3, num)));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Standard Drinks</Text>
            <Text style={styles.subtitle}>CALCULATOR</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text
              style={[
                styles.totalValue,
                { color: totalStdDrinks > 4 ? '#fca5a5' : '#14b8a6' }
              ]}
            >
              {totalStdDrinks.toFixed(2)}
            </Text>
            <Text style={styles.totalLabel}>Total SD</Text>
            {sessionInfo && (
              <Text style={styles.sessionTime}>
                {sessionInfo.hours}h {sessionInfo.mins}m Elapsed
              </Text>
            )}
          </View>
        </View>

        {/* Tabs */}
        {!!process.env.API_KEY ?
          <View style={styles.tabsContainer}>
            <Pressable
              onPress={() => setMode(CalculationMode.MANUAL)}
              style={[
                styles.tab,
                mode === CalculationMode.MANUAL && styles.tabActive
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === CalculationMode.MANUAL && styles.tabTextActive
                ]}
              >
                Calculator
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode(CalculationMode.AI)}
              style={[
                styles.tab,
                mode === CalculationMode.AI && styles.tabActive
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === CalculationMode.AI && styles.tabTextActive
                ]}
              >
                AI Recognition
              </Text>
            </Pressable>
          </View> : null}

        {/* Content Area */}
        <View style={styles.content}>
          {mode === CalculationMode.MANUAL ? (
            <ManualCalculator onAddDrink={addDrink} />
          ) : (
            <SmartInput onAddDrink={addDrink} />
          )}

          {/* Session List & Graph */}
          {drinks.length > 0 && (
            <View style={styles.sessionContainer}>

              <View style={styles.settingsButtonContainer}>
                <Pressable
                  onPress={() => setShowSettings(!showSettings)}
                  style={styles.settingsButton}
                >
                  <Text style={[
                    styles.settingsButtonText,
                    showSettings && styles.settingsButtonTextActive
                  ]}>
                    {showSettings ? 'Hide Settings' : 'Show Settings'}
                  </Text>
                </Pressable>
              </View>

              {/* Settings Panel */}
              {showSettings && (
                <View style={styles.settingsPanel}>
                  <Text style={styles.settingsTitle}>Profile & Metabolism</Text>

                  <View style={styles.settingsGrid}>
                    <View style={styles.genderControl}>
                      <Text style={styles.settingsLabel}>Gender</Text>
                      <View style={styles.genderButtons}>
                        <Pressable
                          onPress={() => setGender('male')}
                          style={[
                            styles.genderButton,
                            gender === 'male' && styles.genderButtonActive
                          ]}
                        >
                          <Text style={[
                            styles.genderButtonText,
                            gender === 'male' && styles.genderButtonTextActive
                          ]}>
                            Male
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setGender('female')}
                          style={[
                            styles.genderButton,
                            gender === 'female' && styles.genderButtonActiveFemale
                          ]}
                        >
                          <Text style={[
                            styles.genderButtonText,
                            gender === 'female' && styles.genderButtonTextActiveFemale
                          ]}>
                            Female
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.weightControl}>
                      <Text style={styles.settingsLabel}>Weight (kg)</Text>
                      <Text style={styles.weightValue}>{weight}</Text>
                    </View>
                  </View>

                  <View style={styles.burnRatesContainer}>
                    <View style={styles.burnRateControl}>
                      <View style={styles.burnRateLabel}>
                        <Text style={styles.burnRateLabelText}>Burn Rate: 1st Hour</Text>
                        <Text style={styles.burnRateValue}>{firstHourBurn.toFixed(1)} SD</Text>
                      </View>
                      <View style={styles.burnRateButtons}>
                        <Pressable
                          onPress={() => setFirstHourBurn(Math.max(0, firstHourBurn - 0.5))}
                          style={styles.burnRateButton}
                        >
                          <Text style={styles.burnRateButtonText}>−</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setFirstHourBurn(Math.min(4, firstHourBurn + 0.5))}
                          style={styles.burnRateButton}
                        >
                          <Text style={styles.burnRateButtonText}>+</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.burnRateControl}>
                      <View style={styles.burnRateLabel}>
                        <Text style={styles.burnRateLabelText}>Burn Rate: After</Text>
                        <Text style={styles.burnRateValue}>{subsequentHourBurn.toFixed(1)} SD/hr</Text>
                      </View>
                      <View style={styles.burnRateButtons}>
                        <Pressable
                          onPress={() => setSubsequentHourBurn(Math.max(0, subsequentHourBurn - 0.1))}
                          style={styles.burnRateButton}
                        >
                          <Text style={styles.burnRateButtonText}>−</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setSubsequentHourBurn(Math.min(3, subsequentHourBurn + 0.1))}
                          style={styles.burnRateButton}
                        >
                          <Text style={styles.burnRateButtonText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              <DrinkGraph
                drinks={drinks}
                firstHourBurn={firstHourBurn}
                subsequentHourBurn={subsequentHourBurn}
                weight={weight}
                gender={gender}
              />

              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>Current Session</Text>
                <Pressable onPress={clearSession}>
                  <Text style={styles.clearButton}>Clear All</Text>
                </Pressable>
              </View>

              <View style={styles.drinksList}>
                {drinks.map(drink => (
                  <View key={drink.id} style={styles.drinkCard}>
                    <View style={styles.drinkContent}>
                      <View style={styles.drinkHeader}>
                        <Text style={styles.drinkName}>{drink.name}</Text>
                        <Text style={styles.drinkStdValue}>
                          {drink.standardDrinks.toFixed(1)} <Text style={styles.drinkStdUnit}>SD</Text>
                        </Text>
                      </View>

                      <View style={styles.drinkDetails}>
                        <Pressable
                          onPress={() => {
                            setEditingDrinkId(drink.id);
                            const d = new Date(drink.timestamp);
                            setEditingDate(d);
                            setEditingTimeText(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                            setShowDatePicker(true);
                          }}
                          style={styles.timeEditButton}
                        >
                          <Text style={styles.drinkDetail}>
                            {new Date(drink.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <Text style={styles.editIcon}>✎</Text>
                        </Pressable>
                        <Text style={styles.drinkDetail}>•</Text>
                        <Text style={styles.drinkDetail}>{drink.volumeMl}ml</Text>
                        <Text style={styles.drinkDetail}>•</Text>
                        <Text style={styles.drinkDetail}>{drink.abv}%</Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => removeDrink(drink.id)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </Pressable>

                  </View>
                ))}
              </View>

              {/* Edit Modal / Picker */}
              {editingDrinkId && (
                <>
                  {Platform.OS === 'android' && showDatePicker ? (
                    (() => {
                      try {
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        const DateTimePicker = require('@react-native-community/datetimepicker').default;
                        return (
                          <DateTimePicker
                            value={editingDate || new Date()}
                            mode="time"
                            display="default"
                            onChange={(event: any, selected?: Date) => {
                              setShowDatePicker(false);
                              if (event.type === 'set' && selected) {
                                updateDrinkTime(editingDrinkId, selected.getTime());
                              } else {
                                setEditingDrinkId(null);
                              }
                            }}
                          />
                        );
                      } catch (err) {
                        return null;
                      }
                    })()
                  ) : (
                    Platform.OS !== 'android' && (
                      <Modal
                        visible={true}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setEditingDrinkId(null)}
                      >
                        <Pressable
                          style={styles.modalOverlay}
                          onPress={() => setEditingDrinkId(null)}
                        >
                          <Pressable onPress={() => { }} style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Drink Time</Text>
                            {Platform.OS === 'web' ? (
                              <>
                                <TextInput
                                  style={styles.timeInput}
                                  value={editingTimeText}
                                  placeholder="HH:MM"
                                  placeholderTextColor="#64748b"
                                  onChangeText={setEditingTimeText}
                                />
                                <Pressable
                                  onPress={() => {
                                    const [hours, mins] = editingTimeText.split(':').map(n => Number(n.split(' ')[0]));
                                    if (!isNaN(hours) && !isNaN(mins)) {
                                      const newDate = new Date(editingDate || Date.now());
                                      newDate.setHours(hours, mins, 0);
                                      updateDrinkTime(editingDrinkId, newDate.getTime());
                                    }
                                    setEditingDrinkId(null);
                                  }}
                                  style={styles.modalButton}
                                >
                                  <Text style={styles.modalButtonText}>Done</Text>
                                </Pressable>
                              </>
                            ) : (
                              <>
                                {(() => {
                                  try {
                                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                                    const DateTimePicker = require('@react-native-community/datetimepicker').default;
                                    return (
                                      <DateTimePicker
                                        value={editingDate || new Date()}
                                        mode="time"
                                        display="spinner"
                                        onChange={(_e: any, selected?: Date) => {
                                          if (selected) setEditingDate(selected);
                                        }}
                                      />
                                    );
                                  } catch (err) {
                                    return null;
                                  }
                                })()}

                                <Pressable
                                  onPress={() => {
                                    if (editingDate) {
                                      const newDate = new Date(editingDate); // Use editingDate directly as it's updated by spinner
                                      // But we need the original date for year/month/day if we only picked time?
                                      // Actually editingDate is initialized with the drink's timestamp, so it has correct date.
                                      // However, the spinner updates the whole date object.
                                      updateDrinkTime(editingDrinkId, editingDate.getTime());
                                    }
                                    setEditingDrinkId(null);
                                  }}
                                  style={styles.modalButton}
                                >
                                  <Text style={styles.modalButtonText}>Done</Text>
                                </Pressable>
                              </>
                            )}
                          </Pressable>
                        </Pressable>
                      </Modal>
                    )
                  )}
                </>
              )}

            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a guide only. Alcohol affects everyone differently.
          </Text>
          <Text style={styles.footerText}>
            Config: {weight}kg {gender}, {firstHourBurn.toFixed(1)} SD 1st hr, then {subsequentHourBurn.toFixed(1)} SD/hr.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14b8a6',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 1.2,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 28,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sessionTime: {
    fontSize: 11,
    color: '#a6d6d6',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    fontFamily: 'monospace',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#1e293b',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sessionContainer: {
  },
  settingsButtonContainer: {
    marginBottom: 16,
  },
  settingsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  settingsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  settingsButtonTextActive: {
    color: '#14b8a6',
  },
  settingsPanel: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  genderControl: {
    flex: 1,
  },
  weightControl: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 4,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.6)',
  },
  genderButtonActiveFemale: {
    backgroundColor: 'rgba(236, 72, 153, 0.6)',
  },
  genderButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  genderButtonTextActiveFemale: {
    color: '#ffffff',
  },
  weightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14b8a6',
  },
  burnRatesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
    gap: 16,
  },
  burnRateControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  burnRateLabel: {
    flex: 1,
  },
  burnRateLabelText: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  burnRateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14b8a6',
    fontFamily: 'monospace',
  },
  burnRateButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  burnRateButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burnRateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14b8a6',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  clearButton: {
    fontSize: 11,
    color: '#f87171',
  },
  drinksList: {
    gap: 12,
  },
  drinkCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drinkContent: {
    flex: 1,
  },
  drinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  drinkName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  drinkStdValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a6d6d6',
  },
  drinkStdUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  drinkDetails: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  drinkDetail: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  removeButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  timeEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editIcon: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  timeInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#ffffff',
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  modalButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 2,
  },
});

export default App;
