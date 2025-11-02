# Smart Delivery Box Admin Panel

A modern web-based administration panel for managing smart delivery lockers, built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### 📱 PIN Management
- Generate secure 4-digit PINs for deliveries
- Automatic PIN delivery via SMS to customers
- Real-time PIN synchronization with IoT lockers via ThingSpeak
- PIN history tracking and management
- Automatic 24-hour PIN expiration

### 🔒 Locker Management
- Real-time locker status monitoring
- Access control and permissions
- Occupancy tracking
- Maintenance status updates

### 📊 Activity Logs
- Comprehensive delivery tracking
- Usage statistics and analytics
- Audit trail for all system activities
- Filterable and searchable logs

### 🔔 Notifications
- Real-time system alerts
- Delivery status updates
- System maintenance notifications
- Custom notification settings

## 🔄 System Flow

1. **Order Selection**
   - Admin selects a pending delivery order
   - Enters customer's phone number

2. **PIN Generation & Distribution**
   - System generates a secure 4-digit PIN
   - PIN is sent to ThingSpeak IoT platform for locker
   - SMS notification sent to customer with PIN
   - PIN is stored in system with 24-hour expiry

3. **Locker Access**
   - Customer receives PIN via SMS
   - Uses PIN to access assigned locker
   - System tracks PIN usage and expiry

4. **Monitoring & Management**
   - Admins can view all active PINs
   - Track delivery status and locker usage
   - Reset PINs if needed
   - View comprehensive activity logs
