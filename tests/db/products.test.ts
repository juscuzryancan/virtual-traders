require('dotenv').config();
const { client } = require('../../db/index.js');
const { buildTables, populateInitialData } = require('../../db/init_db.js');

describe('Testing Product Database Adapters', () => {
    beforeAll(async () => {
        client.connect();
        await buildTables();
    });
    afterAll(() => {
        client.end();
    });
    describe('hey i wanna test something', () => {
        it('im a test', () => {
            expect(true).toBe(true);
        });
    });
});
