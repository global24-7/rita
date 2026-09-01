const supabase = require('../config/supabase');

// @desc    Create a new order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, phone, deliveryLocation, deliveryAddress, items, referralCode } = req.body;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        phone,
        delivery_location: deliveryLocation,
        delivery_address: deliveryAddress || '',
        referral_code: referralCode || null,
        customer_id: req.customer ? req.customer.id : null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      qty: item.qty,
      size: item.size,
      price_at_order: item.priceAtOrder,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Get product images for each item
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const { data: product } = await supabase
          .from('products')
          .select('images')
          .eq('id', item.productId)
          .single();
        return {
          ...item,
          images: product?.images || [],
        };
      })
    );

    // Calculate totals (replaces Mongoose pre-save hook)
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.priceAtOrder * item.qty;
    });

    let deliveryFee = 0;
    if (deliveryLocation !== 'Ablekuma') {
      const { data: settings } = await supabase
        .from('settings')
        .select('delivery_fee')
        .limit(1)
        .single();
      deliveryFee = settings?.delivery_fee || 20;
    }

    const total = subtotal + deliveryFee;

    // Update order with totals
    await supabase
      .from('orders')
      .update({ subtotal, delivery_fee: deliveryFee, total })
      .eq('id', order.id);

    // Generate WhatsApp message with image links
    const itemList = itemsWithImages
      .map((item) => {
        const imgLink = item.images[0] ? `\n   📸 ${process.env.CLIENT_URL?.replace(/\/$/, '') || 'https://rita-jeans.netlify.app'}${item.images[0]}` : '';
        return `• ${item.name} (Size: ${item.size}) x${item.qty} — GH₵${item.priceAtOrder * item.qty}${imgLink}`;
      })
      .join('\n');

    const whatsappMessage = encodeURIComponent(
      `🛒 *New Order from Rita Jeans Website*\n\n` +
      `*Customer:* ${customerName}\n` +
      `*Phone:* ${phone}\n` +
      `*Delivery:* ${deliveryLocation}${deliveryAddress ? ' — ' + deliveryAddress : ''}\n\n` +
      `*Items:*\n${itemList}\n\n` +
      `*Subtotal:* GH₵${subtotal}\n` +
      `*Delivery Fee:* GH₵${deliveryFee}\n` +
      `*Total:* GH₵${total}\n\n` +
      `Order ID: ${order.id}`
    );

    const whatsappLink = `https://wa.me/233592117747?text=${whatsappMessage}`;

    // Transform order for response
    const transformedOrder = {
      _id: order.id,
      customerName: order.customer_name,
      phone: order.phone,
      deliveryLocation: order.delivery_location,
      deliveryAddress: order.delivery_address,
      items: items,
      deliveryFee,
      subtotal,
      total,
      status: order.status,
      referralCode: order.referral_code,
      customer: order.customer_id,
      createdAt: order.created_at,
    };

    res.status(201).json({
      order: transformedOrder,
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

    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data: orders, count, error } = await query;

    if (error) throw error;

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        return {
          _id: order.id,
          customerName: order.customer_name,
          phone: order.phone,
          deliveryLocation: order.delivery_location,
          deliveryAddress: order.delivery_address,
          items: (items || []).map(i => ({
            productId: i.product_id,
            name: i.name,
            qty: i.qty,
            size: i.size,
            priceAtOrder: i.price_at_order,
          })),
          deliveryFee: order.delivery_fee,
          subtotal: order.subtotal,
          total: order.total,
          status: order.status,
          referralCode: order.referral_code,
          customer: order.customer_id,
          createdAt: order.created_at,
        };
      })
    );

    res.json({
      orders: ordersWithItems,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    const transformed = {
      _id: order.id,
      customerName: order.customer_name,
      phone: order.phone,
      deliveryLocation: order.delivery_location,
      deliveryAddress: order.delivery_address,
      items: (items || []).map(i => ({
        productId: i.product_id,
        name: i.name,
        qty: i.qty,
        size: i.size,
        priceAtOrder: i.price_at_order,
      })),
      deliveryFee: order.delivery_fee,
      subtotal: order.subtotal,
      total: order.total,
      status: order.status,
      referralCode: order.referral_code,
      customer: order.customer_id,
      createdAt: order.created_at,
    };

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Recalculate totals (in case status affects delivery fee)
    let deliveryFee = order.delivery_fee;
    if (order.delivery_location !== 'Ablekuma') {
      const { data: settings } = await supabase
        .from('settings')
        .select('delivery_fee')
        .limit(1)
        .single();
      deliveryFee = settings?.delivery_fee || 20;
    }

    await supabase
      .from('orders')
      .update({ delivery_fee: deliveryFee, total: order.subtotal + deliveryFee })
      .eq('id', order.id);

    res.json({
      order: {
        _id: order.id,
        customerName: order.customer_name,
        phone: order.phone,
        deliveryLocation: order.delivery_location,
        deliveryAddress: order.delivery_address,
        subtotal: order.subtotal,
        deliveryFee,
        total: order.subtotal + deliveryFee,
        status: order.status,
        createdAt: order.created_at,
      },
      message: `Order status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order analytics (admin)
// @route   GET /api/orders/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Confirmed orders
    const { count: confirmedOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    // Delivered orders
    const { count: deliveredOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered');

    // Revenue from delivered + confirmed orders
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['confirmed', 'delivered']);

    const totalRevenue = revenueData
      ? revenueData.reduce((sum, o) => sum + Number(o.total), 0)
      : 0;

    // Best-selling products
    const { data: bestSellersData } = await supabase
      .from('order_items')
      .select('product_id, name, qty, price_at_order, orders!inner(status)')
      .in('orders.status', ['confirmed', 'delivered']);

    // Aggregate best sellers in JS
    const bestSellersMap = {};
    if (bestSellersData) {
      bestSellersData.forEach(item => {
        if (!bestSellersMap[item.product_id]) {
          bestSellersMap[item.product_id] = {
            _id: item.product_id,
            name: item.name,
            totalSold: 0,
            totalRevenue: 0,
          };
        }
        bestSellersMap[item.product_id].totalSold += item.qty;
        bestSellersMap[item.product_id].totalRevenue += item.price_at_order * item.qty;
      });
    }

    const bestSellers = Object.values(bestSellersMap)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // Referral stats
    const { count: referralOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .not('referral_code', 'is', null);

    // Recent orders
    const { data: recentOrdersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const recentOrders = (recentOrdersData || []).map(o => ({
      _id: o.id,
      customerName: o.customer_name,
      phone: o.phone,
      deliveryLocation: o.delivery_location,
      total: o.total,
      status: o.status,
      createdAt: o.created_at,
    }));

    res.json({
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      confirmedOrders: confirmedOrders || 0,
      deliveredOrders: deliveredOrders || 0,
      totalRevenue,
      bestSellers,
      referralOrders: referralOrders || 0,
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

    let query = supabase.from('orders')
      .select('*', { count: 'exact' })
      .eq('customer_id', req.customer.id)
      .order('created_at', { ascending: false });

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data: orders, count, error } = await query;

    if (error) throw error;

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        return {
          _id: order.id,
          customerName: order.customer_name,
          phone: order.phone,
          deliveryLocation: order.delivery_location,
          deliveryAddress: order.delivery_address,
          items: (items || []).map(i => ({
            productId: i.product_id,
            name: i.name,
            qty: i.qty,
            size: i.size,
            priceAtOrder: i.price_at_order,
          })),
          deliveryFee: order.delivery_fee,
          subtotal: order.subtotal,
          total: order.total,
          status: order.status,
          createdAt: order.created_at,
        };
      })
    );

    res.json({
      orders: ordersWithItems,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};
