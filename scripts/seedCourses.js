import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/course.js';

dotenv.config();

const courses = [
  {
    title: 'Full-Stack Development',
    legacyTitle: 'Web Development',
    description: 'Build production-grade applications with TypeScript, React, Node.js, and cloud-native deployment pipelines.',
    icon: 'Code',
    duration: '24 Weeks',
    level: 'Intermediate · Advanced',
    mode: 'Hybrid Cohort',
    price: 137252,
    originalPrice: 191702,
    image: 'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-indigo-500/20',
    borderGradient: 'from-blue-500 via-cyan-500 to-indigo-500',
    accentColor: 'blue',
    highlights: [
      'Modern front-end stacks: React, Next.js, Tailwind, TypeScript',
      'Microservices with Node.js, Express & Postgres',
      'CI/CD mastery using GitHub Actions, Vercel & AWS',
    ],
    order: 1
  },
  {
    title: 'E-Commerce Mastery',
    legacyTitle: 'E-Commerce & Shopify',
    description: 'Design high-converting Shopify stores with CRO frameworks, automation, and omni-channel integrations.',
    icon: 'ShoppingCart',
    duration: '12 Weeks',
    level: 'Beginner · Intermediate',
    mode: 'Live Virtual',
    price: 82142,
    originalPrice: 109532,
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-emerald-500/20 via-green-500/10 to-teal-500/20',
    borderGradient: 'from-emerald-500 via-green-500 to-teal-500',
    accentColor: 'emerald',
    highlights: [
      'Storefront UX optimization & brand strategy',
      'Payments, logistics, and inventory automation',
      'Meta & Google Ads funnels with attribution dashboards',
    ],
    order: 2
  },
  {
    title: 'Digital Essentials',
    legacyTitle: 'Basic Computer Course',
    description: 'Master digital literacy, productivity suites, and cloud collaboration to excel in modern workplaces.',
    icon: 'MonitorPlay',
    duration: '10 Weeks',
    level: 'Beginner Friendly',
    mode: 'On-Campus',
    price: 41057,
    originalPrice: 54752,
    image: 'https://images.unsplash.com/photo-1488197047962-b48492212cda?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-purple-500/20 via-pink-500/10 to-violet-500/20',
    borderGradient: 'from-purple-500 via-pink-500 to-violet-500',
    accentColor: 'purple',
    highlights: [
      'Microsoft 365 power skills & business templates',
      'Google Workspace and cloud collaboration',
      'Professional email, project tracking & presentation design',
    ],
    order: 3
  },
  {
    title: 'Digital Marketing',
    legacyTitle: 'Digital Marketing',
    description: 'Craft omnichannel campaigns with full-funnel analytics and data-backed brand storytelling.',
    icon: 'TrendingUp',
    duration: '14 Weeks',
    level: 'All Levels',
    mode: 'Hybrid Cohort',
    price: 95837,
    originalPrice: 123227,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-orange-500/20 via-red-500/10 to-pink-500/20',
    borderGradient: 'from-orange-500 via-red-500 to-pink-500',
    accentColor: 'orange',
    highlights: [
      'SEO, content marketing & inbound funnels',
      'Campaign automation using HubSpot & Zapier',
      'Data studio dashboards and stakeholder reporting',
    ],
    order: 4
  },
  {
    title: 'CAD Architecture',
    legacyTitle: 'AutoCAD 2D & 3D',
    description: 'Create precision CAD drawings and immersive 3D visualizations for architecture and engineering.',
    icon: 'Ruler',
    duration: '16 Weeks',
    level: 'Beginner · Intermediate',
    mode: 'Studio Sessions',
    price: 109532,
    originalPrice: 137252,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-orange-500/20',
    borderGradient: 'from-amber-500 via-yellow-500 to-orange-500',
    accentColor: 'amber',
    highlights: [
      'Industry-grade site plans & construction drawings',
      '3D modeling workflows with rendering best practices',
      'Collaboration via BIM-ready documentation',
    ],
    order: 5
  },
  {
    title: 'Graphic Design',
    legacyTitle: 'Graphic Designing',
    description: 'Design premium brand systems with Adobe Creative Cloud and strategic storytelling foundations.',
    icon: 'Palette',
    duration: '12 Weeks',
    level: 'Beginner · Intermediate',
    mode: 'Studio Sessions',
    price: 68467,
    originalPrice: 95837,
    image: 'https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=1600&q=80',
    gradient: 'from-rose-500/20 via-pink-500/10 to-purple-500/20',
    borderGradient: 'from-rose-500 via-pink-500 to-purple-500',
    accentColor: 'rose',
    highlights: [
      'Adobe Photoshop, Illustrator & InDesign mastery',
      'Brand strategy, mood boards & typography systems',
      'Packaging, UI kits & presentation storytelling',
    ],
    order: 6
  },
];

const seedCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Drop the collection to ensure clean slate
    try {
      await mongoose.connection.db.collection('courses').drop();
      console.log('🗑️  Dropped courses collection');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('ℹ️  Courses collection does not exist, creating new one');
      } else {
        throw error;
      }
    }

    // Insert new courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Successfully seeded ${createdCourses.length} courses`);

    console.log('\n📚 Courses added:');
    createdCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - Rs ${course.price.toLocaleString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();
