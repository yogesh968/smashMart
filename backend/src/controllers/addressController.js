const { MongoClient, ObjectId } = require('mongodb');

const getMongoUri = () => process.env.DATABASE_URL;

// Extract db name from the connection string e.g. .../smashmart?retryWrites...
const getDbName = () => {
    try {
        const url = getMongoUri();
        const path = url.split('.mongodb.net/')[1] || '';
        return path.split('?')[0] || 'smashmart';
    } catch {
        return 'smashmart';
    }
};

const getCol = async (client) => {
    await client.connect();
    return client.db(getDbName()).collection('SavedAddress');
};

exports.getAddresses = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const col = await getCol(client);
        const addresses = await col
            .find({ userId: new ObjectId(req.userData.userId) })
            .sort({ isDefault: -1, createdAt: -1 })
            .toArray();
        res.json(addresses.map(a => ({ ...a, id: a._id.toString() })));
    } catch (err) {
        console.error('getAddresses error:', err);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    } finally {
        await client.close();
    }
};

exports.addAddress = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { label, name, phone, street, city, state, pincode, country, isDefault } = req.body;
        if (!name || !phone || !street || !city || !state || !pincode) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }
        const col = await getCol(client);
        const userId = new ObjectId(req.userData.userId);

        const count = await col.countDocuments({ userId });
        const shouldBeDefault = !!isDefault || count === 0;

        if (shouldBeDefault) {
            await col.updateMany({ userId }, { $set: { isDefault: false } });
        }

        const result = await col.insertOne({
            userId,
            label: label || 'Home',
            name, phone, street, city,
            state, pincode,
            country: country || 'India',
            isDefault: shouldBeDefault,
            createdAt: new Date()
        });

        res.status(201).json({
            id: result.insertedId.toString(),
            _id: result.insertedId.toString(),
            label: label || 'Home', name, phone, street, city, state, pincode,
            country: country || 'India',
            isDefault: shouldBeDefault
        });
    } catch (err) {
        console.error('addAddress error:', err);
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
        const col = await getCol(client);
        const userId = new ObjectId(req.userData.userId);

        if (isDefault) {
            await col.updateMany({ userId }, { $set: { isDefault: false } });
        }
        await col.updateOne(
            { _id: new ObjectId(id), userId },
            { $set: { label, name, phone, street, city, state, pincode, country, isDefault: !!isDefault } }
        );
        res.json({ message: 'Address updated' });
    } catch (err) {
        console.error('updateAddress error:', err);
        res.status(500).json({ error: 'Failed to update address' });
    } finally {
        await client.close();
    }
};

exports.deleteAddress = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { id } = req.params;
        const col = await getCol(client);
        await col.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(req.userData.userId) });
        res.json({ message: 'Address deleted' });
    } catch (err) {
        console.error('deleteAddress error:', err);
        res.status(500).json({ error: 'Failed to delete address' });
    } finally {
        await client.close();
    }
};

exports.setDefault = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { id } = req.params;
        const col = await getCol(client);
        const userId = new ObjectId(req.userData.userId);
        await col.updateMany({ userId }, { $set: { isDefault: false } });
        await col.updateOne({ _id: new ObjectId(id), userId }, { $set: { isDefault: true } });
        res.json({ message: 'Default address updated' });
    } catch (err) {
        console.error('setDefault error:', err);
        res.status(500).json({ error: 'Failed to set default address' });
    } finally {
        await client.close();
    }
};
