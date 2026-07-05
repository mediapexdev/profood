import { useCallback, useEffect, useRef, useState } from 'react';

import { useDataContext } from '../contexts/DataProvider';
import { OrderProps } from '../../types';

const MARKER_KEY = 'manager:lastSeenOrderId';
const SOUND_KEY = 'manager:orderSoundEnabled';
const AWAITING_STATUS_CODE = 8;

/**
 * Short synthesized beep (WebAudio, no asset). Autoplay policy may suppress the
 * very first tone until a user gesture has unlocked audio — that is acceptable
 * for a non-critical alert.
 */
let audioContext: AudioContext | null = null;
const playBeep = () => {
    try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        audioContext = audioContext || new Ctx();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gain.gain.value = 0.08;
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.18);
    } catch {
        /* audio blocked — ignore */
    }
};

/**
 * Derives the "new awaiting orders" badge count from the orders already held in
 * the data context (which DataProvider refreshes on an interval). "New" = an
 * AWAITING order (status.code === 8) whose id is greater than the persisted
 * last-seen marker. On first ever load the marker is seeded to the newest order
 * id so the badge starts at 0 and only genuinely new orders alert.
 */
const useNewOrderAlert = () => {
    const { orders } = useDataContext();

    const [marker, setMarker] = useState<number>(() => {
        const stored = localStorage.getItem(MARKER_KEY);
        return stored !== null ? Number(stored) : 0;
    });
    // Until the marker is seeded, do not count anything (avoids a scary "all
    // historical awaiting orders" flash on the very first load).
    const [ready, setReady] = useState<boolean>(() => localStorage.getItem(MARKER_KEY) !== null);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem(SOUND_KEY) !== '0');

    // Seed the marker to the newest order id the first time orders arrive.
    useEffect(() => {
        if (ready || orders.length === 0) {
            return;
        }
        const newest = Math.max(...orders.map((o) => o.id));
        localStorage.setItem(MARKER_KEY, String(newest));
        setMarker(newest);
        setReady(true);
    }, [orders, ready]);

    const newOrders: OrderProps[] = ready
        ? orders.filter((o) => o.status?.code === AWAITING_STATUS_CODE && o.id > marker)
        : [];
    const unreadCount = newOrders.length;

    // Beep when the unread count rises.
    const prevCountRef = useRef(0);
    useEffect(() => {
        if (soundEnabled && unreadCount > prevCountRef.current) {
            playBeep();
        }
        prevCountRef.current = unreadCount;
    }, [unreadCount, soundEnabled]);

    const markSeen = useCallback(() => {
        const newest = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) : marker;
        localStorage.setItem(MARKER_KEY, String(newest));
        setMarker(newest);
        setReady(true);
    }, [orders, marker]);

    const toggleSound = useCallback(() => {
        setSoundEnabled((prev) => {
            const next = !prev;
            localStorage.setItem(SOUND_KEY, next ? '1' : '0');
            return next;
        });
    }, []);

    return { unreadCount, newOrders, soundEnabled, markSeen, toggleSound };
};

export default useNewOrderAlert;
