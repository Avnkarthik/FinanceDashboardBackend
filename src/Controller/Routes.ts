import { Router } from 'express';
import { RegisterUser, LoginUser, LogoutUser } from './UserAuthApi';
import { CreateRecord, GetRecords, UpdateRecord, DeleteRecord, GetDashboardSummary } from './FinanceApi';
import { ProtectRoute, AuthorizeRole } from './middleware';
import { UserRole } from '../model/UserModel';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', RegisterUser);
router.post('/auth/login', LoginUser);
router.post('/auth/logout', LogoutUser);

// --- Finance Dashboard Routes ---
// Aggregated data: Analyst and Admin only (no Viewers)
router.get(
  '/finance/dashboard/summary',
  ProtectRoute,
  AuthorizeRole([UserRole.Admin, UserRole.Analyst]),
  GetDashboardSummary
);

// Get records: Everyone authenticated can view basic records setup
router.get(
  '/finance',
  ProtectRoute,
  AuthorizeRole([UserRole.Admin, UserRole.Analyst, UserRole.Viewer]),
  GetRecords
);

// Create, Update, Delete: Admin Only
router.post(
  '/finance',
  ProtectRoute,
  AuthorizeRole([UserRole.Admin]),
  CreateRecord
);

router.put(
  '/finance/:id',
  ProtectRoute,
  AuthorizeRole([UserRole.Admin]),
  UpdateRecord
);

router.delete(
  '/finance/:id',
  ProtectRoute,
  AuthorizeRole([UserRole.Admin]),
  DeleteRecord
);

export default router;
