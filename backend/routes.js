import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

// ==========================================
// MIDDLEWARE
// ==========================================
const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'NGOAdmin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  next();
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, rows[0].password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: rows[0].id, role: rows[0].role, org: rows[0].organization_id },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: rows[0].id, name: rows[0].full_name, role: rows[0].role } });
  } catch (err) { next(err); }
});

router.post('/auth/register', async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, role`,
      [email.toLowerCase().trim(), hash, full_name.trim()]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'An account with that email already exists.' });
    next(err);
  }
});

// ==========================================
// ADMIN ROUTES (NGOAdmin Only)
// ==========================================
router.post('/admin/courses', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const { title, description, estimated_hours } = req.body;
    if (!title || !description || !estimated_hours) {
      return res.status(400).json({ error: 'Title, description, and estimated hours are required.' });
    }
    const { rows } = await query(
      `INSERT INTO courses (title, description, estimated_hours, created_by, organization_id, is_published)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [title.trim(), description.trim(), parseFloat(estimated_hours), req.user.id, req.user.org]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.get('/admin/stats', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const [usersCount, coursesCount, enrollmentsCount] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM courses WHERE is_published = true'),
      query('SELECT COUNT(*) FROM enrollments'),
    ]);
    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalCourses: parseInt(coursesCount.rows[0].count),
      totalEnrollments: parseInt(enrollmentsCount.rows[0].count),
    });
  } catch (err) { next(err); }
});

router.delete('/admin/courses/:id', [authenticate, requireAdmin], async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ message: 'Course deleted successfully.' });
  } catch (err) { next(err); }
});

// ==========================================
// LEARNER ROUTES
// ==========================================
router.get('/courses', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, title, description, estimated_hours, created_at FROM courses WHERE is_published = true ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/enrollments', authenticate, async (req, res, next) => {
  try {
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id is required.' });
    const { rows } = await query(
      `INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *`,
      [req.user.id, course_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Already enrolled in this course.' });
    next(err);
  }
});

router.get('/enrollments', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT e.id as enrollment_id, e.course_id, e.progress_percentage, e.status,
              c.title, c.description, c.estimated_hours
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch('/enrollments/:id/progress', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progress_percentage } = req.body;
    if (progress_percentage === undefined) {
      return res.status(400).json({ error: 'progress_percentage is required.' });
    }
    const pct = Math.min(100, Math.max(0, parseInt(progress_percentage)));
    const status = pct >= 100 ? 'Completed' : 'In Progress';
    const { rows } = await query(
      `UPDATE enrollments SET progress_percentage = $1, status = $2
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [pct, status, id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Enrollment not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;
