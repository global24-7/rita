const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Admin login
// @route   POST /api/admin/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
exports.getMe = async (req, res, next) => {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, role, created_at')
      .eq('id', req.admin.id)
      .single();

    if (error || !admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.admin.id)
      .single();

    if (error || !admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const { error: updateError } = await supabase
      .from('admins')
      .update({ password: hashedPassword })
      .eq('id', admin.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
