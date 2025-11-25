import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Drink } from '../types';

// Define the Context State
interface DrinksContextType {
    drinks: Drink[];
    addDrink: (name: string, volumeMl: number, abv: number, timestamp?: number) => void;
    removeDrink: (id: string) => void;
    updateDrinkTime: (id: string, newTimestamp: number) => void;
    clearSession: () => void;
    isLoading: boolean;
}

const DrinksContext = createContext<DrinksContextType | undefined>(undefined);

const STORAGE_KEY = '@standard_drinker_drinks';

export const DrinksProvider = ({ children }: { children: ReactNode }) => {
    const [drinks, setDrinks] = useState<Drink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load drinks from storage on mount
    useEffect(() => {
        const loadDrinks = async () => {
            try {
                const storedDrinks = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedDrinks) {
                    setDrinks(JSON.parse(storedDrinks));
                }
            } catch (error) {
                console.error('Failed to load drinks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDrinks();
    }, []);

    // Save drinks to storage whenever they change
    useEffect(() => {
        if (isLoading) return;

        const saveDrinks = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(drinks));
            } catch (error) {
                console.error('Failed to save drinks:', error);
            }
        };

        saveDrinks();
    }, [drinks, isLoading]);

    const addDrink = (name: string, volumeMl: number, abv: number, timestamp?: number) => {
        // AUS Standard Drink Formula: Vol(L) * ABV * 0.789
        const std = (volumeMl / 1000) * abv * 0.789;

        const newDrink: Drink = {
            id: Date.now().toString() + Math.random().toString(),
            name,
            volumeMl,
            abv,
            standardDrinks: std,
            timestamp: timestamp || Date.now(),
        };
        setDrinks((prevDrinks) => [newDrink, ...prevDrinks]);
    };

    const removeDrink = (id: string) => {
        setDrinks((prevDrinks) => prevDrinks.filter((d) => d.id !== id));
    };

    const updateDrinkTime = (id: string, newTimestamp: number) => {
        setDrinks((prevDrinks) =>
            prevDrinks.map((d) => (d.id === id ? { ...d, timestamp: newTimestamp } : d))
        );
    };

    const clearSession = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setDrinks([]);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    };

    return (
        <DrinksContext.Provider
            value={{
                drinks,
                addDrink,
                removeDrink,
                updateDrinkTime,
                clearSession,
                isLoading,
            }}
        >
            {children}
        </DrinksContext.Provider>
    );
};

export const useDrinks = () => {
    const context = useContext(DrinksContext);
    if (context === undefined) {
        throw new Error('useDrinks must be used within a DrinksProvider');
    }
    return context;
};
