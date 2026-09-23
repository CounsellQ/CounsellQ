/**
 * CounsellQ — Manual Jest mock for src/db.js
 *
 * Location: src/__mocks__/db.js
 * Jest automatically uses this file when a test calls:
 *   jest.mock('./db')   (from within src/)
 *   jest.mock('../src/db')  (from within tests/)
 *
 * The mock exposes control helpers that individual tests use to
 * configure what the "database" returns, without any real network I/O.
 *
 * Usage in a test file:
 *
 *   jest.mock('../src/db');
 *   const db = require('../src/db');
 *
 *   beforeEach(() => { db.reset(); db.query.mockClear(); });
 *
 *   db.setResponse({ rows: [{ category: 'OPEN' }] });
 *   db.setError(new Error('ECONNREFUSED'));
 */

"use strict";

let _response = { rows: [] };
let _error = null;

// The jest.fn() is defined once and its implementation reads the
// current _response / _error at call time — so setResponse/setError
// work correctly even though the fn object is created up front.
const query = jest.fn(async () => {
    if (_error) throw _error;
    return _response;
});

const mockPool = {
    query,

    connect: jest.fn(async () => ({
        query: jest.fn(async () => {
            if (_error) throw _error;
            return _response;
        }),
        release: jest.fn()
    })),

    end: jest.fn(async () => {}),

    // ── Test control helpers ──────────────────────────────────────────────────

    /** Set the response the next query will return. Clears any pending error. */
    setResponse(response) {
        _response = response;
        _error = null;
    },

    /** Make the next query throw an error. Clears any pending response. */
    setError(error) {
        _error = error;
        _response = { rows: [] };
    },

    /** Reset to the default (empty rows, no error). */
    reset() {
        _response = { rows: [] };
        _error = null;
    }
};

module.exports = mockPool;
