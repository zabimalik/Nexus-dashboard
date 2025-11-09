import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/course.js';

dotenv.config();

const sampleCourses = [
    {
        name: 'Web Development',
        description: 'Master modern web development with HTML, CSS, JavaScript, React, and Node.js',
        price: 25000,
        duration: '6 months',
        includes: ['HTML & CSS', 'JavaScript ES6+', 'React.js', 'Node.js & Express', 'MongoDB', 'REST APIs'],
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop'
    },
    {
        name: 'Graphic Design',
        description: 'Learn professional graphic design using Adobe Creative Suite and modern design principles',
        price: 20000,
        duration: '4 months',
        includes: ['Adobe Photoshop', 'Adobe Illustrator', 'CorelDRAW', 'Logo Design', 'Branding', 'Print Design'],
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop'
    },
    {
        name: 'Digital Marketing',
        description: 'Comprehensive digital marketing training covering SEO, social media, and analytics',
        price: 18000,
        duration: '3 months',
        includes: ['SEO & SEM', 'Social Media Marketing', 'Google Analytics', 'Email Marketing', 'Content Strategy'],
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop'
    },
    {
        name: 'Python Programming',
        description: 'Complete Python programming course from basics to advanced data science applications',
        price: 22000,
        duration: '5 months',
        includes: ['Python Basics', 'OOP Concepts', 'Data Structures', 'Django Framework', 'Data Science', 'Machine Learning'],
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop'
    },
    {
        name: 'UI/UX Design',
        description: 'Master user interface and user experience design with industry-standard tools',
        price: 23000,
        duration: '4 months',
        includes: ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
        image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=250&fit=crop'
    }
];

const seedCourses = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academy');
        console.log('Connected to MongoDB');

        // Clear existing courses
        await Course.deleteMany({});
        console.log('Cleared existing courses');

        // Insert sample courses
        const courses = await Course.insertMany(sampleCourses);
        console.log(`Inserted ${courses.length} courses successfully!`);

        // Display created courses
        courses.forEach(course => {
            console.log(`- ${course.name} (${course._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding courses:', error);
        process.exit(1);
    }
};

seedCourses();