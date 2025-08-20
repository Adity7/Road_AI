# Video Management System Frontend

A modern React-based frontend for managing video processing streams with AI-powered object detection.

## 🚀 Features

- **Real-time Stream Management** - Create, monitor, and delete video streams
- **AI Model Integration** - Support for YOLO and custom AI models
- **Multiple Input Sources** - Webcams, video files, RTSP streams
- **Processing Modes** - Real-time and batch processing
- **Live Monitoring** - Real-time status updates and progress tracking
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Fetch API** - Modern HTTP client

## 📁 Project Structure

```
src/
├── api/
│   └── vmsService.js         # API communication layer
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── ConfirmationModal.jsx
│   │   ├── ErrorBanner.jsx
│   │   └── StatusIndicator.jsx
│   ├── AddStreamForm.jsx     # Stream creation form
│   ├── AlertsPanel.jsx       # System alerts display
│   ├── Dashboard.jsx         # Main layout component
│   ├── Footer.jsx            # Application footer
│   ├── Header.jsx            # Navigation header
│   ├── StreamDetails.jsx     # Stream information display
│   ├── StreamItem.jsx        # Individual stream card
│   └── StreamManager.jsx     # Stream list management
├── App.jsx                   # Main application component
├── index.css                 # Global styles and Tailwind
└── main.jsx                  # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend server running on http://localhost:8000

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Build for Production
```bash
npm run build
```

## 🎯 Usage Guide

### Creating a Stream

1. **Click "Add Stream"** button
2. **Enter Video Source**:
   - Camera: Use index (0, 1, 2...)
   - File: Enter full path to video file
   - RTSP: Use RTSP URL (rtsp://...)
3. **Select Processing Mode**:
   - Real-time: Live processing with immediate results
   - Batch: Process entire video and save results
4. **Configure AI Models**:
   - Default: yolov8n.pt (lightweight)
   - Custom: Add your own model paths
5. **Click "Create Stream"**

### Monitoring Streams

- **Status Indicators**: Real-time status updates
- **Progress Bars**: Batch processing progress
- **Live Results**: Real-time detection results
- **Stream Details**: Click any stream for detailed view

### Managing Streams

- **Delete**: Click trash icon on stream card
- **Refresh**: Click refresh button to update status
- **Select**: Click stream to view details and results

## 🔧 Configuration

### Backend Connection
The frontend connects to the backend at `http://localhost:8000` by default. To change this:

1. Edit `src/api/vmsService.js`
2. Update `API_BASE_URL` constant
3. Restart the development server

### Polling Intervals
- **Streams**: Updates every 5 seconds
- **Results**: Updates every 2 seconds (real-time streams)
- **Alerts**: Updates every 10 seconds
- **Connection**: Health check every 30 seconds

## 🎨 Customization

### Styling
- Uses Tailwind CSS utility classes
- Custom CSS in `src/index.css`
- Component-specific styles in each component

### Components
- All components are modular and reusable
- Easy to modify or extend functionality
- Follow React best practices

## 🐛 Troubleshooting

### Connection Issues
- Ensure backend is running on port 8000
- Check browser console for error messages
- Verify network connectivity

### Performance Issues
- Reduce polling intervals for better performance
- Use batch mode for large video files
- Monitor browser memory usage

### Build Issues
- Clear `node_modules` and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Follow existing code style
2. Add proper error handling
3. Test on multiple browsers
4. Update documentation

## 📄 License

This project is part of the Video Management System.
