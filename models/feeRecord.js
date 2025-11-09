import mongoose from 'mongoose';

const feeRecordSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        trim: true
    },
    studentName: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true,
        maxlength: [100, 'Student name cannot exceed 100 characters']
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student reference is required']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course reference is required']
    },
    courseName: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true
    },
    totalFee: {
        type: Number,
        required: [true, 'Total fee is required'],
        min: [0, 'Total fee cannot be negative']
    },
    amountPaid: {
        type: Number,
        required: [true, 'Amount paid is required'],
        min: [0, 'Amount paid cannot be negative'],
        default: 0
    },
    paymentStatus: {
        type: String,
        required: [true, 'Payment status is required'],
        enum: {
            values: ['Paid', 'Partial', 'Unpaid'],
            message: 'Payment status must be either Paid, Partial, or Unpaid'
        },
        default: 'Unpaid'
    },
    paymentDate: {
        type: Date,
        default: null
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    installments: [{
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentDate: {
            type: Date,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Card', 'Bank Transfer', 'Online', 'Cheque'],
            default: 'Cash'
        },
        transactionId: {
            type: String,
            trim: true
        },
        remarks: {
            type: String,
            trim: true,
            maxlength: [500, 'Remarks cannot exceed 500 characters']
        }
    }],
    discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        default: 0
    },
    discountReason: {
        type: String,
        trim: true,
        maxlength: [200, 'Discount reason cannot exceed 200 characters']
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Virtual for remaining amount
feeRecordSchema.virtual('remainingAmount').get(function() {
    return Math.max(0, this.totalFee - this.discount - this.amountPaid);
});

// Virtual for payment completion percentage
feeRecordSchema.virtual('paymentPercentage').get(function() {
    const effectiveTotal = this.totalFee - this.discount;
    return effectiveTotal > 0 ? Math.round((this.amountPaid / effectiveTotal) * 100) : 0;
});

// Pre-save middleware to update payment status
feeRecordSchema.pre('save', function(next) {
    const effectiveTotal = this.totalFee - this.discount;
    
    if (this.amountPaid >= effectiveTotal) {
        this.paymentStatus = 'Paid';
        if (!this.paymentDate) {
            this.paymentDate = new Date();
        }
    } else if (this.amountPaid > 0) {
        this.paymentStatus = 'Partial';
    } else {
        this.paymentStatus = 'Unpaid';
        this.paymentDate = null;
    }
    
    next();
});

// Index for better query performance
feeRecordSchema.index({ studentId: 1, course: 1 });
feeRecordSchema.index({ paymentStatus: 1 });
feeRecordSchema.index({ createdAt: -1 });

const FeeRecord = mongoose.model('FeeRecord', feeRecordSchema);

export default FeeRecord;