/**
 * eslint-snapshot-rule-tester writes and compares its snapshots only when it
 * finds Mocha or Jest; it does not know vitest. It takes the Jest path when the
 * global `jest` and the environment variable `JEST_WORKER_ID` exist, and then
 * uses `afterAll` and `expect.getState().testPath`, which vitest provides with
 * `globals: true`. Nothing else of Jest is used.
 *
 * The tester updates a snapshot only with `--update` or `-u` in
 * `process.argv`, which does not reach the workers of vitest: to update the
 * snapshots, delete the `.eslintsnap` file and run the tests again. Outside CI
 * the tester writes the snapshots that are missing; in CI (`CI=true`) a missing
 * snapshot fails the test.
 */
Object.assign(globalThis, { jest: {} })
// eslint-disable-next-line no-process-env -- the tester reads this variable to find Jest
process.env.JEST_WORKER_ID ??= "1"
