import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Generate random data
const generateRandomData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1) + min));
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const lineChartData = {
  labels: months,
  datasets: [
    {
      label: 'Revenue',
      data: generateRandomData(12, 1000, 5000),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Expenses',
      data: generateRandomData(12, 800, 4000),
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }
  ],
};

const barChartData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Sales',
      data: generateRandomData(4, 5000, 15000),
      backgroundColor: '#3B82F6',
    },
    {
      label: 'Profit',
      data: generateRandomData(4, 1000, 5000),
      backgroundColor: '#10B981',
    }
  ],
};

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(true);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: darkMode ? '#fff' : '#000',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
      },
      y: {
        grid: {
          color: darkMode ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
      },
    },
  }), [darkMode]);

  const navigate = useNavigate()
  return (    
    <div className={`min-h-screen ${darkMode ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold">LOGO</div>
          <Button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-md ${darkMode ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-black'}`}
          >
            {darkMode ? 'Enable Light Mode' : 'Enable Dark Mode'}
          </Button>
        </header>
        <main className="text-center">
          <h1 className="text-5xl font-bold mb-4">
            Business insights,
            <br />
            at your fingertips.
          </h1>
          <p className="text-xl mb-8 text-neutral-400">
            Engineered for Real-Time Innovation.
          </p>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-md"
          onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80">
              <Line data={lineChartData} options={chartOptions} />
            </div>
            <div className="h-80">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}