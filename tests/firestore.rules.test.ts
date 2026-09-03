import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { after, before, beforeEach, describe, it } from 'mocha';

const PROJECT_ID = 'wakeframe-rules-tests';
const OWNER_ID = 'owner';
const OTHER_USER_ID = 'other';
const ROUTINE_ID = 'routine-owner';
const DAY_PLAN_ID = 'day-plan-owner';
const ACTIVITY_ID = 'activity-owner';
const INSTANCE_ID = 'instance-owner';
const BREAK_LOG_ID = 'break-owner';
const NESTED_ACTIVITY_PATH = `users/${OWNER_ID}/activities/activity-nested`;

let testEnv: RulesTestEnvironment;

const routine = (userId: string) => ({
  id: ROUTINE_ID,
  user_id: userId,
  name: 'Morning routine',
  mode: '24h',
});

const dayPlan = () => ({
  id: DAY_PLAN_ID,
  routine_id: ROUTINE_ID,
  weekday: 'Mon',
});

const activity = () => ({
  id: ACTIVITY_ID,
  day_plan_id: DAY_PLAN_ID,
  title: 'Exercise',
  start_time: '2026-09-01T07:00:00.000Z',
  duration: 30,
  is_extended: false,
  sort_order: 0,
});

const activityInstance = () => ({
  id: INSTANCE_ID,
  activity_id: ACTIVITY_ID,
  date: '2026-09-01',
  state: 'planned',
});

const breakLog = () => ({
  id: BREAK_LOG_ID,
  activity_instance_id: INSTANCE_ID,
  start_at: '2026-09-01T07:10:00.000Z',
  planned_duration: 5,
  exceeded_cap: false,
});

const paths = {
  routines: `routines/${ROUTINE_ID}`,
  dayPlans: `dayPlans/${DAY_PLAN_ID}`,
  activities: `activities/${ACTIVITY_ID}`,
  activityInstances: `activityInstances/${INSTANCE_ID}`,
  breakLogs: `breakLogs/${BREAK_LOG_ID}`,
};

async function seedOwnerGraph() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore();
    await setDoc(doc(admin, paths.routines), routine(OWNER_ID));
    await setDoc(doc(admin, paths.dayPlans), dayPlan());
    await setDoc(doc(admin, paths.activities), activity());
    await setDoc(doc(admin, paths.activityInstances), activityInstance());
    await setDoc(doc(admin, paths.breakLogs), breakLog());
    await setDoc(doc(admin, NESTED_ACTIVITY_PATH), { title: 'Nested activity' });
  });
}

async function assertCanReadAndWrite(path: string, data: Record<string, unknown>) {
  const owner = testEnv.authenticatedContext(OWNER_ID).firestore();
  await assertSucceeds(getDoc(doc(owner, path)));
  await assertSucceeds(setDoc(doc(owner, path), data, { merge: true }));
}

describe('Firestore security rules', function () {
  this.timeout(10000);

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: await readFile('firestore.rules', 'utf8'),
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await seedOwnerGraph();
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  it('allows a user to read and write their own Routine', async () => {
    await assertCanReadAndWrite(paths.routines, routine(OWNER_ID));
  });

  it('allows a user to read and write their own DayPlan', async () => {
    await assertCanReadAndWrite(paths.dayPlans, dayPlan());
  });

  it('allows a user to read and write their own Activity', async () => {
    await assertCanReadAndWrite(paths.activities, activity());
  });

  it('allows a user to read and write their own ActivityInstance', async () => {
    await assertCanReadAndWrite(paths.activityInstances, activityInstance());
  });

  it('allows a user to read and write their own BreakLog', async () => {
    await assertCanReadAndWrite(paths.breakLogs, breakLog());
  });

  it('allows a user to read and write activities in their user subcollection', async () => {
    await assertCanReadAndWrite(NESTED_ACTIVITY_PATH, { title: 'Updated activity' });
  });

  it("rejects another user from reading or writing the owner's activity subcollection", async () => {
    const other = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
    await assertFails(getDoc(doc(other, NESTED_ACTIVITY_PATH)));
    await assertFails(setDoc(doc(other, NESTED_ACTIVITY_PATH), { unauthorized: true }, { merge: true }));
  });

  for (const [collection, path] of Object.entries(paths)) {
    it(`rejects another user from reading or writing the owner's ${collection}`, async () => {
      const other = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
      await assertFails(getDoc(doc(other, path)));
      await assertFails(setDoc(doc(other, path), { unauthorized: true }, { merge: true }));
    });
  }

  it('rejects unauthenticated reads and writes entirely', async () => {
    const unauthenticated = testEnv.unauthenticatedContext().firestore();

    for (const path of Object.values(paths)) {
      await assertFails(getDoc(doc(unauthenticated, path)));
      await assertFails(setDoc(doc(unauthenticated, path), { unauthorized: true }, { merge: true }));
    }
  });
});
