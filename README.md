# Strata Management System

A modern web application for managing strata-titled apartment buildings in New South Wales. Built with Next.js and deployed on Vercel, this system provides a comprehensive solution for committee members, owners, and residents.

## 🌟 Features

### Core Features
- 📊 Real-time dashboard with building management overview
- 🔧 Maintenance issue tracking and reporting
- 📅 Meeting scheduling and calendar management
- 💰 Financial summaries and levy calculations
- 📄 Document management with role-based access
- 🚨 Emergency maintenance provider locator

### Technical Features
- ⚡ Edge API routes for fast response times
- 🔒 Role-based access control
- 📱 Responsive design for all devices
- 🌐 CORS-enabled API endpoints
- 🔄 Real-time updates
- 📊 Data caching for performance

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/strata-management-system.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
EMAIL_API_KEY=your_email_api_key
```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

### Project Structure
```
├── api/              # Edge API routes
├── components/       # React components
├── pages/           # Next.js pages
├── public/          # Static assets
├── styles/          # CSS styles
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## 📚 API Documentation

### Endpoints
- `GET /api/contact-handler` - Get contact information
- `POST /api/contact-handler` - Submit contact form
- `GET /api/document-access` - Access documents with role-based control
- `POST /api/levy-calculator` - Calculate strata levies
- `GET /api/nearest-maintenance` - Find nearest maintenance providers

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Input validation using Zod
- CORS protection
- Rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)

## 📞 Support

For support, email support@stratamanagement.com or join our Slack channel.
