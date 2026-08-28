require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Email transporter (shared, created once) ─────────────
let mailer = null;
if (process.env.BUSINESS_EMAIL && process.env.BUSINESS_EMAIL_APP_PASSWORD) {
  mailer = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.BUSINESS_EMAIL,
      pass: process.env.BUSINESS_EMAIL_APP_PASSWORD,
    },
  });
  mailer.verify((err) => {
    if (err) console.error('❌ Email transporter error:', err.message);
    else console.log('✅ Email transporter ready');
  });
}

async function sendEmail({ to, subject, html }) {
  if (!mailer) return console.warn('Email skipped — BUSINESS_EMAIL not configured');
  try {
    await mailer.sendMail({
      from: `"ORANA" <${process.env.BUSINESS_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent:', subject);
  } catch (err) {
    console.error('❌ Email failed:', err.message);
  }
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Multer — memory storage, multiple files allowed
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(file.mimetype) || allowed.test(file.originalname.toLowerCase());
    cb(ok ? null : new Error('Images only (jpeg, png, webp)'), ok);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Upload one buffer to Cloudinary — returns { url, publicId }
function uploadToCloudinary(buffer, folder = 'orana/products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

// Upload all files in req.files — returns array of { url, publicId }
async function uploadMany(files) {
  return Promise.all(files.map((f) => uploadToCloudinary(f.buffer)));
}

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err.message));

// Guard middleware for DB-dependent routes
function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  next();
}

// Admin-only middleware — checks x-admin-secret header
function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_SECRET || 'orana_admin';
  if (req.headers['x-admin-secret'] !== secret) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  next();
}

// Product schema & model
const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    slug:          { type: String, trim: true, default: '' },
    nameAr:        { type: String, trim: true, default: '' },
    description:   { type: String, trim: true, default: '' },
    descriptionAr: { type: String, trim: true, default: '' },
    washCare:      { type: String, trim: true, default: '' },
    washCareAr:    { type: String, trim: true, default: '' },
    price:         { type: Number, required: true, min: 0 },
    currency:    { type: String, default: 'Dhs.' },
    images:      [{ url: String, publicId: String }],
    showOnHomepage: { type: Boolean, default: false },
    stock:         { type: Number, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);
productSchema.virtual('inStock').get(function () {
  return this.stock === null || this.stock > 0;
});
const Product = mongoose.model('Product', productSchema);

// ContactMessage schema & model
const contactMessageSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    contactNo: { type: String, trim: true, default: '' },
    email:     { type: String, required: true, trim: true },
    message:   { type: String, required: true, trim: true },
    read:      { type: Boolean, default: false },
  },
  { timestamps: true }
);
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// ── User model ──────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    firstName:    { type: String, required: true, trim: true },
    lastName:     { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:        { type: String, trim: true, default: '' },
    password:     { type: String, required: true },
    tokenVersion: { type: Number, default: 0 },
    cart:         { type: Array, default: [] },
    wishlist:     { type: Array, default: [] },
  },
  { timestamps: true }
);
const User = mongoose.model('User', userSchema);

// ── Auth routes ──────────────────────────────────────────

// POST /api/auth/signup
app.post('/api/auth/signup', requireDb, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, phone, password: hashed });

    // Non-blocking welcome email
    sendEmail({
      to: email,
      subject: 'Welcome to ORANA',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
          <div style="background:#A74419;padding:24px 32px;">
            <h1 style="color:#fff;font-size:20px;margin:0;letter-spacing:2px;">ORANA</h1>
          </div>
          <div style="padding:32px;">
            <p style="font-size:14px;margin:0 0 8px;">Hi ${firstName},</p>
            <p style="font-size:13px;color:#555;margin:0 0 24px;">Welcome to ORANA! Your account has been created successfully.</p>
            <p style="font-size:13px;color:#555;margin:0 0 24px;">Explore our latest collection and discover your perfect piece.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" style="display:inline-block;background:#A74419;color:#fff;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:12px 28px;text-decoration:none;">Shop Now</a>
          </div>
          <div style="background:#fdf6f3;padding:16px 32px;text-align:center;">
            <p style="font-size:10px;color:#aaa;margin:0;">ORANA — UAE</p>
          </div>
        </div>`,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, tokenVersion: 0 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', requireDb, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Auth middleware ──────────────────────────────────────
async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('tokenVersion');
    if (!user) return res.status(401).json({ error: 'User not found' });
    if ((decoded.tokenVersion ?? 0) !== user.tokenVersion) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// GET /api/auth/me
app.get('/api/auth/me', requireDb, requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -tokenVersion');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/auth/profile — update name / email
app.put('/api/auth/profile', requireDb, requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (email && email !== user.email) {
      const exists = await User.findOne({ email, _id: { $ne: req.userId } });
      if (exists) return res.status(409).json({ error: 'Email already in use' });
      user.email = email;
    }
    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName  = lastName;
    if (phone !== undefined) user.phone = phone;
    await user.save();
    res.json({ id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/auth/password — change password
app.put('/api/auth/password', requireDb, requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both fields are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/logout-all — invalidate all tokens
app.post('/api/auth/logout-all', requireDb, requireAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $inc: { tokenVersion: 1 } });
    res.json({ message: 'Logged out from all devices' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Forgot password (OTP) ────────────────────────────────
const otpStore = new Map(); // email -> { otp, expiresAt }

// POST /api/auth/forgot-password — send OTP
app.post('/api/auth/forgot-password', requireDb, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    await sendEmail({
      to: email,
      subject: 'ORANA — Password Reset OTP',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
          <div style="background:#A74419;padding:24px 32px;">
            <h1 style="color:#fff;font-size:20px;margin:0;letter-spacing:2px;">ORANA</h1>
          </div>
          <div style="padding:32px;">
            <p style="font-size:14px;margin:0 0 8px;">Hi ${user.firstName},</p>
            <p style="font-size:13px;color:#555;margin:0 0 24px;">Use the OTP below to reset your password. It expires in 10 minutes.</p>
            <div style="background:#fdf6f3;border:1px solid #f0ddd5;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#A74419;">${otp}</span>
            </div>
            <p style="font-size:11px;color:#aaa;margin:0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>`,
    });
    res.json({ message: 'OTP sent to your email' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/verify-otp — check OTP validity
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== String(otp)) return res.status(400).json({ error: 'Invalid OTP' });
  res.json({ message: 'OTP verified' });
});

// POST /api/auth/reset-password — set new password after OTP verified
app.post('/api/auth/reset-password', requireDb, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const record = otpStore.get(email.toLowerCase());
    if (!record) return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== String(otp)) return res.status(400).json({ error: 'Invalid OTP' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = await bcrypt.hash(newPassword, 10);
    user.tokenVersion += 1;
    await user.save();
    otpStore.delete(email.toLowerCase());
    res.json({ message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Cart & Wishlist sync ─────────────────────────────────

app.get('/api/cart', requireDb, requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('cart');
  res.json({ cart: user?.cart ?? [] });
});

app.put('/api/cart', requireDb, requireAuth, async (req, res) => {
  const { items } = req.body;
  await User.findByIdAndUpdate(req.userId, { cart: items ?? [] });
  res.json({ ok: true });
});

app.get('/api/wishlist', requireDb, requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('wishlist');
  res.json({ wishlist: user?.wishlist ?? [] });
});

app.put('/api/wishlist', requireDb, requireAuth, async (req, res) => {
  const { items } = req.body;
  await User.findByIdAndUpdate(req.userId, { wishlist: items ?? [] });
  res.json({ ok: true });
});

// ── Routes ──────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── Slug helpers ─────────────────────────────────────────
function slugify(str) {
  return String(str || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(name, excludeId = null) {
  let base = slugify(name) || 'product';
  let slug = base;
  let n = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Product.findOne(query);
    if (!exists) return slug;
    slug = `${base}-${n++}`;
  }
}

// GET all products (optionally filter homepage)
app.get('/api/products', requireDb, async (req, res) => {
  try {
    const filter = req.query.homepage === 'true' ? { showOnHomepage: true } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    // Auto-generate slugs for any products that don't have one yet
    const missing = products.filter((p) => !p.slug);
    if (missing.length > 0) {
      await Promise.all(missing.map(async (p) => {
        p.slug = await uniqueSlug(p.name, p._id);
        await p.save();
      }));
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET product by slug
app.get('/api/products/slug/:slug', requireDb, async (req, res) => {
  try {
    const { slug } = req.params;
    let product = await Product.findOne({ slug });
    // Fallback: allow old /product/:id URLs still work
    if (!product && /^[a-f0-9]{24}$/.test(slug)) {
      product = await Product.findById(slug);
    }
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product by id
app.get('/api/products/:id', requireDb, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product — accepts multiple images
app.post('/api/products', requireDb, requireAdmin, upload.array('images', 20), async (req, res) => {
  try {
    const { name, nameAr, description, descriptionAr, washCare, washCareAr, price, showOnHomepage, stock } = req.body;

    const images = req.files?.length
      ? await uploadMany(req.files)
      : [];

    const product = await Product.create({
      name,
      slug:          await uniqueSlug(name),
      nameAr:        nameAr        || '',
      description:   description   || '',
      descriptionAr: descriptionAr || '',
      washCare:      washCare      || '',
      washCareAr:    washCareAr    || '',
      price: parseFloat(price),
      currency: 'Dhs.',
      images,
      showOnHomepage: showOnHomepage === 'true' || showOnHomepage === true,
      stock: (stock !== undefined && stock !== '' && stock !== null) ? parseInt(stock, 10) : null,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update product — appends new images, keeps existing ones
app.put('/api/products/:id', requireDb, requireAdmin, upload.array('images', 20), async (req, res) => {
  try {
    const updates = {};
    const { name, nameAr, description, descriptionAr, washCare, washCareAr, price, showOnHomepage, removeImageIds, stock } = req.body;

    if (name          !== undefined) {
      updates.name = name;
      updates.slug = await uniqueSlug(name, req.params.id);
    }
    if (nameAr        !== undefined) updates.nameAr        = nameAr;
    if (description   !== undefined) updates.description   = description;
    if (descriptionAr !== undefined) updates.descriptionAr = descriptionAr;
    if (washCare      !== undefined) updates.washCare      = washCare;
    if (washCareAr    !== undefined) updates.washCareAr    = washCareAr;
    if (price         !== undefined) updates.price         = parseFloat(price);
    if (showOnHomepage !== undefined) {
      updates.showOnHomepage = showOnHomepage === 'true' || showOnHomepage === true;
    }
    if (stock !== undefined) {
      updates.stock = (stock !== '' && stock !== null) ? parseInt(stock, 10) : null;
    }

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    // Remove specific images if requested
    let currentImages = existing.images || [];
    if (removeImageIds) {
      const toRemove = Array.isArray(removeImageIds) ? removeImageIds : [removeImageIds];
      for (const pid of toRemove) {
        await cloudinary.uploader.destroy(pid).catch(() => {});
      }
      currentImages = currentImages.filter((img) => !toRemove.includes(img.publicId));
    }

    // Upload and append new images
    if (req.files?.length) {
      const newImages = await uploadMany(req.files);
      currentImages = [...currentImages, ...newImages];
    }

    updates.images = currentImages;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE product — also removes all Cloudinary images
app.delete('/api/products/:id', requireDb, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    for (const img of product.images || []) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Order routes ────────────────────────────────────────

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: String,
        name:      String,
        price:     Number,
        quantity:  Number,
        image:     String,
      },
    ],
    customer: {
      firstName: String,
      lastName:  String,
      email:     String,
      phone:     String,
      address:   String,
      city:      String,
      country:   String,
    },
    userId:        { type: String, default: null },
    currency:      { type: String, default: 'AED' },
    currencyLabel: { type: String, default: 'Dhs. ' },
    paymentMethod: { type: String, enum: ['cod', 'card'], default: 'cod' },
    subtotal: Number,
    shipping: { type: Number, default: 0 },
    total:    Number,
    status:   { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);
const Order = mongoose.model('Order', orderSchema);

const COUNTRY_LABELS = { UAE: 'United Arab Emirates' };

// GET orders for logged-in user — must be registered BEFORE /api/orders/:id
app.get('/api/orders/mine', requireDb, requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create order
app.post('/api/orders', requireDb, async (req, res) => {
  try {
    const { items, customer, paymentMethod, subtotal, shipping, total, userId, currency } = req.body;
    if (!items?.length || !customer?.email) {
      return res.status(400).json({ error: 'items and customer are required' });
    }

    // Check stock for each item
    for (const item of items) {
      if (!item.productId) continue;
      const product = await Product.findById(item.productId).select('stock name');
      if (product && product.stock !== null && product.stock !== undefined) {
        if (product.stock === 0) {
          return res.status(400).json({ error: `"${product.name}" is out of stock` });
        }
        if (product.stock < (item.quantity || 1)) {
          return res.status(400).json({ error: `Only ${product.stock} unit(s) of "${product.name}" available` });
        }
      }
    }

    const order = await Order.create({ items, customer, paymentMethod, subtotal, shipping, total, userId: userId ?? null, currency: currency ?? 'AED' });

    // Decrement stock for each item
    for (const item of items) {
      if (!item.productId) continue;
      await Product.updateOne(
        { _id: item.productId, stock: { $ne: null } },
        { $inc: { stock: -(item.quantity || 1) } }
      );
    }

    // Send order notification email — non-blocking
    const AED_TO_USD = 1 / 3.6725;
    const savedCurrency = currency ?? 'AED';
    const fmtEmail = (aed) => savedCurrency === 'USD'
      ? `$ ${(aed * AED_TO_USD).toFixed(2)}`
      : `Dhs. ${aed}`;
    const itemsRows = items.map(i =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f5ede8;">${i.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f5ede8;text-align:center;">× ${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f5ede8;text-align:right;">${fmtEmail(i.price * i.quantity)}</td>
      </tr>`
    ).join('');

    const countryLabel = COUNTRY_LABELS[customer.country] || customer.country;
    const paymentLabel = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card';

    sendEmail({
      to: process.env.BUSINESS_EMAIL,
      subject: `New Order — ${customer.firstName} ${customer.lastName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#000;">
          <div style="background:#A74419;padding:24px 32px;">
            <h1 style="color:#fff;font-size:20px;margin:0;letter-spacing:2px;">ORANA</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:6px 0 0;">New Order Received</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:13px;color:#555;margin:0 0 24px;">A new order has been placed. Details below.</p>
            <p style="font-size:10px;color:#888;margin:0 0 24px;">Order ID: <strong style="color:#A74419;">${order._id}</strong></p>

            <h2 style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A74419;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #A74419;">Items Ordered</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
              <thead>
                <tr style="background:#fdf6f3;">
                  <th style="padding:8px 12px;text-align:left;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#888;">Product</th>
                  <th style="padding:8px 12px;text-align:center;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#888;">Qty</th>
                  <th style="padding:8px 12px;text-align:right;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#888;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsRows}</tbody>
            </table>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:6px 12px;font-size:11px;color:#888;">Subtotal</td>
                <td style="padding:6px 12px;font-size:11px;color:#888;text-align:right;">${fmtEmail(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 12px;font-size:11px;color:#888;">Shipping</td>
                <td style="padding:6px 12px;font-size:11px;color:#888;text-align:right;">${shipping === 0 ? 'Free' : fmtEmail(shipping)}</td>
              </tr>
              <tr style="border-top:1px solid #f0ddd5;">
                <td style="padding:10px 12px;font-size:13px;font-weight:700;">Total</td>
                <td style="padding:10px 12px;font-size:13px;font-weight:700;text-align:right;">${fmtEmail(total)}</td>
              </tr>
            </table>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="width:50%;vertical-align:top;padding-right:16px;">
                  <h2 style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A74419;margin:0 0 10px;padding-bottom:8px;border-bottom:2px solid #A74419;">Contact</h2>
                  <p style="margin:0 0 4px;font-size:11px;">${customer.firstName} ${customer.lastName}</p>
                  <p style="margin:0 0 4px;font-size:11px;"><a href="mailto:${customer.email}" style="color:#A74419;">${customer.email}</a></p>
                  <p style="margin:0;font-size:11px;">${customer.phone}</p>
                </td>
                <td style="width:50%;vertical-align:top;padding-left:16px;">
                  <h2 style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A74419;margin:0 0 10px;padding-bottom:8px;border-bottom:2px solid #A74419;">Delivery Address</h2>
                  <p style="margin:0 0 4px;font-size:11px;">${customer.address}</p>
                  <p style="margin:0 0 4px;font-size:11px;">${customer.city}</p>
                  <p style="margin:0;font-size:11px;">${countryLabel}</p>
                </td>
              </tr>
            </table>

            <h2 style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A74419;margin:0 0 10px;padding-bottom:8px;border-bottom:2px solid #A74419;">Payment</h2>
            <p style="font-size:11px;margin:0 0 32px;">${paymentLabel}</p>

            <a href="${process.env.FRONTEND_URL}/orana/admin-panel" style="display:inline-block;background:#A74419;color:#fff;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:12px 28px;text-decoration:none;">
              View in Admin Panel
            </a>
          </div>
          <div style="background:#fdf6f3;padding:16px 32px;text-align:center;">
            <p style="font-size:10px;color:#aaa;margin:0;">ORANA — UAE</p>
          </div>
        </div>
      `,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all orders — admin
app.get('/api/orders', requireDb, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order
app.get('/api/orders/:id', requireDb, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update order status
app.patch('/api/orders/:id/status', requireDb, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Shipping settings ────────────────────────────────────
const shippingSchema = new mongoose.Schema({ price: { type: Number, default: 0 } }, { timestamps: true });
const ShippingSettings = mongoose.model('ShippingSettings', shippingSchema);

app.get('/api/shipping', requireDb, async (req, res) => {
  try {
    let s = await ShippingSettings.findOne();
    if (!s) s = await ShippingSettings.create({ price: 0 });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/shipping', requireDb, requireAdmin, async (req, res) => {
  try {
    const price = Number(req.body.price);
    if (isNaN(price) || price < 0) return res.status(400).json({ error: 'Invalid price' });
    const s = await ShippingSettings.findOneAndUpdate({}, { price }, { upsert: true, new: true });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Contact routes ───────────────────────────────────────

// POST submit contact form — saves to DB and emails business
app.post('/api/contact', requireDb, async (req, res) => {
  try {
    const { firstName, lastName, contactNo, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'firstName, lastName, email and message are required' });
    }

    const msg = await ContactMessage.create({ firstName, lastName, contactNo, email, message });

    // Send email notification — non-blocking
    sendEmail({
      to: process.env.BUSINESS_EMAIL,
      subject: `New Contact Message — ${firstName} ${lastName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#A74419;padding:24px 32px;">
            <h1 style="color:#fff;font-size:20px;margin:0;letter-spacing:2px;">ORANA</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:6px 0 0;">New Contact Us Message</p>
          </div>
          <div style="padding:32px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:8px 0;font-weight:600;width:130px;font-size:12px;">Name</td><td style="padding:8px 0;font-size:12px;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;font-size:12px;">Email</td><td style="padding:8px 0;font-size:12px;"><a href="mailto:${email}" style="color:#A74419;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;font-weight:600;font-size:12px;">Contact No.</td><td style="padding:8px 0;font-size:12px;">${contactNo || '—'}</td></tr>
            </table>
            <h2 style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A74419;margin:0 0 10px;">Message</h2>
            <p style="background:#fdf6f3;padding:16px;line-height:1.6;font-size:12px;margin:0 0 24px;">${message}</p>
            <a href="${process.env.FRONTEND_URL}/orana/admin-panel/messages" style="display:inline-block;background:#A74419;color:#fff;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:12px 28px;text-decoration:none;">
              View in Admin Panel
            </a>
          </div>
        </div>
      `,
    });

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all contact messages — for admin dashboard
app.get('/api/contact', requireDb, requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark message as read
app.patch('/api/contact/:id/read', requireDb, requireAdmin, async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Newsletter subscribers ────────────────────────────────
const subscriberSchema = new mongoose.Schema(
  { email: { type: String, required: true, unique: true, lowercase: true, trim: true } },
  { timestamps: true }
);
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// POST /api/newsletter/subscribe
app.post('/api/newsletter/subscribe', requireDb, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const exists = await Subscriber.findOne({ email: email.toLowerCase() });
    if (exists) return res.json({ message: 'Already subscribed' });
    await Subscriber.create({ email });
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/subscribers
app.get('/api/admin/subscribers', requireDb, requireAdmin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).select('email createdAt');
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', requireDb, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('firstName lastName email phone createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Homepage CMS ─────────────────────────────────────────────────────────────
const homepageCMSSchema = new mongoose.Schema(
  { elements: { type: mongoose.Schema.Types.Mixed, default: {} } },
  { timestamps: true }
);
const HomepageCMS = mongoose.model('HomepageCMS', homepageCMSSchema);

app.get('/api/homepage-cms', requireDb, async (req, res) => {
  try {
    const doc = await HomepageCMS.findOne();
    res.json(doc ? doc.elements : {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/homepage-cms', requireDb, requireAdmin, async (req, res) => {
  try {
    const { elements } = req.body;
    const doc = await HomepageCMS.findOneAndUpdate(
      {},
      { $set: { elements } },
      { new: true, upsert: true }
    );
    res.json(doc.elements);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/homepage-cms/image', requireDb, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, 'orana/homepage');
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Generic page CMS ─────────────────────────────────────────────────────────
const pageCMSSchema = new mongoose.Schema(
  { page: { type: String, unique: true, required: true }, elements: { type: mongoose.Schema.Types.Mixed, default: {} } },
  { timestamps: true }
);
const PageCMS = mongoose.model('PageCMS', pageCMSSchema);

app.get('/api/cms/:page', requireDb, async (req, res) => {
  try {
    const doc = await PageCMS.findOne({ page: req.params.page });
    res.json(doc ? doc.elements : {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/cms/:page', requireDb, requireAdmin, async (req, res) => {
  try {
    const { elements } = req.body;
    const doc = await PageCMS.findOneAndUpdate(
      { page: req.params.page },
      { $set: { elements } },
      { new: true, upsert: true }
    );
    res.json(doc.elements);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cms/:page/image', requireDb, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, `orana/cms/${req.params.page}`);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
