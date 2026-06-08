const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const getMongoUri = () => process.env.DATABASE_URL;
const getDbName = () => { try { const p = getMongoUri().split('.mongodb.net/')[1] || ''; return p.split('?')[0] || 'smashmart'; } catch { return 'smashmart'; } };

const getUsers = async (client) => client.db(getDbName()).collection('User');

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });

exports.signup = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name)
            return res.status(400).json({ error: 'All fields are required' });

        await client.connect();
        const users = await getUsers(client);

        const existing = await users.findOne({ email });
        if (existing) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await users.insertOne({
            email, password: hashedPassword, name, role: 'user', createdAt: new Date()
        });

        const token = signToken(result.insertedId.toString());
        res.status(201).json({ token, user: { id: result.insertedId.toString(), email, name } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    } finally {
        await client.close();
    }
};

exports.login = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required' });

        await client.connect();
        const users = await getUsers(client);
        const user = await users.findOne({ email });

        if (!user) return res.status(401).json({ error: 'Invalid email or password' });
        if (!user.password) return res.status(401).json({ error: 'Please login using Google' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const token = signToken(user._id.toString());
        res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    } finally {
        await client.close();
    }
};

exports.googleLogin = async (req, res) => {
    const client = new MongoClient(getMongoUri());
    try {
        const { credential } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub: googleId } = ticket.getPayload();

        await client.connect();
        const users = await getUsers(client);
        let user = await users.findOne({ email });

        if (!user) {
            const result = await users.insertOne({ email, name, googleId, role: 'user', createdAt: new Date() });
            user = { _id: result.insertedId, email, name };
        } else if (!user.googleId) {
            await users.updateOne({ email }, { $set: { googleId } });
        }

        const token = signToken(user._id.toString());
        res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    } finally {
        await client.close();
    }
};
