const { ViolationService } = require('../models/Violation');
const { broadcastViolation, broadcastStatusUpdate } = require('../sockets/socketHandler');

// In-Memory Debounce Cache: Maps `cameraId:workerTrackId:violationType` -> timestamp
const debounceMap = new Map();
const DEBOUNCE_WINDOW_MS = 5000; // 5-second suppression for identical worker & violation

exports.createViolation = async (req, res) => {
  try {
    const { cameraId, zoneName, violationType, workerTrackId, confidenceScore, snapshotUrl } = req.body;

    if (!cameraId || !violationType || workerTrackId === undefined) {
      return res.status(400).json({ error: 'Missing required violation fields.' });
    }

    // Debounce check
    const debounceKey = `${cameraId}:${workerTrackId}:${violationType}`;
    const now = Date.now();
    const lastReported = debounceMap.get(debounceKey);

    if (lastReported && (now - lastReported) < DEBOUNCE_WINDOW_MS) {
      return res.status(200).json({ 
        status: 'debounced', 
        message: 'Suppressed duplicate event within debounce window' 
      });
    }

    debounceMap.set(debounceKey, now);

    // Default snapshot placeholder if not provided
    const evidenceUrl = snapshotUrl || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';

    const saved = await ViolationService.create({
      cameraId,
      zoneName: zoneName || 'General Industrial Floor',
      violationType,
      workerTrackId: Number(workerTrackId),
      confidenceScore: confidenceScore !== undefined ? Number(confidenceScore) : 0.92,
      snapshotUrl: evidenceUrl,
      status: 'UNREVIEWED',
      timestamp: new Date()
    });

    // Real-time broadcast to UI clients via WebSocket
    broadcastViolation(saved);

    return res.status(201).json({
      success: true,
      message: 'Violation recorded and broadcasted in real-time',
      data: saved
    });
  } catch (error) {
    console.error('Error recording violation:', error);
    return res.status(500).json({ error: 'Internal server error processing violation webhook.' });
  }
};

exports.getViolations = async (req, res) => {
  try {
    const { cameraId, violationType, status } = req.query;
    const filter = {};
    if (cameraId) filter.cameraId = cameraId;
    if (violationType) filter.violationType = violationType;
    if (status) filter.status = status;

    const list = await ViolationService.find(filter);
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('Error fetching violations:', error);
    return res.status(500).json({ error: 'Failed to retrieve violation logs.' });
  }
};

exports.updateViolationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolvedBy } = req.body;

    const validStatuses = ['UNREVIEWED', 'ACKNOWLEDGED', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid violation status.' });
    }

    const updated = await ViolationService.findByIdAndUpdate(
      id, 
      { status, resolvedBy: resolvedBy || 'Safety Officer' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Violation record not found.' });
    }

    // Broadcast status change so all connected dashboards sync instantly
    broadcastStatusUpdate(updated);

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating violation status:', error);
    return res.status(500).json({ error: 'Failed to update violation status.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const allViolations = await ViolationService.find({});
    const total = allViolations.length;
    const unreviewed = allViolations.filter(v => v.status === 'UNREVIEWED').length;
    const acknowledged = allViolations.filter(v => v.status === 'ACKNOWLEDGED').length;
    const resolved = allViolations.filter(v => v.status === 'RESOLVED').length;

    // By violation type
    const byType = {
      NO_HELMET: allViolations.filter(v => v.violationType === 'NO_HELMET').length,
      NO_VEST: allViolations.filter(v => v.violationType === 'NO_VEST').length,
      ZONE_INTRUSION: allViolations.filter(v => v.violationType === 'ZONE_INTRUSION').length
    };

    // Calculate simulated site compliance % (typically 90% - 98% based on incidents vs total man-hours)
    const baseCompliance = Math.max(78, Math.min(99, 100 - (unreviewed * 3 + acknowledged * 1.5)));

    // Hourly distribution data for Recharts
    const hourlyData = [
      { time: '08:00', helmet: 1, vest: 2, zone: 0, compliance: 96 },
      { time: '10:00', helmet: 3, vest: 1, zone: 1, compliance: 92 },
      { time: '12:00', helmet: 0, vest: 1, zone: 0, compliance: 98 },
      { time: '14:00', helmet: 2, vest: 3, zone: 2, compliance: 89 },
      { time: '16:00', helmet: byType.NO_HELMET, vest: byType.NO_VEST, zone: byType.ZONE_INTRUSION, compliance: Math.round(baseCompliance) }
    ];

    return res.json({
      success: true,
      stats: {
        totalViolations: total,
        unreviewedCount: unreviewed,
        acknowledgedCount: acknowledged,
        resolvedCount: resolved,
        complianceRate: Math.round(baseCompliance * 10) / 10,
        byType,
        hourlyTrend: hourlyData
      }
    });
  } catch (error) {
    console.error('Error compiling analytics:', error);
    return res.status(500).json({ error: 'Failed to compile compliance analytics.' });
  }
};

exports.exportAuditLog = async (req, res) => {
  try {
    const list = await ViolationService.find({});
    const total = list.length;
    const resolved = list.filter(v => v.status === 'RESOLVED').length;
    const unreviewed = list.filter(v => v.status === 'UNREVIEWED').length;
    const acknowledged = list.filter(v => v.status === 'ACKNOWLEDGED').length;
    const complianceScore = Math.max(78, Math.min(99, 100 - (unreviewed * 3 + acknowledged * 1.5)));

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US');

    // Rich executive report metadata header formatted for Microsoft Excel & CSV parsers
    let csv = '\uFEFF'; // UTF-8 BOM for Microsoft Excel compatibility
    csv += '========================================================================================\n';
    csv += 'VIGILANTSITE ENTERPRISE - INDUSTRIAL WORKPLACE SAFETY COMPLIANCE AUDIT REPORT\n';
    csv += '========================================================================================\n';
    csv += `Audit Date:,"${dateStr} ${timeStr}"\n`;
    csv += 'Audit Standard:,"OSHA 1910.132 (PPE) & OSHA 1910.135 (Head Protection)"\n';
    csv += 'Facility:,"Apex Industrial Robotics & Manufacturing - Plant #4"\n';
    csv += 'Lead Inspecting Officer:,"Capt. Alex Vance (Chief Safety Compliance Officer)"\n';
    csv += `Overall Safety Compliance Score:,"${Math.round(complianceScore * 10) / 10}%"\n`;
    csv += `Total Incidents Recorded:,"${total}"\n`;
    csv += `Audit Summary:,"${resolved} Resolved / Closed, ${acknowledged} Acknowledged / Pending, ${unreviewed} Unreviewed"\n`;
    csv += '========================================================================================\n\n';

    // Column Headers
    csv += 'INCIDENT REF ID,TIMESTAMP (LOCAL),CAMERA NODE,MONITORED ZONE,VIOLATION TYPE,OSHA REGULATION,SEVERITY,WORKER TRACK ID,AI CONFIDENCE,STATUS,INSPECTING OFFICER / RESOLVED BY,SNAPSHOT EVIDENCE URL\n';

    // Incident records
    const rows = list.map(v => {
      let oshaCode = 'OSHA 1910 General Safety';
      let severity = 'CRITICAL';
      if (v.violationType === 'NO_HELMET') {
        oshaCode = 'OSHA 1910.135 (Head Protection Failure)';
        severity = 'CRITICAL';
      } else if (v.violationType === 'NO_VEST') {
        oshaCode = 'OSHA 1910.132 (High-Visibility PPE Failure)';
        severity = 'HIGH';
      } else if (v.violationType === 'ZONE_INTRUSION') {
        oshaCode = 'OSHA 1910.147 (Restricted Hazardous Perimeter Intrusion)';
        severity = 'CRITICAL';
      }

      const formattedDate = new Date(v.timestamp).toLocaleString('en-US');
      const conf = (v.confidenceScore ? (v.confidenceScore * 100).toFixed(1) : '95.0') + '%';
      const resolvedBy = v.resolvedBy || (v.status === 'RESOLVED' ? 'Capt. Alex Vance' : 'Awaiting Review');

      return `"${v._id}","${formattedDate}","${v.cameraId}","${v.zoneName}","${v.violationType}","${oshaCode}","${severity}","#${v.workerTrackId}","${conf}","${v.status}","${resolvedBy}","${v.snapshotUrl || 'N/A'}"`;
    }).join('\n');

    csv += rows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="VigilantSite_Safety_Audit_Report_${now.toISOString().slice(0, 10)}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting audit log:', error);
    return res.status(500).json({ error: 'Failed to generate audit export.' });
  }
};
