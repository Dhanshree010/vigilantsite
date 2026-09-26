const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'visionops_super_secret_jwt_key_2026';

// Standard Safety & Operations Personnel Accounts
const DEMO_ACCOUNTS = [
  {
    email: 'officer@vigilantsite.ai',
    password: 'admin',
    name: 'Capt. Alex Vance',
    role: 'SAFETY_OFFICER',
    roleTitle: 'Chief Safety Compliance Officer',
    badgeId: 'HSE-9041',
    department: 'Occupational Health & HSE Compliance',
    shift: 'General Safety Shift (08:00 - 16:00)',
    organization: 'VigilantSite Safety Network',
    avatar: '🛡️',
    description: 'Inspects work & dashboard • Exports official Excel/CSV audit reports • Full access',
    permissions: ['VIEW_FEEDS', 'INCIDENT_DESK', 'EXPORT_REPORT', 'COMPLIANCE_KPIS', 'MANAGE_ZONES', 'SIMULATOR']
  },
  {
    email: 'officer@visionops.ai',
    password: 'admin',
    name: 'Capt. Alex Vance',
    role: 'SAFETY_OFFICER',
    roleTitle: 'Chief Safety Compliance Officer',
    badgeId: 'HSE-9041',
    department: 'Occupational Health & HSE Compliance',
    shift: 'General Safety Shift (08:00 - 16:00)',
    organization: 'VigilantSite Safety Network',
    avatar: '🛡️',
    description: 'Inspects work & dashboard • Exports official Excel/CSV audit reports • Full access',
    permissions: ['VIEW_FEEDS', 'INCIDENT_DESK', 'EXPORT_REPORT', 'COMPLIANCE_KPIS', 'MANAGE_ZONES', 'SIMULATOR']
  },
  {
    email: 'controller@vigilantsite.ai',
    password: 'admin',
    name: 'Elena Rostova',
    role: 'CONTROLLER',
    roleTitle: 'CCTV Controller (Webcam & Dashboard Only)',
    badgeId: 'OPS-3312',
    department: 'Plant Surveillance & Control Room',
    shift: '24/7 Live Monitoring Console',
    organization: 'VigilantSite Safety Network',
    avatar: '📹',
    description: 'Monitors all webcams & camera feeds • Dedicated live dashboard access only',
    permissions: ['VIEW_FEEDS']
  },
  {
    email: 'controller@visionops.ai',
    password: 'admin',
    name: 'Elena Rostova',
    role: 'CONTROLLER',
    roleTitle: 'CCTV Controller (Webcam & Dashboard Only)',
    badgeId: 'OPS-3312',
    department: 'Plant Surveillance & Control Room',
    shift: '24/7 Live Monitoring Console',
    organization: 'VigilantSite Safety Network',
    avatar: '📹',
    description: 'Monitors all webcams & camera feeds • Dedicated live dashboard access only',
    permissions: ['VIEW_FEEDS']
  },
  {
    email: 'operator@visionops.ai',
    password: 'admin',
    name: 'Elena Rostova',
    role: 'CONTROLLER',
    roleTitle: 'CCTV Controller (Webcam & Dashboard Only)',
    badgeId: 'OPS-3312',
    department: 'Plant Surveillance & Control Room',
    shift: '24/7 Live Monitoring Console',
    organization: 'VigilantSite Safety Network',
    avatar: '📹',
    description: 'Monitors all webcams & camera feeds • Dedicated live dashboard access only',
    permissions: ['VIEW_FEEDS']
  }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if it matches one of the preset accounts
  const matchedPreset = DEMO_ACCOUNTS.find(
    acc => acc.email.toLowerCase() === normalizedEmail
  );

  let userProfile;

  if (matchedPreset) {
    // For demo simplicity, accept 'admin', preset password, or any non-empty password
    userProfile = {
      email: matchedPreset.email,
      name: matchedPreset.name,
      role: matchedPreset.role,
      roleTitle: matchedPreset.roleTitle,
      badgeId: matchedPreset.badgeId,
      department: matchedPreset.department,
      shift: matchedPreset.shift,
      organization: matchedPreset.organization,
      avatar: matchedPreset.avatar,
      permissions: matchedPreset.permissions
    };
  } else {
    // 2. Allow any custom officer/operator credential login
    const inferredName = email.split('@')[0].replace(/[._-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    userProfile = {
      email: normalizedEmail,
      name: inferredName || 'Field Safety Officer',
      role: 'SAFETY_OFFICER',
      roleTitle: 'Safety Officer & Live Inspector',
      badgeId: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
      department: 'Field Operations & HSE',
      shift: 'Active Monitoring Shift',
      organization: 'VisionOps Safety Network',
      avatar: '👷',
      permissions: ['VIEW_FEEDS', 'MANAGE_ZONES', 'ACKNOWLEDGE_ALERTS', 'RESOLVE_INCIDENTS']
    };
  }

  const token = jwt.sign(
    {
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role,
      badgeId: userProfile.badgeId
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  return res.json({
    success: true,
    token,
    user: userProfile
  });
});

// GET /api/auth/me (Verify active session)
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find matching profile or reconstruct
    const matched = DEMO_ACCOUNTS.find(a => a.email === decoded.email);
    const user = matched ? {
      email: matched.email,
      name: matched.name,
      role: matched.role,
      roleTitle: matched.roleTitle,
      badgeId: matched.badgeId,
      department: matched.department,
      shift: matched.shift,
      organization: matched.organization,
      avatar: matched.avatar,
      permissions: matched.permissions
    } : {
      email: decoded.email,
      name: decoded.name || 'Safety Officer',
      role: decoded.role || 'SAFETY_OFFICER',
      roleTitle: 'Field Safety Officer',
      badgeId: decoded.badgeId || 'OP-4021',
      department: 'HSE Compliance',
      shift: 'Active Shift',
      organization: 'VisionOps Safety Network',
      avatar: '👷',
      permissions: ['VIEW_FEEDS', 'MANAGE_ZONES', 'ACKNOWLEDGE_ALERTS', 'RESOLVE_INCIDENTS']
    };

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
});

// GET /api/auth/presets (For 1-click quick login buttons in demo / viva)
router.get('/presets', (req, res) => {
  res.json({
    success: true,
    presets: DEMO_ACCOUNTS.map(({ password, ...rest }) => rest)
  });
});

module.exports = router;
