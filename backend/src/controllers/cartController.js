const { MongoClient, ObjectId } = require('mongodb');

const getMongoUri = () => process.env.DATABASE_URL;
const getDbName = () => { try { const p = getMongoUri().split('.mongodb.net/')[1] || ''; return p.split('?')[0] || 'smashmart'; } catch { return 'smashmart'; } };

exports.getCart = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        await client.connect();
        const cart = await client.db(getDbName()).collection('Cart')
            .findOne({ userId: new ObjectId(req.userData.userId) });
        res.json(cart || { items: [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    } finally {
        await client.close();
    }
};

exports.addToCart = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { productId, quantity } = req.body;
        const userId = req.userData.userId;

        if (!productId || !quantity) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }

        await client.connect();
        const cartsCollection = client.db(getDbName()).collection('Cart');

        let cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });

        if (!cart) {
            const result = await cartsCollection.insertOne({
                userId: new ObjectId(userId),
                items: [{ productId, quantity: parseInt(quantity) }]
            });
            cart = { id: result.insertedId, userId, items: [{ productId, quantity: parseInt(quantity) }] };
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId === productId);
            const items = [...cart.items];
            if (itemIndex > -1) {
                items[itemIndex].quantity += parseInt(quantity);
            } else {
                items.push({ productId, quantity: parseInt(quantity) });
            }
            await cartsCollection.updateOne(
                { userId: new ObjectId(userId) },
                { $set: { items } }
            );
            cart.items = items;
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item to cart' });
    } finally {
        await client.close();
    }
};

exports.removeFromCart = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { productId } = req.body;
        const userId = req.userData.userId;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        await client.connect();
        const cartsCollection = client.db(getDbName()).collection('Cart');

        let cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const items = cart.items.filter(item => item.productId !== productId);
        await cartsCollection.updateOne(
            { userId: new ObjectId(userId) },
            { $set: { items } }
        );
        res.json({ ...cart, items });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item from cart' });
    } finally {
        await client.close();
    }
};
