import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .populate('related_board_id', 'title')
      .sort({ created_at: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // If id is 'all', mark all as read
    if (id === 'all') {
      await Notification.updateMany({ user_id: req.user.id, read: false }, { read: true });
      return res.json({ message: 'All notifications marked as read' });
    }

    const notification = await Notification.findOne({ _id: id, user_id: req.user.id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error updating notification' });
  }
};

export default { getNotifications, markAsRead };
