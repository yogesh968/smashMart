const prisma = require('../db');

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userData.userId },
            select: {
                id: true, email: true, name: true, phone: true,
                dateOfBirth: true, gender: true, playLevel: true, createdAt: true
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, dateOfBirth, gender, playLevel } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.userData.userId },
            data: { name, phone, dateOfBirth, gender, playLevel },
            select: {
                id: true, email: true, name: true, phone: true,
                dateOfBirth: true, gender: true, playLevel: true, createdAt: true
            }
        });
        res.json(updated);
    } catch {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
