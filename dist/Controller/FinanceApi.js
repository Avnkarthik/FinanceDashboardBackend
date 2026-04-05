"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDashboardSummary = exports.DeleteRecord = exports.UpdateRecord = exports.GetRecords = exports.CreateRecord = void 0;
const RecordModel_1 = require("../model/RecordModel");
const CreateRecord = async (req, res) => {
    try {
        const { amount, type, category, date, notes } = req.body;
        if (!amount || !type || !category || !date) {
            res.status(400).json({ message: 'Amount, type, category, and date are required' });
            return;
        }
        const newRecord = await RecordModel_1.RecordModel.create({
            amount,
            type,
            category,
            date: new Date(date),
            notes,
            createdBy: req.user?.id,
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('dashboard_update', { message: 'New record created', record: newRecord });
        }
        res.status(201).json({ message: 'Record created successfully', record: newRecord });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.CreateRecord = CreateRecord;
const GetRecords = async (req, res) => {
    try {
        const { type, category, page = 1, limit = 10 } = req.query;
        const query = {};
        if (type)
            query.type = type;
        if (category)
            query.category = category;
        const parseLimit = parseInt(limit, 10);
        const parsePage = parseInt(page, 10);
        const skip = (parsePage - 1) * parseLimit;
        const [records, total] = await Promise.all([
            RecordModel_1.RecordModel.find(query).sort({ date: -1 }).skip(skip).limit(parseLimit).populate('createdBy', 'name email'),
            RecordModel_1.RecordModel.countDocuments(query)
        ]);
        res.status(200).json({
            total,
            page: parsePage,
            limit: parseLimit,
            records
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.GetRecords = GetRecords;
const UpdateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedRecord = await RecordModel_1.RecordModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedRecord) {
            res.status(404).json({ message: 'Record not found' });
            return;
        }
        const io = req.app.get('io');
        if (io) {
            io.emit('dashboard_update', { message: 'Record updated', record: updatedRecord });
        }
        res.status(200).json({ message: 'Record updated successfully', record: updatedRecord });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.UpdateRecord = UpdateRecord;
const DeleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRecord = await RecordModel_1.RecordModel.findByIdAndDelete(id);
        if (!deletedRecord) {
            res.status(404).json({ message: 'Record not found' });
            return;
        }
        const io = req.app.get('io');
        if (io) {
            io.emit('dashboard_update', { message: 'Record deleted', id });
        }
        res.status(200).json({ message: 'Record deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.DeleteRecord = DeleteRecord;
const GetDashboardSummary = async (req, res) => {
    try {
        // We can run these aggregation pipelines concurrently to improve performance
        const [totalsByMonth, categoriesDistribution] = await Promise.all([
            // 1. Calculate Monthly totals for Income vs Expense
            RecordModel_1.RecordModel.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: "$date" },
                            year: { $year: "$date" },
                            type: "$type"
                        },
                        totalAmount: { $sum: "$amount" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),
            // 2. Calculate category-wise spending/income overall
            RecordModel_1.RecordModel.aggregate([
                {
                    $group: {
                        _id: { category: "$category", type: "$type" },
                        totalAmount: { $sum: "$amount" }
                    }
                }
            ])
        ]);
        // Format the pipeline results to be more frontend friendly
        const summary = {
            monthlyTrends: totalsByMonth,
            categoryDistribution: categoriesDistribution,
        };
        res.status(200).json(summary);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.GetDashboardSummary = GetDashboardSummary;
