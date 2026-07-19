import mongoose from 'mongoose';

// Connect to same DB the backend uses
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nikhilnainala:passworddbcmpb@cluster0.hnlsism.mongodb.net/?appName=Cluster0';

async function dropBadIndexes() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const col = db.collection('attendancerecords');

    // List all current indexes
    const indexes = await col.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(idx => console.log(JSON.stringify(idx)));

    // Drop the stale periodId index if it exists
    try {
        await col.dropIndex('periodId_1_userId_1');
        console.log('\n✅ Dropped stale index: periodId_1_userId_1');
    } catch (e) {
        if (e.codeName === 'IndexNotFound') {
            console.log('\nIndex periodId_1_userId_1 not found — already removed.');
        } else {
            console.error('\n❌ Error dropping index:', e.message);
        }
    }

    // Also delete any documents with null subjectId or periodId (corrupted)
    const del = await col.deleteMany({ $or: [{ subjectId: null }, { periodId: null }] });
    console.log(`\n🧹 Deleted ${del.deletedCount} corrupted document(s) with null subjectId/periodId`);

    // Show indexes after cleanup
    const afterIndexes = await col.indexes();
    console.log('\nIndexes after cleanup:');
    afterIndexes.forEach(idx => console.log(JSON.stringify(idx)));

    await mongoose.connection.close();
    console.log('\nDone.');
}

dropBadIndexes().catch(e => { console.error(e); process.exit(1); });
