# 🚀 Quick Start Guide - Naova

Get Naova up and running in 5 minutes!

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Environment

```bash
# Backend
cd backend
cp env.example .env

# Frontend
cd ../frontend
cp env.example .env
```

### 3. Initialize Database

```bash
cd backend
npm run db:setup
```

This will:
- Create the SQLite database file (`naova.sqlite`)
- Create all necessary tables
- Insert sample data for testing

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## What's Included

The sample data includes:

### Products
- Screws, bolts, and fasteners
- Tools (hammers, wrenches, drills)
- Electrical supplies
- Plumbing materials
- Safety equipment

### Providers
- Hardware Store A (Fast delivery, higher prices)
- Hardware Store B (Medium delivery, medium prices)
- Hardware Store C (Slow delivery, lower prices)

### Sample Quotations
- Pre-generated quotes for testing

## Testing the Application

1. **Search Products**: Try searching for "screws", "hammer", or "electrical"
2. **Compare Prices**: View different suppliers and their prices
3. **Generate Quotes**: Create new quotations
4. **Admin Panel**: Access admin features at `/admin`

## Troubleshooting

### Database Issues
```bash
# Reset database if needed
cd backend
npm run db:reset

# View database info
npm run db:info
```

### Port Conflicts
If ports 3000 or 5000 are in use:
- Change `PORT` in backend `.env`
- Change `REACT_APP_API_URL` in frontend `.env`

### Common Issues
- **"Module not found"**: Run `npm install` in the respective directory
- **"Database locked"**: Close any other applications using the database
- **"CORS errors"**: Check that frontend URL matches in backend `.env`

## Next Steps

1. **Customize Data**: Add your own products and providers
2. **Configure WhatsApp**: Update the WhatsApp number in frontend `.env`
3. **Deploy**: Prepare for production deployment
4. **Add Features**: Implement additional functionality

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database setup completed successfully
4. Check that both servers are running

---

**Happy coding! 🎉** 