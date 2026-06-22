package com.anagrafica.radiologica.service;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Simple in-memory, per-prefix incremental ID generator.
 * Format: <PREFIX><10-digit number>, e.g. OR0000000001
 *
 * Note: in a real multi-instance deployment, this should be backed by DB sequences.
 */
@Component
public class PrefixedIdGenerator {

    private final ConcurrentHashMap<String, AtomicLong> counters = new ConcurrentHashMap<>();

    public String nextId(String prefix) {
        AtomicLong counter = counters.computeIfAbsent(prefix, p -> new AtomicLong(0));
        long next = counter.incrementAndGet();
        return prefix + String.format("%010d", next);
    }

    public void seedAtLeast(String prefix, long lastUsed) {
        counters.compute(prefix, (p, c) -> {
            if (c == null) return new AtomicLong(lastUsed);
            c.updateAndGet(v -> Math.max(v, lastUsed));
            return c;
        });
    }
}
