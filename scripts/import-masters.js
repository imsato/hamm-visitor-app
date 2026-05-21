const admin = require('firebase-admin');

let serviceAccount;
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT が設定されていません');
  serviceAccount = JSON.parse(raw);
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

// destinations: firestoreId あり→更新、なし→新規追加
async function importDestinations(data) {
  const col = db.collection('destinations');
  for (const { firestoreId, ...fields } of data) {
    if (firestoreId) {
      await col.doc(firestoreId).set(fields);
      console.log(`  destinations [更新]: ${fields.name} (${firestoreId})`);
    } else {
      const ref = await col.add(fields);
      console.log(`  destinations [新規]: ${fields.name} → ${ref.id}`);
    }
  }
}

// departments: 固定ID（id列）で常にupsert
async function importDepartments(data) {
  const col = db.collection('departments');
  for (const { id, ...fields } of data) {
    await col.doc(id).set(fields);
    console.log(`  departments [upsert]: ${fields.depname} (${id})`);
  }
}

// staff: firestoreId あり→更新、なし→新規追加
async function importStaff(data) {
  const col = db.collection('staff');
  for (const { firestoreId, ...fields } of data) {
    // staffIDを常に7桁ゼロ埋め文字列に正規化
    fields.staffID = String(fields.staffID || '0').padStart(7, '0');
    if (firestoreId) {
      await col.doc(firestoreId).set(fields);
      console.log(`  staff [更新]: ${fields.staname} staffID:${fields.staffID} (${firestoreId})`);
    } else {
      const ref = await col.add(fields);
      console.log(`  staff [新規]: ${fields.staname} staffID:${fields.staffID} → ${ref.id}`);
    }
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
