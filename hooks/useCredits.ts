import { useState, useCallback } from 'react';
// import { db } from '../lib/firebase'; // Removed dependency
import { useAuth } from '../contexts/AuthContext';

// Credit costs for each action (Kept for compatibility, but effectively 0)
export const CREDIT_COSTS = {
    GENERATE_SCRIPT: 0,
    GENERATE_IMAGE: 0,
    GENERATE_VOICE: 0,
    GENERATE_VIDEO: 0,
    REFINE_PROMPT: 0
};

interface UseCreditsReturn {
    credits: number;
    loading: boolean;
    hasEnoughCredits: (cost: number) => boolean;
    deductCredits: (cost: number, action: string) => Promise<boolean>;
    refreshCredits: () => Promise<void>;
}

export const useCredits = (): UseCreditsReturn => {
    const { user } = useAuth();
    // Always return Infinity to simulate unlimited credits
    const [credits] = useState(Infinity);
    const [loading] = useState(false);

    // Always returns true
    const hasEnoughCredits = useCallback((_cost: number): boolean => {
        return true;
    }, []);

    // Mock deduction (always success, does nothing)
    const deductCredits = useCallback(async (_cost: number, _action: string): Promise<boolean> => {
        return true;
    }, []);

    // Mock refresh
    const refreshCredits = useCallback(async () => {
        // Do nothing
    }, []);

    return {
        credits: user ? Infinity : 0, // Show Infinity if logged in
        loading,
        hasEnoughCredits,
        deductCredits,
        refreshCredits
    };
};
