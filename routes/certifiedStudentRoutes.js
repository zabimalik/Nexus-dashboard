import express from 'express';
import { 
    createCertifiedStudent, 
    getAllCertifiedStudents, 
    getCertifiedStudentById,
    getCertifiedStudentByStudentId,
    updateCertifiedStudent, 
    deleteCertifiedStudent 
} from '../controllers/certifiedStudentController.js';

const router = express.Router();

// Create a new certified student
router.post('/', createCertifiedStudent);

// Get all certified students
router.get('/', getAllCertifiedStudents);

// Get single certified student by ID
router.get('/:id', getCertifiedStudentById);

// Get certified student by student ID
router.get('/student-id/:studentId', getCertifiedStudentByStudentId);

// Update certified student
router.put('/:id', updateCertifiedStudent);

// Delete certified student
router.delete('/:id', deleteCertifiedStudent);

export default router;