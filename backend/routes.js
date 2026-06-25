import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error('FATAL: JWT_SECRET not set.'); process.exit(1); }

// ── Auth middleware ──────────────────────────────────────────
const authenticate = (req, res, next) => {
  const auth = req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided.' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired.' });
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'NGOAdmin') return res.status(403).json({ error: 'Admin access required.' });
  next();
};

// ── Auth ─────────────────────────────────────────────────────
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (!rows.length) return res.status(400).json({ error: 'Invalid email or password.' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password.' });
    const token = jwt.sign(
      { id: rows[0].id, role: rows[0].role, org: rows[0].organization_id },
      JWT_SECRET, { expiresIn: '8h' }
    );
    res.json({ token, user: { id: rows[0].id, name: rows[0].full_name, role: rows[0].role, email: rows[0].email } });
  } catch (err) { next(err); }
});

router.post('/auth/register', async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) return res.status(400).json({ error: 'All fields required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, role`,
      [email.toLowerCase().trim(), hash, full_name.trim()]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists.' });
    next(err);
  }
});

// ── Profile ──────────────────────────────────────────────────
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, email, full_name, role, organization_id, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const { full_name, current_password, new_password } = req.body;
    if (full_name) {
      await query('UPDATE users SET full_name = $1 WHERE id = $2', [full_name.trim(), req.user.id]);
    }
    if (current_password && new_password) {
      if (new_password.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
      const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
      const valid = await bcrypt.compare(current_password, rows[0].password_hash);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });
      const hash = await bcrypt.hash(new_password, 12);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    }
    const { rows } = await query('SELECT id, email, full_name, role FROM users WHERE id = $1', [req.user.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── Admin: Analytics ─────────────────────────────────────────
router.get('/admin/analytics', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const [
      totalUsers, totalCourses, totalEnrollments, completedEnrollments,
      recentEnrollments, topCourses, userGrowth, enrollmentTrend
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM courses WHERE is_published = true'),
      query('SELECT COUNT(*) FROM enrollments'),
      query("SELECT COUNT(*) FROM enrollments WHERE status = 'Completed'"),
      query(`SELECT e.enrolled_at, u.full_name, c.title
             FROM enrollments e
             JOIN users u ON e.user_id = u.id
             JOIN courses c ON e.course_id = c.id
             ORDER BY e.enrolled_at DESC LIMIT 8`),
      query(`SELECT c.title, COUNT(e.id) as count
             FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id
             WHERE c.is_published = true
             GROUP BY c.id, c.title ORDER BY count DESC LIMIT 6`),
      query(`SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
                    COUNT(*) as count
             FROM users
             WHERE created_at >= NOW() - INTERVAL '6 months'
             GROUP BY DATE_TRUNC('month', created_at)
             ORDER BY DATE_TRUNC('month', created_at)`),
      query(`SELECT TO_CHAR(DATE_TRUNC('month', enrolled_at), 'Mon') as month,
                    COUNT(*) as count
             FROM enrollments
             WHERE enrolled_at >= NOW() - INTERVAL '6 months'
             GROUP BY DATE_TRUNC('month', enrolled_at)
             ORDER BY DATE_TRUNC('month', enrolled_at)`),
    ]);

    const total = parseInt(totalEnrollments.rows[0].count);
    const completed = parseInt(completedEnrollments.rows[0].count);

    res.json({
      stats: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalCourses: parseInt(totalCourses.rows[0].count),
        totalEnrollments: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      recentEnrollments: recentEnrollments.rows,
      topCourses: topCourses.rows,
      userGrowth: userGrowth.rows,
      enrollmentTrend: enrollmentTrend.rows,
    });
  } catch (err) { next(err); }
});

// ── Admin: Users ─────────────────────────────────────────────
router.get('/admin/users', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.email, u.full_name, u.role, u.created_at,
              COUNT(e.id) as enrollment_count
       FROM users u
       LEFT JOIN enrollments e ON u.id = e.user_id
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch('/admin/users/:id/role', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['FieldStaff', 'NGOAdmin', 'Coordinator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    if (parseInt(id) === req.user.id) return res.status(400).json({ error: 'Cannot change your own role.' });
    const { rows } = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role',
      [role, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/admin/users/:id', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account.' });
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted.' });
  } catch (err) { next(err); }
});

// ── Admin: Courses ───────────────────────────────────────────
router.post('/admin/courses', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const { title, description, estimated_hours, category } = req.body;
    if (!title || !description || !estimated_hours) return res.status(400).json({ error: 'All fields required.' });
    const { rows } = await query(
      `INSERT INTO courses (title, description, estimated_hours, category, created_by, organization_id, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
      [title.trim(), description.trim(), parseFloat(estimated_hours), category || 'General', req.user.id, req.user.org]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.patch('/admin/courses/:id', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, estimated_hours, is_published, category } = req.body;
    const { rows } = await query(
      `UPDATE courses SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         estimated_hours = COALESCE($3, estimated_hours),
         category = COALESCE($4, category),
         is_published = COALESCE($5, is_published)
       WHERE id = $6 RETURNING *`,
      [title, description, estimated_hours, category, is_published, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Course not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/admin/courses/:id', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    await query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    res.json({ message: 'Course deleted.' });
  } catch (err) { next(err); }
});

// ── Learner: Courses ─────────────────────────────────────────
router.get('/courses', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, title, description, estimated_hours, category, created_at
       FROM courses WHERE is_published = true ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── Learner: Enrollments ─────────────────────────────────────
router.get('/enrollments', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT e.id as enrollment_id, e.course_id, e.progress_percentage, e.status, e.enrolled_at,
              c.title, c.description, c.estimated_hours, c.category
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1 ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/enrollments', authenticate, async (req, res, next) => {
  try {
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id required.' });
    const { rows } = await query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, course_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Already enrolled.' });
    next(err);
  }
});

router.patch('/enrollments/:id/progress', authenticate, async (req, res, next) => {
  try {
    const pct = Math.min(100, Math.max(0, parseInt(req.body.progress_percentage || 0)));
    const status = pct >= 100 ? 'Completed' : 'In Progress';
    const { rows } = await query(
      `UPDATE enrollments SET progress_percentage=$1, status=$2
       WHERE id=$3 AND user_id=$4 RETURNING *`,
      [pct, status, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Enrollment not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;
