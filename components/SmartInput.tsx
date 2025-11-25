import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { parseDrinkInput } from '../services/geminiService';

interface SmartInputProps {
  onAddDrink: (name: string, volume: number, abv: number) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({ onAddDrink }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const drinks = await parseDrinkInput(input);
      if (drinks.length === 0) {
        setError("Could not identify any drinks. Try being more specific.");
      } else {
        drinks.forEach((d: any) => {
          onAddDrink(d.name, d.volumeMl, d.abv);
        });
        setInput('');
      }
    } catch (err) {
      setError("Failed to process request. Please check your connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Ask AI</Text>
        <Text style={styles.subtitle}>
          Describe what you drank, and we'll estimate the standard drinks for you.
        </Text>
        
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="e.g., A pint of Guinness and a shot of tequila..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />
        
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading || !input.trim()}
            style={({ pressed }) => [
              styles.button,
              (isLoading || !input.trim()) && styles.buttonDisabled,
              pressed && !isLoading && styles.buttonPressed
            ]}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.buttonText}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>⚡ Calculate</Text>
            )}
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.disclaimer}>
        AI estimates may vary. Always check official labels.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a6d6d6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    fontSize: 12,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    flex: 1,
  },
  disclaimer: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default SmartInput;
