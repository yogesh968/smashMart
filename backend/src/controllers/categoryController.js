const { MongoClient } = require('mongodb');

const getMongoUri = () => process.env.DATABASE_URL;
const getDbName = () => { try { const p = getMongoUri().split('.mongodb.net/')[1] || ''; return p.split('?')[0] || 'smashmart'; } catch { return 'smashmart'; } };

exports.getCategories = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        await client.connect();
        const categories = await client.db(getDbName()).collection('Category').find({}).toArray();
        res.json(categories.map(c => ({ ...c, id: c._id.toString() })));
    } catch (error) {
        console.error('getCategories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    } finally {
        await client.close();
    }
};

exports.createCategory = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { name, image } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name is required' });
        await client.connect();
        const result = await client.db(getDbName()).collection('Category').insertOne({ name, image });
        res.status(201).json({ id: result.insertedId.toString(), name, image });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    } finally {
        await client.close();
    }
};
