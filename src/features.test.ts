import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FEATURE_IDS, parseFeatures } from './features.js';

describe('parseFeatures', () => {
    it('returns all features when unset', () => {
        assert.deepEqual(parseFeatures(undefined), new Set(FEATURE_IDS));
    });

    it('returns all features for "all"', () => {
        assert.deepEqual(parseFeatures('all'), new Set(FEATURE_IDS));
    });

    it('returns all features for an empty string', () => {
        assert.deepEqual(parseFeatures(''), new Set(FEATURE_IDS));
        assert.deepEqual(parseFeatures('  '), new Set(FEATURE_IDS));
    });

    it('parses a comma-separated subset regardless of order or spacing', () => {
        assert.deepEqual(parseFeatures('auth,app'), new Set(['auth', 'app']));
        assert.deepEqual(parseFeatures(' app , auth '), new Set(['auth', 'app']));
    });

    it('ignores unknown ids with a stderr warning', () => {
        const warnings: string[] = [];
        const original = console.warn;
        console.warn = (msg: unknown) => warnings.push(String(msg));
        try {
            assert.deepEqual(parseFeatures('landing,bogus'), new Set(['landing']));
        } finally {
            console.warn = original;
        }
        assert.equal(warnings.length, 1);
        assert.match(warnings[0], /bogus/);
    });

    it('drops empty entries silently', () => {
        const warnings: string[] = [];
        const original = console.warn;
        console.warn = (msg: unknown) => warnings.push(String(msg));
        try {
            assert.deepEqual(parseFeatures('landing,,auth,'), new Set(['landing', 'auth']));
        } finally {
            console.warn = original;
        }
        assert.equal(warnings.length, 0);
    });

    it('treats "all" in a list as all features', () => {
        assert.deepEqual(parseFeatures('landing,all'), new Set(FEATURE_IDS));
    });
});
