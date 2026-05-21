const admin = require('firebase-admin');

// サービスアカウントのパース（private_keyの改行を正規化）
let serviceAccount;
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT が設定されていません');
  serviceAccount = JSON.parse(raw);
  // GitHub Secrets経由で\nがエスケープされた場合の対処
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  console.log(`プロジェクトID: ${serviceAccount.project_id}`);
} catch (err) {
  console.error('サービスアカウントのパースに失敗:', err.message);
  process.exit(1);
}

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
