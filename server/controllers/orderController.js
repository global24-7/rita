const Order = require('../models/Order');

// @desc    Create a new order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, phone, deliveryLocation, deliveryAddress, items, referralCode } = req.body;

    const order = new Order({
      customerName,
      phone,
      deliveryLocation,
      deliveryAddress,
      items,
      referralCode: referralCode || null,
      customer: req.customer ? req.customer._id : null,
    });

    await order.save();

    // Generate WhatsApp message
    const itemList = order.items
      .map((item) => `• ${item.name} (Size: ${item.size}) x${item.qty} — GH₵${item.priceAtOrder * item.qty}`)
      .join('\n');

    const whatsappMessage = encodeURIComponent(
      `🛒 *New Order from Rita Jeans Website*\n\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Phone:* ${order.phone}\n` +
      `*Delivery:* ${order.deliveryLocation}${order.deliveryAddress ? ' — ' + order.deliveryAddress : ''}\n\n` +
      `*Items:*\n${itemList}\n\n` +
      `*Subtotal:* GH₵${order.subtotal}\n` +
      `*Delivery Fee:* GH₵${order.deliveryFee}\n` +
      `*Total:* GH₵${order.total}\n\n` +
      `Order ID: ${order._id}`
    );

    const whatsappLink = `https://wa.me/233${order.phone || '592117747'}?text=${whatsappMessage}`;

    res.status(201).json({
      order,
      whatsappLink,
      message: 'Order placed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      orders,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ order, message: `Order status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order analytics (admin)
// @route   GET /api/orders/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    // Revenue from delivered + confirmed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'delivered'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Best-selling products
    const bestSellers = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'delivered'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.priceAtOrder', '$items.qty'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Referral stats
    const referralOrders = await Order.countDocuments({ referralCode: { $ne: null } });

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      totalRevenue,
      bestSellers,
      referralOrders,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in customer's orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments({ customer: req.customer._id });
    const orders = await Order.find({ customer: req.customer._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      orders,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};
