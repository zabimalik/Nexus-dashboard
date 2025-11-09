import fetch from 'node-fetch';

const testCourseAPI = async () => {
    const baseURL = 'http://localhost:3000';
    
    console.log('🧪 Testing Course API...\n');
    
    try {
        // Test 1: API Health Check
        console.log('1. Testing API health...');
        const healthResponse = await fetch(`${baseURL}/api/courses/test`);
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData.message);
        
        // Test 2: Get All Courses
        console.log('\n2. Testing get all courses...');
        const coursesResponse = await fetch(`${baseURL}/api/courses`);
        const coursesData = await coursesResponse.json();
        
        if (coursesData.success) {
            console.log(`✅ Courses API working! Found ${coursesData.count || 0} courses`);
            
            if (coursesData.data && coursesData.data.length > 0) {
                console.log('\n📚 Available Courses:');
                coursesData.data.forEach((course, index) => {
                    console.log(`   ${index + 1}. ${course.name} - $${course.price}`);
                });
            } else {
                console.log('⚠️  No courses found. Run "npm run seed:courses" to add sample data.');
            }
        } else {
            console.log('❌ Courses API failed:', coursesData.message);
        }
        
        console.log('\n🎉 Course API test completed!');
        
    } catch (error) {
        console.error('❌ Course API test failed:', error.message);
        console.log('\n💡 Make sure the backend server is running on port 3000');
        console.log('   Run: npm start');
    }
};

testCourseAPI();