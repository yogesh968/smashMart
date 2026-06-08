const { MongoClient, ObjectId } = require('mongodb');

const getMongoUri = () => process.env.DATABASE_URL;
const getDbName = () => { try { const p = getMongoUri().split('.mongodb.net/')[1] || ''; return p.split('?')[0] || 'smashmart'; } catch { return 'smashmart'; } };

exports.getProducts = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        await client.connect();
        const { categoryId } = req.query;
        const filter = categoryId ? { categoryId } : {};
        const products = await client.db(getDbName()).collection('Product')
            .find(filter).toArray();
        res.json(products.map(p => ({ ...p, id: p._id.toString() })));
    } catch (error) {
        console.error('getProducts error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    } finally {
        await client.close();
    }
};

exports.getProductById = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        await client.connect();
        const product = await client.db(getDbName()).collection('Product')
            .findOne({ _id: new ObjectId(req.params.id) });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ ...product, id: product._id.toString() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    } finally {
        await client.close();
    }
};

exports.createProduct = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { name, description, price, categoryId, stock, image } = req.body;
        if (!name || !price || !categoryId) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }
        await client.connect();
        const result = await client.db(getDbName()).collection('Product').insertOne({
            name, description, price, categoryId, stock: stock || 0, image, createdAt: new Date()
        });
        res.status(201).json({ id: result.insertedId.toString(), name, description, price, categoryId, stock, image });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    } finally {
        await client.close();
    }
};
