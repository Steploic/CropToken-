import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ account, contracts, provider }) => {
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalValue: '0',
    activeFarms: 0,
    marketplaceVolume: '0'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [cropDistribution, setCropDistribution] = useState([]);

  useEffect(() => {
    if (contracts.cropFactory && account) {
      loadDashboardData();
    }
  }, [contracts, account]);

  const loadDashboardData = async () => {
    try {
      // Simulate loading dashboard data
      setStats({
        totalCrops: 247,
        totalValue: '1,234.56',
        activeFarms: 89,
        marketplaceVolume: '567.89'
      });

      // Mock price data
      setPriceData([
        { name: 'Jan', maize: 0.8, cocoa: 4.2, coffee: 6.1 },
        { name: 'Feb', maize: 0.9, cocoa: 4.5, coffee: 6.3 },
        { name: 'Mar', maize: 0.7, cocoa: 4.1, coffee: 5.9 },
        { name: 'Apr', maize: 1.1, cocoa: 4.8, coffee: 6.5 },
        { name: 'May', maize: 1.0, cocoa: 4.6, coffee: 6.2 },
        { name: 'Jun', maize: 0.9, cocoa: 4.4, coffee: 6.0 }
      ]);

      // Mock crop distribution
      setCropDistribution([
        { name: 'Maize', value: 35, color: '#FFD700' },
        { name: 'Cocoa', value: 28, color: '#8B4513' },
        { name: 'Coffee', value: 22, color: '#228B22' },
        { name: 'Cassava', value: 15, color: '#FF8C00' }
      ]);

      // Mock recent activity
      setRecentActivity([
        { type: 'tokenization', crop: 'Maize', amount: '500 kg', time: '2 hours ago' },
        { type: 'trade', crop: 'Cocoa', amount: '250 kg', time: '4 hours ago' },
        { type: 'financing', crop: 'Coffee', amount: '5 HBAR', time: '6 hours ago' }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'crop-green' }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color} mt-1`}>{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`text-3xl`}>{icon}</div>
      </div>
    </div>
  );

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-6">🌾</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CropToken</h2>
        <p className="text-gray-600 text-center max-w-md mb-8">
          Connect your wallet to start tokenizing your crops and accessing the decentralized agricultural marketplace.
        </p>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <p className="text-crop-green font-medium">🚀 Built for Hedera Africa Hackathon 2025</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-crop-green to-crop-gold text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-green-100">Welcome back to your agricultural finance hub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Crops Tokenized"
          value={stats.totalCrops}
          subtitle="Across all farmers"
          icon="🌾"
          color="crop-green"
        />
        <StatCard
          title="Portfolio Value"
          value={`${stats.totalValue} HBAR`}
          subtitle="Current market value"
          icon="💰"
          color="crop-gold"
        />
        <StatCard
          title="Active Farms"
          value={stats.activeFarms}
          subtitle="Participating farmers"
          icon="🚜"
          color="crop-orange"
        />
        <StatCard
          title="Marketplace Volume"
          value={`${stats.marketplaceVolume} HBAR`}
          subtitle="Last 30 days"
          icon="📊"
          color="crop-blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Price Trends */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Price Trends (HBAR/kg)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="maize" stroke="#FFD700" strokeWidth={2} />
              <Line type="monotone" dataKey="cocoa" stroke="#8B4513" strokeWidth={2} />
              <Line type="monotone" dataKey="coffee" stroke="#228B22" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {cropDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {cropDistribution.map((crop, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: crop.color }}
                ></div>
                <span className="text-sm text-gray-600">{crop.name} ({crop.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-crop-green rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">
                    {activity.type === 'tokenization' && '🌱 Crop Tokenized'}
                    {activity.type === 'trade' && '🔄 Trade Completed'}
                    {activity.type === 'financing' && '💰 Financing Received'}
                  </p>
                  <p className="text-sm text-gray-600">{activity.crop} - {activity.amount}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
