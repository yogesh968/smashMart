const { MongoClient, ObjectId } = require('mongodb');

const getMongoUri = () => process.env.DATABASE_URL;
const getDbName = () => { try { const p = getMongoUri().split('.mongodb.net/')[1] || ''; return p.split('?')[0] || 'smashmart'; } catch { return 'smashmart'; } };

exports.getOrders = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        await client.connect();
        const orders = await client.db(getDbName()).collection('Order')
            .find({ userId: new ObjectId(req.userData.userId) })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(orders.map(o => ({ ...o, id: o._id.toString() })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    } finally {
        await client.close();
    }
};

exports.createOrder = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { items, total, shippingAddress, paymentMethod } = req.body;
        const userId = req.userData.userId;

        if (!items || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({ error: 'Order items are required' });
        if (!total || total <= 0)
            return res.status(400).json({ error: 'Valid order total is required' });
        if (!shippingAddress || !shippingAddress.street)
            return res.status(400).json({ error: 'Shipping address is required' });

        await client.connect();
        const db = client.db(getDbName());
        const ordersCollection = db.collection('Order');
        const cartsCollection = db.collection('Cart');

        const newOrder = {
            userId: new ObjectId(userId),
            items,
            total,
            status: 'pending',
            shippingAddress,
            paymentMethod: paymentMethod || 'cod',
            createdAt: new Date()
        };

        const result = await ordersCollection.insertOne(newOrder);
        try { await cartsCollection.deleteOne({ userId: new ObjectId(userId) }); } catch {}

        res.status(201).json({ id: result.insertedId, ...newOrder, userId });
    } catch {
        res.status(500).json({ error: 'Failed to create order' });
    } finally {
        await client.close();
    }
};

exports.deleteOrder = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { id } = req.params;
        const userId = req.userData.userId;

        if (!id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        await client.connect();
        const ordersCollection = client.db(getDbName()).collection('Order');

        const order = await ordersCollection.findOne({
            _id: new ObjectId(id),
            userId: new ObjectId(userId)
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Only pending orders can be cancelled' });
        }

        await ordersCollection.deleteOne({ _id: new ObjectId(id) });

        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel order' });
    } finally {
        await client.close();
    }
};
