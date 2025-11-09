import mongoose from 'mongoose';

const budgetRecordSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Budget type is required'],
        enum: ['Salary', 'Rent', 'Utilities', 'Marketing', 'Supplies', 'Equipment', 'Maintenance', 'Other'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['income', 'expense'],
        lowercase: true
    },
    isSystemGenerated: {
        type: Boolean,
        default: false // true for auto-generated from fees/salaries
    },
    sourceType: {
        type: String,
        enum: ['manual', 'fee_collection', 'salary_payment'],
        default: 'manual'
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null // Reference to fee record or salary record
    },
    month: {
        type: String,
        required: [true, 'Month is required']
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    }
}, {
    timestamps: true
});

// Index for efficient querying
budgetRecordSchema.index({ date: -1 });
budgetRecordSchema.index({ category: 1, date: -1 });
budgetRecordSchema.index({ month: 1, year: 1 });
budgetRecordSchema.index({ sourceType: 1 });

const BudgetRecord = mongoose.model('BudgetRecord', budgetRecordSchema);

export default BudgetRecord;