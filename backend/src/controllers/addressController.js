const prisma = require('../db');
const { MongoClient, ObjectId } = require('mongodb');
const getMongoUri = () => process.env.DATABASE_URL;

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await prisma.savedAddress.findMany({
            where: { userId: req.userData.userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
        });
        res.json(addresses);
    } catch {
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
};

exports.addAddress = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { label, name, phone, street, city, state, pincode, country, isDefault } = req.body;
        if (!name || !phone || !street || !city || !state || !pincode) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }
        await client.connect();
        const db = client.db();
        const col = db.collection('SavedAddress');

        if (isDefault) {
            await col.updateMany({ userId: new ObjectId(req.userData.userId) }, { $set: { isDefault: false } });
        }

        // if first address, make it default
        const count = await col.countDocuments({ userId: new ObjectId(req.userData.userId) });
        const shouldBeDefault = isDefault || count === 0;

        const result = await col.insertOne({
            userId: new ObjectId(req.userData.userId),
            label: label || 'Home',
            name, phone, street, city, state, pincode,
            country: country || 'India',
            isDefault: shouldBeDefault,
            createdAt: new Date()
        });
        res.status(201).json({ id: result.insertedId, label, name, phone, street, city, state, pincode, country, isDefault: shouldBeDefault });
    } catch {
        res.status(500).json({ error: 'Failed to add address' });
    } finally {
        await client.close();
    }
};

exports.updateAddress = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { id } = req.params;
        const { label, name, phone, street, city, state, pincode, country, isDefault } = req.body;
        await client.connect();
        const db = client.db();
        const col = db.collection('SavedAddress');

        if (isDefault) {
            await col.updateMany({ userId: new ObjectId(req.userData.userId) }, { $set: { isDefault: false } });
        }
        await col.updateOne(
            { _id: new ObjectId(id), userId: new ObjectId(req.userData.userId) },
            { $set: { label, name, phone, street, city, state, pincode, country, isDefault: !!isDefault } }
        );
        res.json({ message: 'Address updated' });
    } catch {
        res.status(500).json({ error: 'Failed to update address' });
    } finally {
        await client.close();
    }
};

exports.deleteAddress = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { id } = req.params;
        await client.connect();
        const db = client.db();
        const col = db.collection('SavedAddress');
        await col.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(req.userData.userId) });
        res.json({ message: 'Address deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to delete address' });
    } finally {
        await client.close();
    }
};

exports.setDefault = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { id } = req.params;
        await client.connect();
        const db = client.db();
        const col = db.collection('SavedAddress');
        await col.updateMany({ userId: new ObjectId(req.userData.userId) }, { $set: { isDefault: false } });
        await col.updateOne({ _id: new ObjectId(id), userId: new ObjectId(req.userData.userId) }, { $set: { isDefault: true } });
        res.json({ message: 'Default address updated' });
    } catch {
        res.status(500).json({ error: 'Failed to set default address' });
    } finally {
        await client.close();
    }
};
