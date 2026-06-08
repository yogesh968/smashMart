const { MongoClient, ObjectId } = require('mongodb');

const getMongoUri = () => process.env.DATABASE_URL;
const getDbName = () => { try { const p = getMongoUri().split('.mongodb.net/')[1] || ''; return p.split('?')[0] || 'smashmart'; } catch { return 'smashmart'; } };

exports.getProfile = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        await client.connect();
        const user = await client.db(getDbName()).collection('User')
            .findOne({ _id: new ObjectId(req.userData.userId) }, {
                projection: { password: 0, googleId: 0 }
            });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ ...user, id: user._id.toString() });
    } catch {
        res.status(500).json({ error: 'Failed to fetch profile' });
    } finally {
        await client.close();
    }
};

exports.updateProfile = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { name, phone, dateOfBirth, gender, playLevel } = req.body;
        await client.connect();
        const col = client.db(getDbName()).collection('User');
        await col.updateOne(
            { _id: new ObjectId(req.userData.userId) },
            { $set: { name, phone, dateOfBirth, gender, playLevel } }
        );
        const updated = await col.findOne(
            { _id: new ObjectId(req.userData.userId) },
            { projection: { password: 0, googleId: 0 } }
        );
        res.json({ ...updated, id: updated._id.toString() });
    } catch {
        res.status(500).json({ error: 'Failed to update profile' });
    } finally {
        await client.close();
    }
};
