import express from 'express';
import Shipment from '../models/Shipment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all shipment routes
router.use(protect);

// GET /api/shipments/stats/dashboard - Dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const filter = {};
    
    // If user role, only show their shipments stats
    if (req.user.role === 'user') {
      filter.createdBy = req.user._id;
    }

    const totalShipments = await Shipment.countDocuments(filter);
    const pendingShipments = await Shipment.countDocuments({ ...filter, status: 'Pending' });
    const acceptedShipments = await Shipment.countDocuments({ ...filter, status: 'Accepted' });
    const onTheWayShipments = await Shipment.countDocuments({ ...filter, status: 'On The Way' });
    const deliveredShipments = await Shipment.countDocuments({ ...filter, status: 'Delivered' });

    res.json({
      totalShipments,
      pending: pendingShipments,
      accepted: acceptedShipments,
      onTheWay: onTheWayShipments,
      delivered: deliveredShipments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/shipments - Create new order (users only)
router.post('/', authorize('user'), async (req, res) => {
  try {
    const trackingId = await Shipment.generateTrackingId();
    
    const { objectName, fromLocation, toLocation, distance } = req.body;

    if (!objectName || !fromLocation || !toLocation) {
      return res.status(400).json({ error: 'Please provide object name, pickup and delivery locations' });
    }

    const shipment = new Shipment({
      trackingId,
      createdBy: req.user._id,
      objectName,
      fromLocation,
      toLocation,
      distance: parseFloat(distance) || 0,
      status: 'Pending',
      statusHistory: [{
        status: 'Pending',
        timestamp: new Date(),
        note: 'Order placed by user',
      }],
    });

    await shipment.save();

    // Populate the createdBy field before emitting
    await shipment.populate('createdBy', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('shipment:created', shipment);
      // Notify operators about new order (Room-based)
      io.to('role:operator').emit('notification:operator', {
        type: 'new_order',
        message: `New order: ${shipment.objectName} (${shipment.trackingId})`,
        shipmentId: shipment._id,
        trackingId: shipment.trackingId
      });
    }

    res.status(201).json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shipments - List shipments (filtered by role)
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const query = {};
    
    // Users only see their own orders
    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    }
    // Operators see all orders

    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { objectName: { $regex: search, $options: 'i' } },
        { fromLocation: { $regex: search, $options: 'i' } },
        { toLocation: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedOperator', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      shipments,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shipments/:trackingId - Get single shipment by tracking ID
router.get('/:trackingId', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId })
      .populate('createdBy', 'name email')
      .populate('assignedOperator', 'name email');
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Users can only view their own shipments
    if (req.user.role === 'user' && shipment.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this shipment' });
    }

    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/shipments/:id/status - Update shipment status (operators only)
router.patch('/:id/status', authorize('operator'), async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const validStatuses = ['Accepted', 'On The Way', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Validate status transitions
    const transitions = {
      'Pending': ['Accepted', 'Cancelled'],
      'Accepted': ['On The Way', 'Cancelled'],
      'On The Way': ['Delivered'],
      'Delivered': [],
      'Cancelled': [],
    };

    if (!transitions[shipment.status]?.includes(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from '${shipment.status}' to '${status}'` 
      });
    }

    shipment.status = status;
    
    // Assign operator when accepting
    if (status === 'Accepted' && !shipment.assignedOperator) {
      shipment.assignedOperator = req.user._id;
    }

    shipment.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by operator`,
    });

    await shipment.save();
    await shipment.populate('createdBy', 'name email');
    await shipment.populate('assignedOperator', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('shipment:updated', shipment);
      io.emit(`shipment:${shipment.trackingId}`, shipment);
      
      // Specifically notify the user about status change
      const userRoom = `user:${shipment.createdBy._id.toString()}`;
      const statusMessage = status === 'Delivered' 
        ? `🎊 Great news! Your package ${shipment.trackingId} has been successfully delivered.`
        : `Your package ${shipment.trackingId} is now ${status}`;

      io.to(userRoom).emit('notification:user', {
        type: 'status_change',
        message: statusMessage,
        shipmentId: shipment._id,
        trackingId: shipment.trackingId
      });
    }

    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
