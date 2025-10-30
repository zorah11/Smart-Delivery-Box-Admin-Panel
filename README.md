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

## How to use this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/70587f4f-ed3e-493a-a5e9-817bf7edcde1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Technologies Used

- **Frontend Framework**: React + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **IoT Integration**: ThingSpeak API
- **SMS Gateway**: BulkSMS API
- **Hosting**: GitHub Pages

## 🚀 Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the main branch.

1. Build the project:
   ```bash
   npm run build
   ```

2. Preview production build locally:
   ```bash
   npm run preview
   ```

3. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

4. GitHub Actions will automatically deploy to Pages.

## 🔐 Environment Variables

Create a `.env` file in the project root with:

```env
VITE_THINGSPEAK_API_KEY=your_thingspeak_key
VITE_SMS_API_KEY=your_sms_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request
