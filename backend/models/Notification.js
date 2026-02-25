const { readFile, writeFile, generateId } = require('../utils/fileStorage');

class Notification {
  constructor(data) {
    this.id = data.id || generateId();
    this.userId = data.userId;
    this.type = data.type;
    this.questionId = data.questionId;
    this.answerId = data.answerId;
    this.message = data.message;
    this.isRead = data.isRead || false;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static getAll() {
    return readFile('notifications.json');
  }

  static getByUserId(userId) {
    const notifications = this.getAll();
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  static create(data) {
    const notifications = this.getAll();
    const notification = new Notification(data);
    notifications.push(notification);
    writeFile('notifications.json', notifications);
    return notification;
  }

  static markAsRead(id) {
    const notifications = this.getAll();
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      writeFile('notifications.json', notifications);
      return notification;
    }
    return null;
  }
}

module.exports = Notification;