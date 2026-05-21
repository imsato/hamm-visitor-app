const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importDestinations(data) {
  const col = db.collection('destinations');
  for (const item of data) {
    const ref = await col.add(item);
    console.log(`  destinations: ${item.name} → ${ref.id}`);
  }
}

async function importDepartments(data) {
  const col = db.collection('departments');
  for (const { id, ...fields } of data) {
    await col.doc(id).set(fields);
    console.log(`  departments: ${fields.depname} → ID: ${id}`);
  }
}

async function importStaff(data) {
  const col = db.collection('staff');
  for (const item of data) {
    const ref = await col.add(item);
    console.log(`  staff: ${item.staname} (${item.departmentId}) → ${ref.id}`);
  }
}

async function main() {
  const destinations = require('./data/destinations.json');
  const departments  = require('./data/departments.json');
  const staff        = require('./data/staff.json');

  console.log('=== destinations のインポート開始 ===');
  await importDestinations(destinations);

  console.log('=== departments のインポート開始 ===');
  await importDepartments(departments);

  console.log('=== staff のインポート開始 ===');
  await importStaff(staff);

  console.log('=== インポート完了 ===');
  process.exit(0);
}

main().catch(err => {
  console.error('インポートに失敗しました:', err);
  process.exit(1);
});
