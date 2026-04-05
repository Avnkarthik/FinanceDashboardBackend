"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserAuthApi_1 = require("./UserAuthApi");
const FinanceApi_1 = require("./FinanceApi");
const middleware_1 = require("./middleware");
const UserModel_1 = require("../model/UserModel");
const router = (0, express_1.Router)();
// --- Auth Routes ---
router.post('/auth/register', UserAuthApi_1.RegisterUser);
router.post('/auth/login', UserAuthApi_1.LoginUser);
router.post('/auth/logout', UserAuthApi_1.LogoutUser);
// --- Finance Dashboard Routes ---
// Aggregated data: Analyst and Admin only (no Viewers)
router.get('/finance/dashboard/summary', middleware_1.ProtectRoute, (0, middleware_1.AuthorizeRole)([UserModel_1.UserRole.Admin, UserModel_1.UserRole.Analyst]), FinanceApi_1.GetDashboardSummary);
// Get records: Everyone authenticated can view basic records setup
router.get('/finance', middleware_1.ProtectRoute, (0, middleware_1.AuthorizeRole)([UserModel_1.UserRole.Admin, UserModel_1.UserRole.Analyst, UserModel_1.UserRole.Viewer]), FinanceApi_1.GetRecords);
// Create, Update, Delete: Admin Only
router.post('/finance', middleware_1.ProtectRoute, (0, middleware_1.AuthorizeRole)([UserModel_1.UserRole.Admin]), FinanceApi_1.CreateRecord);
router.put('/finance/:id', middleware_1.ProtectRoute, (0, middleware_1.AuthorizeRole)([UserModel_1.UserRole.Admin]), FinanceApi_1.UpdateRecord);
router.delete('/finance/:id', middleware_1.ProtectRoute, (0, middleware_1.AuthorizeRole)([UserModel_1.UserRole.Admin]), FinanceApi_1.DeleteRecord);
exports.default = router;
