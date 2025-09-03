import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Registra los componentes necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, options = {} }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Suaviza las líneas
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  // Combinar opciones por defecto con las opciones pasadas
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
    },
    scales: {
      ...defaultOptions.scales,
      ...options.scales,
    },
  };

  // Modificar los datos para que tengan un estilo de línea más atractivo
  const enhancedData = {
    ...data,
    datasets: data.datasets?.map(dataset => ({
      ...dataset,
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Área bajo la línea
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 3,
      fill: true, // Rellena el área bajo la línea
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: 'white',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: 'rgb(59, 130, 246)',
      pointHoverBorderColor: 'white',
      pointHoverBorderWidth: 3,
    })) || [],
  };

  return <Line options={mergedOptions} data={enhancedData} />;
};

export default LineChart;
