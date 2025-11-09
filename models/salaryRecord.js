import mongoose from 'mongoose';

const salaryRecordSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Teacher ID is required']
    },
    teacherName: {
        type: String,
        required: [true, 'Teacher name is required']
    },
    month: {
        type: String,
        required: [true, 'Month is required'],
        enum: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [2000, 'Year must be at least 2000'],
        max: [2100, 'Year must be at most 2100']
    },
    baseSalary: {
        type: Number,
        required: [true, 'Base salary is required'],
        min: [0, 'Base salary cannot be negative']
    },
    bonus: {
        type: Number,
        default: 0,
        min: [0, 'Bonus cannot be negative']
    },
    deductions: {
        type: Number,
        default: 0,
        min: [0, 'Deductions cannot be negative']
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: [0, 'Amount paid cannot be negative']
    },
    paymentDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: '',
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for net payable amount
salaryRecordSchema.virtual('netPayable').get(function() {
    return this.baseSalary + this.bonus - this.deductions;
});

// Virtual for remaining amount
salaryRecordSchema.virtual('remainingAmount').get(function() {
    return Math.max(0, this.netPayable - this.amountPaid);
});

// Virtual for payment percentage
salaryRecordSchema.virtual('paymentPercentage').get(function() {
    if (this.netPayable === 0) return 0;
    return Math.round((this.amountPaid / this.netPayable) * 100);
});

// Virtual for payment status
salaryRecordSchema.virtual('paymentStatus').get(function() {
    const percentage = this.paymentPercentage;
    if (percentage === 0) return 'Unpaid';
    if (percentage === 100) return 'Paid';
    return 'Partial';
});

// Compound index to ensure unique salary record per teacher per month/year
salaryRecordSchema.index({ teacherId: 1, month: 1, year: 1 }, { unique: true });

// Index for efficient querying
salaryRecordSchema.index({ month: 1, year: 1 });
salaryRecordSchema.index({ paymentStatus: 1 });
salaryRecordSchema.index({ createdAt: -1 });

// Pre-save middleware to update teacherName if teacher is populated
salaryRecordSchema.pre('save', async function(next) {
    if (this.isModified('teacherId') && !this.teacherName) {
        try {
            const Teacher = mongoose.model('Teacher');
            const teacher = await Teacher.findById(this.teacherId);
            if (teacher) {
                this.teacherName = teacher.name;
            }
        } catch (error) {
            console.error('Error updating teacher name:', error);
        }
    }
    next();
});

const SalaryRecord = mongoose.model('SalaryRecord', salaryRecordSchema);

export default SalaryRecord;