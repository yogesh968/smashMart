const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URL || "mongodb+srv://smashmart:Yogesh1987@smashmart.zax6zoc.mongodb.net/smashmart?retryWrites=true&w=majority";
const client = new MongoClient(uri);

function getDbName() {
    try {
        const p = uri.split('.mongodb.net/')[1] || '';
        return p.split('?')[0] || 'smashmart';
    } catch { return 'smashmart'; }
}

async function run() {
    try {
        await client.connect();
        const db = client.db(getDbName());
        console.log(`Connected — seeding into: ${getDbName()}`);

        const categories = db.collection('Category');
        const products = db.collection('Product');

        await categories.deleteMany({});
        await products.deleteMany({});
        console.log('Cleared existing data');

        const now = new Date();

        // Seed Categories with Remote Images
        const cats = [
            { name: "Pro Rackets", image: "https://images.unsplash.com/photo-1620371350502-999e9a7d80a4?q=80&w=600&hue=180" },
            { name: "Premium Shuttles", image: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=600" },
            { name: "Elite Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&hue=200" },
            { name: "Bags & Totes", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600" },
            { name: "Apparel", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" },
            { name: "Accessories", image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=600" },
            { name: "Grips & Tapes", image: "https://images.unsplash.com/photo-1616248249518-b16013cd4e42?q=80&w=600" },
            { name: "Strings", image: "https://images.unsplash.com/photo-1620371350502-999e9a7d80a4?q=80&w=600&crop=entropy" }
        ];

        const insertedCats = await categories.insertMany(cats);
        console.log('Inserted categories');

        // Store categoryId as STRING so controllers can filter with { categoryId: string }
        const catIds = Object.values(insertedCats.insertedIds).map(id => id.toString());

        const prods = [
            // Rackets (using your uploaded racket images)
            {
                name: "Astrex Phantom X-99 Ultra",
                description: "The peak of carbon engineering. Ultra-stiff, head-heavy power unit for explosive smashes.",
                price: 259.99,
                categoryId: catIds[0],
                stock: 15,
                image: "/images/racket-yonex-blue.png",
                createdAt: now
            },
            {
                name: "Astrex Stealth 700",
                description: "Aerodynamic frame design for rapid swing speed and defensive recovery.",
                price: 189.99,
                categoryId: catIds[0],
                stock: 20,
                image: "/images/racket-mizuno-fortius.png",
                createdAt: now
            },
            {
                name: "Astrex Velocity Pro",
                description: "Lightweight control racket perfect for doubles play and net shots.",
                price: 149.99,
                categoryId: catIds[0],
                stock: 25,
                image: "/images/racket-nanospeed-nuclear75.png",
                createdAt: now
            },
            {
                name: "Astrex Thunder Strike",
                description: "Maximum power racket with extra stiff shaft for aggressive players.",
                price: 229.99,
                categoryId: catIds[0],
                stock: 12,
                image: "/images/racket-yonex-teal.png",
                createdAt: now
            },
            {
                name: "Astrex Precision Elite",
                description: "Balanced racket offering perfect blend of power and control.",
                price: 199.99,
                categoryId: catIds[0],
                stock: 18,
                image: "/images/racket-black-green.png",
                createdAt: now
            },

            // Shuttles (using your uploaded premium shuttle images)
            {
                name: "Astrex Orbital v.50 Pro",
                description: "Aeronautically tested tournament grade goose feather shuttlecocks.",
                price: 44.99,
                categoryId: catIds[1],
                stock: 100,
                image: "/images/shuttle-leijiaer-tube.png",
                createdAt: now
            },
            {
                name: "Astrex Aero-Sync Nylon",
                description: "Durable nylon shuttles with flight stability mimicking natural feathers.",
                price: 24.99,
                categoryId: catIds[1],
                stock: 200,
                image: "/images/shuttle-kunli.png",
                createdAt: now
            },
            {
                name: "Astrex Tournament Gold",
                description: "Premium duck feather shuttles for professional tournaments.",
                price: 39.99,
                categoryId: catIds[1],
                stock: 150,
                image: "/images/shuttle-mavis-350.png",
                createdAt: now
            },
            {
                name: "Astrex Practice Pack",
                description: "Value pack of 12 durable shuttles for training sessions.",
                price: 19.99,
                categoryId: catIds[1],
                stock: 300,
                image: "/images/shuttle-neon-yellow.png",
                createdAt: now
            },

            // Shoes (using your uploaded shoe images)
            {
                name: "Astrex Gravity Elite III",
                description: "Power cushion technology with lateral stability for elite court movement.",
                price: 179.99,
                categoryId: catIds[2],
                stock: 25,
                image: "/images/shoe-yonex-aerus.png",
                createdAt: now
            },
            {
                name: "Astrex Court-Flow v2",
                description: "Lightweight, breathable court shoes with non-marking gum rubber soles.",
                price: 129.99,
                categoryId: catIds[2],
                stock: 40,
                image: "/images/shoe-yonex-blue.png",
                createdAt: now
            },
            {
                name: "Astrex Speed Demon",
                description: "Ultra-light shoes designed for maximum agility and quick movements.",
                price: 159.99,
                categoryId: catIds[2],
                stock: 30,
                image: "/images/shoe-yonex-red.png",
                createdAt: now
            },
            {
                name: "Astrex Comfort Pro",
                description: "All-day comfort with superior arch support for recreational players.",
                price: 99.99,
                categoryId: catIds[2],
                stock: 50,
                image: "/images/shoe-yonex-white-orange.png",
                createdAt: now
            },

            // Bags & Totes (using your uploaded bag images)
            {
                name: "Astrex Tour Pro 9-Pack Bag",
                description: "Thermal lined racket compartments with dedicated shoe and wet pockets.",
                price: 99.99,
                categoryId: catIds[3],
                stock: 15,
                image: "/images/bag-victor.png",
                createdAt: now
            },
            {
                name: "Astrex Aero Backpack",
                description: "Compact racket backpack for the urban athlete.",
                price: 69.99,
                categoryId: catIds[3],
                stock: 30,
                image: "/images/bag-lining-badminton.png",
                createdAt: now
            },
            {
                name: "Astrex Elite 6-Racket Bag",
                description: "Professional tournament bag with multiple compartments.",
                price: 79.99,
                categoryId: catIds[3],
                stock: 20,
                image: "/images/bag-mizuno.png",
                createdAt: now
            },

            // Apparel (using your uploaded apparel images)
            {
                name: "Astrex Performance Tee",
                description: "Moisture-wicking fabric with anti-odor technology.",
                price: 34.99,
                categoryId: catIds[4],
                stock: 100,
                image: "/images/apparel-perfly-white-teal.png",
                createdAt: now
            },
            {
                name: "Astrex Pro Shorts",
                description: "Lightweight shorts with stretch fabric for unrestricted movement.",
                price: 39.99,
                categoryId: catIds[4],
                stock: 80,
                image: "/images/apparel-yonex-navy-orange.png",
                createdAt: now
            },
            {
                name: "Astrex Training Jacket",
                description: "Breathable windbreaker perfect for warm-ups and cool-downs.",
                price: 79.99,
                categoryId: catIds[4],
                stock: 40,
                image: "/images/apparel-yonex-blue.png",
                createdAt: now
            },
            {
                name: "Astrex Competition Jersey",
                description: "Official tournament jersey with sublimated design.",
                price: 49.99,
                categoryId: catIds[4],
                stock: 60,
                image: "/images/apparel-yonex-red.png",
                createdAt: now
            },
            {
                name: "Astrex Sport Socks (3-Pack)",
                description: "Cushioned athletic socks with arch compression.",
                price: 19.99,
                categoryId: catIds[4],
                stock: 150,
                image: "/images/apparel-sport-socks.png",
                createdAt: now
            },

            // Accessories (1st image = 1st product, 2nd = 2nd, … continuously)
            {
                name: "Astrex Wristbands (Pair)",
                description: "Absorbent terry cloth wristbands for sweat management.",
                price: 9.99,
                categoryId: catIds[5],
                stock: 200,
                image: "/images/acc-wristbands.png",
                createdAt: now
            },
            {
                name: "Astrex Court Net",
                description: "Portable badminton net for court setup.",
                price: 49.99,
                categoryId: catIds[5],
                stock: 40,
                image: "/images/acc-net.png",
                createdAt: now
            },
            {
                name: "Astrex Scoreboard",
                description: "Manual flip scoreboard for matches.",
                price: 34.99,
                categoryId: catIds[5],
                stock: 60,
                image: "/images/acc-scoreboard.png",
                createdAt: now
            },
            {
                name: "Astrex Water Bottle",
                description: "Insulated 750ml bottle keeps drinks cold for 24 hours.",
                price: 29.99,
                categoryId: catIds[5],
                stock: 80,
                image: "/images/acc-water-bottle.png",
                createdAt: now
            },
            {
                name: "Astrex Towel Elite",
                description: "Microfiber sports towel with quick-dry technology.",
                price: 24.99,
                categoryId: catIds[5],
                stock: 100,
                image: "/images/acc-towel.png",
                createdAt: now
            },
            {
                name: "Astrex Headband Pro",
                description: "Non-slip silicone grip headband keeps hair and sweat at bay.",
                price: 12.99,
                categoryId: catIds[5],
                stock: 150,
                image: "/images/acc-headband.png",
                createdAt: now
            },

            // Grips & Tapes (using your uploaded grip images)
            {
                name: "Astrex Nano-Grip Pro XL",
                description: "Extreme friction coating for precise handle control. Pack of 12.",
                price: 14.99,
                categoryId: catIds[6],
                stock: 500,
                image: "/images/grip-head-overgrips.png",
                createdAt: now
            },
            {
                name: "Astrex Tacky Overgrip",
                description: "Super tacky grip with moisture absorption. Pack of 3.",
                price: 8.99,
                categoryId: catIds[6],
                stock: 400,
                image: "/images/grip-yonex-tape.png",
                createdAt: now
            },
            {
                name: "Astrex Pro Towel Grip",
                description: "Absorbent terry cloth grip for sweat absorption and secure hold.",
                price: 11.99,
                categoryId: catIds[6],
                stock: 300,
                image: "/images/grip-towel-red.png",
                createdAt: now
            },

            // Strings (using your uploaded string images)
            {
                name: "Astrex Titan-String 0.66",
                description: "High-repulsion titanium coated strings for sharp hitting sound.",
                price: 12.99,
                categoryId: catIds[7],
                stock: 300,
                image: "/images/string-lining-rebound.png",
                createdAt: now
            },
            {
                name: "Astrex Power String 0.68",
                description: "Thick gauge string for maximum power and durability.",
                price: 10.99,
                categoryId: catIds[7],
                stock: 250,
                image: "/images/string-yonex-exbolt65.png",
                createdAt: now
            },
            {
                name: "Astrex Pro String 0.65",
                description: "Super repulsion string for agile shots and crisp sound.",
                price: 14.99,
                categoryId: catIds[7],
                stock: 200,
                image: "/images/string-hundred-magnite.png",
                createdAt: now
            },
            {
                name: "Astrex Boost String 0.66",
                description: "Optimum repulsion and crisp sound. Japan edition.",
                price: 13.99,
                categoryId: catIds[7],
                stock: 220,
                image: "/images/string-hundred-boost.png",
                createdAt: now
            },
            {
                name: "Astrex Hybrid String 0.69",
                description: "Multifilament hybrid string for durability and feel.",
                price: 11.99,
                categoryId: catIds[7],
                stock: 180,
                image: "/images/string-hybrid-069.png",
                createdAt: now
            },
            {
                name: "Astrex Control String 0.65",
                description: "Durability and feel for precise control.",
                price: 13.99,
                categoryId: catIds[7],
                stock: 200,
                image: "/images/string-control-065.png",
                createdAt: now
            }
        ];

        await products.insertMany(prods);
        console.log(`Inserted ${prods.length} products across ${cats.length} categories`);
        console.log('Seeding complete!');

    } finally {
        await client.close();
    }
}

run().catch(console.dir);
