const mongoose = require("mongoose");
require("dotenv").config();

const Court = require("./models/Court");
const Coach = require("./models/Coach");
const Equipment = require("./models/Equipment");
const PricingRule = require("./models/PricingRule");
const Booking = require("./models/Booking");
const User = require("./models/User");

// --------------------------------------------------
// UNIVERSAL AVAILABILITY FOR DEVELOPMENT
// Coaches are available from 6AM to 10PM for ALL days (0–6)
// --------------------------------------------------

const fullAvailability = [
  { dayOfWeek: 0, startHour: 6, endHour: 22 },
  { dayOfWeek: 1, startHour: 6, endHour: 22 },
  { dayOfWeek: 2, startHour: 6, endHour: 22 },
  { dayOfWeek: 3, startHour: 6, endHour: 22 },
  { dayOfWeek: 4, startHour: 6, endHour: 22 },
  { dayOfWeek: 5, startHour: 6, endHour: 22 },
  { dayOfWeek: 6, startHour: 6, endHour: 22 }
];

// --------------------------------------------------
// 20 COURTS
// --------------------------------------------------

const courts = [
    {
      name: "Battlefields Sports Arena",
      type: "indoor",
      basePrice: 350,
      rating: 4.8,
      ratingCount: 220,
      imageURL:
        "https://playo.gumlet.io/BATTLEFIELDSSPORTSARENA20240626141748593016/BattlefieldsSportsArena1719479608535.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Apex Badminton Centre",
      type: "indoor",
      basePrice: 300,
      rating: 4.6,
      ratingCount: 180,
      imageURL:
        "https://playo.gumlet.io/APEXBADMINTONCENTRE/ApexSportsArena1711767644636.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Hiline Badminton Academy",
      type: "indoor",
      basePrice: 400,
      rating: 4.9,
      ratingCount: 340,
      imageURL:
        "https://playo.gumlet.io/HILINEBADMINTONACADEMY20250727112057406963/HilineBadmintonAcademy1759504789407.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Sports One Elite Academy",
      type: "indoor",
      basePrice: 380,
      rating: 4.7,
      ratingCount: 260,
      imageURL:
        "https://playo.gumlet.io/SPORTSONEELITEBADMINTONACADEMY20241215171236794958/SportsoneEliteBadmintonAcademy1735568306581.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "A1 Sports Club",
      type: "indoor",
      basePrice: 250,
      rating: 4.5,
      ratingCount: 150,
      imageURL:
        "https://playo.gumlet.io/AONESPORTSCLUB20241028170703716714/AONESportsClub1737189099266.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "VS Badminton Academy",
      type: "indoor",
      basePrice: 350,
      rating: 4.8,
      ratingCount: 300,
      imageURL:
        "https://playo.gumlet.io/VSKBADMINTONACADEMY20210309071541327122/VSBadmintonAcademy1744961420264.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "SBM Sports Club",
      type: "outdoor",
      basePrice: 200,
      rating: 4.4,
      ratingCount: 140,
      imageURL:
        "https://playo.gumlet.io/SBMSPORTSCLUB20230627041453895037/SBMSportsClub1687887970419.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Vega Badminton Arena",
      type: "indoor",
      basePrice: 450,
      rating: 5.0,
      ratingCount: 420,
      imageURL:
        "https://playo.gumlet.io/VEGABADMINTONARENA20250712112433090657/VegaBadmintonArena1752319555564.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "V4 Badminton Academy",
      type: "indoor",
      basePrice: 300,
      rating: 4.6,
      ratingCount: 195,
      imageURL:
        "https://playo.gumlet.io/V4BADMINTONACADEMY20250821134757913255/V4BadmintonAcademy1755784344706.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "A-One Sports Club (Branch 2)",
      type: "indoor",
      basePrice: 240,
      rating: 4.4,
      ratingCount: 130,
      imageURL:
        "https://playo.gumlet.io/AONESPORTSCLUB20251106065552334960/aonesportsclub1762412217435.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Chetan Anand Badminton Academy",
      type: "indoor",
      basePrice: 480,
      rating: 5.0,
      ratingCount: 500,
      imageURL:
        "https://playo.gumlet.io/CHETANANANDBADMINTONMIYAPUR20190331161247496452/ChetanAnandSportsCentre1653393960427.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "SNS Sports Nest",
      type: "outdoor",
      basePrice: 200,
      rating: 4.3,
      ratingCount: 160,
      imageURL:
        "https://playo.gumlet.io/SNSSPORTSNEST20200919052500617120/SnSSportsNest1757655624102.jpg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "PDR Badminton Academy",
      type: "indoor",
      basePrice: 350,
      rating: 4.7,
      ratingCount: 280,
      imageURL:
        "https://playo.gumlet.io/PDRBADMINTONACADEMY20250408172721644154/PDRBadmintonAcademy1747903825135.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Rise Badminton",
      type: "indoor",
      basePrice: 420,
      rating: 4.9,
      ratingCount: 330,
      imageURL:
        "https://playo.gumlet.io/RISEBADMINTON/RiseBadminton83a6459eff5049d8b825dc87decb3a42.jpg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Skyline Badminton Academy",
      type: "indoor",
      basePrice: 380,
      rating: 4.8,
      ratingCount: 250,
      imageURL:
        "https://playo.gumlet.io/SKYLINEBADMINTONACADEMY20240618092648830835/SkyLineBadmintonAcademy1718703094649.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "The Smaash Badminton",
      type: "indoor",
      basePrice: 310,
      rating: 4.6,
      ratingCount: 190,
      imageURL:
        "https://playo.gumlet.io/THESMAASHBADMINTON20250131071901703006/TheSmaashBadminton1738510924324.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Infinite Badminton Academy",
      type: "indoor",
      basePrice: 340,
      rating: 4.7,
      ratingCount: 275,
      imageURL:
        "https://playo.gumlet.io/INFINITEBADMINTONACADEMY20231219063443607026/InfiniteBadmintonAcademy1703672813380.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Shuttle Time Academy",
      type: "indoor",
      basePrice: 260,
      rating: 4.5,
      ratingCount: 210,
      imageURL:
        "https://playo.gumlet.io/SHUTTLETIMEBADMINTONACADEMY20230225060948215069/ShuttleTimeBadmintonAcademy1677732424965.jpeg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "Rio Badminton Arena",
      type: "outdoor",
      basePrice: 230,
      rating: 4.4,
      ratingCount: 140,
      imageURL:
        "https://playo.gumlet.io/RIOBADMINTONARENA20190415165811730538/RioBadmintonArena1.jpg?mode=crop&crop=smart&h=200&width=450&q=75"
    },
    {
      name: "N9 Sports Arena",
      type: "indoor",
      basePrice: 320,
      rating: 4.7,
      ratingCount: 260,
      imageURL:
        "https://playo.gumlet.io/N9SPORTS20240611092915376576/N9Sports1718098255930.jpg?mode=crop&crop=smart&h=200&width=450&q=75"
    }
  ];
  

// --------------------------------------------------
// 10 COACHES (FULL DAY AVAILABILITY)
// --------------------------------------------------

const coaches = [
  { name: "Coach John", hourlyRate: 150, availability: fullAvailability },
  { name: "Coach Priya", hourlyRate: 200, availability: fullAvailability },
  { name: "Coach Arjun", hourlyRate: 180, availability: fullAvailability },
  { name: "Coach Neha", hourlyRate: 220, availability: fullAvailability },
  { name: "Coach Rahul", hourlyRate: 160, availability: fullAvailability },
  { name: "Coach Kavya", hourlyRate: 250, availability: fullAvailability },
  { name: "Coach Sanjay", hourlyRate: 175, availability: fullAvailability },
  { name: "Coach Meera", hourlyRate: 190, availability: fullAvailability },
  { name: "Coach David", hourlyRate: 210, availability: fullAvailability },
  { name: "Coach Riya", hourlyRate: 230, availability: fullAvailability }
];

// --------------------------------------------------
// 10 EQUIPMENT ITEMS
// --------------------------------------------------

const equipment = [
  { name: "Racket", totalStock: 20, perUnitFee: 30 },
  { name: "Badminton Shoes", totalStock: 15, perUnitFee: 50 },
  { name: "Shuttlecock", totalStock: 100, perUnitFee: 10 },
  { name: "Wristbands", totalStock: 30, perUnitFee: 15 },
  { name: "Sports Bottle", totalStock: 25, perUnitFee: 20 },
  { name: "Ankle Support", totalStock: 10, perUnitFee: 40 },
  { name: "Headband", totalStock: 20, perUnitFee: 15 },
  { name: "Grip Tape", totalStock: 50, perUnitFee: 12 },
  { name: "Training Ladder", totalStock: 5, perUnitFee: 100 },
  { name: "Resistance Bands", totalStock: 8, perUnitFee: 60 }
];

// --------------------------------------------------
// 10 PRICING RULES
// --------------------------------------------------

const pricingRules = [
  { name: "Weekend Surcharge", type: "fixed", condition: { dayOfWeek: [0, 6] }, value: 80 },
  { name: "Evening Peak", type: "multiplier", condition: { startHour: 18, endHour: 22 }, value: 1.5 },
  { name: "Morning Discount", type: "fixed", condition: { startHour: 6, endHour: 9 }, value: -20 },
  { name: "Indoor Premium", type: "fixed", condition: { type: ["indoor"] }, value: 40 },
  { name: "Holiday Pricing", type: "fixed", condition: { date: "2025-12-25" }, value: 100 },
  { name: "Outdoor Discount", type: "fixed", condition: { type: ["outdoor"] }, value: -15 },
  { name: "Late Night Charge", type: "fixed", condition: { startHour: 21, endHour: 23 }, value: 30 }
];

// --------------------------------------------------
// SEED SCRIPT
// --------------------------------------------------

(async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Court.deleteMany();
    await Coach.deleteMany();
    await Equipment.deleteMany();
    await PricingRule.deleteMany();
    await Booking.deleteMany();
    
    // Create admin user if it doesn't exist
    const adminEmail = "admin@sports.com";
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = new User({
        name: "chandukr",
        email: adminEmail,
        password: "Admin123!", // Will be hashed automatically by User model
        role: "admin"
      });
      await adminUser.save();
      console.log("✓ Admin user created successfully");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: Admin123!`);
      console.log(`   Role: admin`);
    } else {
      // Update existing admin user to ensure correct credentials
      adminUser.name = "chandukr";
      adminUser.password = "Admin123!"; // Will be hashed automatically
      adminUser.role = "admin";
      await adminUser.save();
      console.log("✓ Admin user updated successfully");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: Admin123!`);
      console.log(`   Role: admin`);
    }

    const savedCourts = await Court.insertMany(courts);
    const savedCoaches = await Coach.insertMany(coaches);
    const savedEquipment = await Equipment.insertMany(equipment);
    await PricingRule.insertMany(pricingRules);

    // Create 10 sample bookings
    const bookings = [];
    for (let i = 0; i < 10; i++) {
      const start = new Date();
      start.setHours(10 + i, 0, 0);

      const end = new Date(start.getTime() + 60 * 60 * 1000);

      bookings.push({
        user: new mongoose.Types.ObjectId(),
        court: savedCourts[i % savedCourts.length]._id,
        startTime: start,
        endTime: end,
        resources: {
          rackets: 1,
          shoes: 1,
          coach: savedCoaches[i % savedCoaches.length]._id
        },
        pricingBreakdown: {
          basePrice: 200 + i * 10,
          peakFee: 20,
          equipmentFee: 15,
          coachFee: 50,
          total: 285 + i * 10
        }
      });
    }

    await Booking.insertMany(bookings);

    console.log("✓ All data inserted successfully");
    process.exit();
  } catch (err) {
    console.error("Seeder Error:", err);
    process.exit(1);
  }
})();
