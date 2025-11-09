import fetch from 'node-fetch';

const addTestCourse = async () => {
    const baseURL = 'http://localhost:3000';
    
    console.log('🧪 Adding test course...\n');
    
    try {
        const courseData = {
            name: "Web Development",
            description: "Learn modern web development with HTML, CSS, JavaScript, React, and Node.js",
            price: 25000,
            duration: "6 months",
            includes: ["HTML & CSS", "JavaScript ES6+", "React.js", "Node.js & Express", "MongoDB", "REST APIs"]
        };
        
        console.log('Sending course data:', courseData);
        
        const response = await fetch(`${baseURL}/api/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(courseData)
        });
        
        const result = await response.json();
        console.log('Response:', result);
        
        if (result.success) {
            console.log('✅ Course added successfully!');
            console.log('Course ID:', result.data._id);
        } else {
            console.log('❌ Failed to add course:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error adding course:', error.message);
    }
};

addTestCourse();