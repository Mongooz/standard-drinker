import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COMMON_ABV, COMMON_SIZES } from '../types';

interface ManualCalculatorProps {
  onAddDrink: (name: string, volume: number, abv: number) => void;
}

const ManualCalculator: React.FC<ManualCalculatorProps> = ({ onAddDrink }) => {
  const [volume, setVolume] = useState<number>(425); // Default to Schooner
  const [abv, setAbv] = useState<number>(4.8); // Default to Full Strength
  const [stdDrinks, setStdDrinks] = useState<number>(0);

  useEffect(() => {
    // AUS Standard Drink Formula: Vol(L) * ABV * 0.789
    const calculated = (volume / 1000) * abv * 0.789;
    setStdDrinks(calculated);
  }, [volume, abv]);

  const generatedName = useMemo(() => {
    const sizeLabel = COMMON_SIZES.find(s => s.volume === volume)?.label;
    const abvLabel = COMMON_ABV.find(a => a.value === abv)?.label;

    // Smart naming logic
    if (sizeLabel && abvLabel) {
      const cleanSize = sizeLabel.replace(/\s*\(.*?\)\s*/g, '');
      return `${cleanSize} of ${abvLabel}`;
    }

    if (sizeLabel) return `${sizeLabel} (${abv}%)`;
    if (abvLabel) return `${volume}ml ${abvLabel}`;

    return `Custom Drink (${volume}ml @ ${abv}%)`;
  }, [volume, abv]);

  const handleAdd = () => {
    onAddDrink(generatedName, volume, abv);
  };

  const handleVolumeChange = (text: string) => {
    const num = parseInt(text);
    if (!isNaN(num)) {
      setVolume(num);
    } else if (text === '') {
      setVolume(0);
    }
  };

  const handleAbvChange = (text: string) => {
    const num = parseFloat(text);
    if (!isNaN(num)) {
      setAbv(num);
    } else if (text === '') {
      setAbv(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Result Preview */}
      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>Calculated Impact</Text>
        <View style={styles.resultValue}>
          <Text style={styles.resultNumber}>{stdDrinks.toFixed(2)}</Text>
          <Text style={styles.resultUnit}>SD</Text>
        </View>
        <Text style={styles.resultName}>{generatedName}</Text>
      </View>

      {/* Volume Controls */}
      <View style={styles.controlCard}>
        <View style={styles.controlHeader}>
          <Text style={styles.controlLabel}>Volume</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.controlInput}
              value={volume.toString()}
              onChangeText={handleVolumeChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#475569"
            />
            <Text style={styles.unitText}>ml</Text>
          </View>
        </View>

        <View style={styles.buttonGrid}>
          {COMMON_SIZES.map((size) => (
            <Pressable
              key={size.label}
              onPress={() => setVolume(size.volume)}
              style={[
                styles.sizeButton,
                volume === size.volume && styles.sizeButtonActive
              ]}
            >
              <Text
                style={[
                  styles.sizeButtonText,
                  volume === size.volume && styles.sizeButtonTextActive
                ]}
              >
                {size.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ABV Controls */}
      <View style={styles.controlCard}>
        <View style={styles.controlHeader}>
          <Text style={styles.controlLabel}>Alcohol Content</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.controlInput, styles.controlInputPurple]}
              value={abv.toString()}
              onChangeText={handleAbvChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#475569"
            />
            <Text style={[styles.unitText, styles.unitTextPurple]}>%</Text>
          </View>
        </View>

        <View style={styles.buttonGrid}>
          {COMMON_ABV.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => setAbv(item.value)}
              style={[
                styles.abvButton,
                abv === item.value && styles.abvButtonActive
              ]}
            >
              <Text
                style={[
                  styles.abvButtonText,
                  abv === item.value && styles.abvButtonTextActive
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed
        ]}
      >
        <Text style={styles.addButtonText}>+ Add Drink</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  resultValue: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  resultNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#14b8a6',
  },
  resultUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  resultName: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  controlCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  controlInput: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#14b8a6',
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.5)',
    paddingVertical: 4,
    minWidth: 60,
    textAlign: 'right',
  },
  controlInputPurple: {
    color: '#d946ef',
    borderBottomColor: 'rgba(217, 70, 239, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unitText: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#14b8a6',
    fontSize: 14,
  },
  unitTextPurple: {
    color: '#d946ef',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 0,
  },
  sizeButtonActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.5)',
  },
  sizeButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  sizeButtonTextActive: {
    color: '#5eead4',
  },
  abvButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 0,
  },
  abvButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  abvButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  abvButtonTextActive: {
    color: '#d8b4fe',
  },
  addButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ManualCalculator;
