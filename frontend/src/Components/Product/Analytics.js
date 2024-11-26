import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import axios from "axios";
import { BASEURL } from '../../Auth/Matcher';
import 'react-datepicker/dist/react-datepicker.css';
import { Link,useNavigate } from "react-router-dom";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [customerCount, setCustomerCount] = useState('');
  const [productCount, setProductCount] = useState('');
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();
  
  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASEURL}/analytics/analytics-count`,{headers: {
          Authorization: `Bearer ${token}`, 
        },});
      setCustomerCount(response.data?.totalCustomer || 0);
      setProductCount(response.data?.totalProduct || 0);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchChartData = async () => {
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    const token = localStorage.getItem('token');
  
    try {
      const response = await axios.post(
        `${BASEURL}/analytics/chart-data`,
        { 
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        },
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const responseData = response.data.data;
      console.log("Response Data:", responseData);
  
      // Construct labels for the chart (e.g., "Jan 2022", "Feb 2022", etc.)
      const labels = [];
      const data = [];
  
      // Flatten the data by iterating over each year and month in the response
      Object.keys(responseData).forEach((year) => {
        Object.keys(responseData[year]).forEach((month) => {
          // Create a label in the format "Month Year"
          const label = `${month} ${year}`;
          labels.push(label);
  
          // Add the corresponding total price
          data.push(responseData[year][month]);
        });
      });
  
      // Set the chart data
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Product Price',
            data: data,
            backgroundColor: 'rgb(0, 255, 255)',
            borderColor: 'rgba(4, 8, 114)',
            fill: false,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };
  

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (startDate && endDate) {
        fetchChartData();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [startDate, endDate]);

  const handleDateChange = (date, type) => {
    if (type === 'start') setStartDate(date);
    else setEndDate(date);
  };

  const options = {
    responsive: true,
    scales: {
      x: { type: 'category' },
      y: { beginAtZero: true },
    },
  };
console.log("chartDatachartData",chartData);

  return (
    <main className="content flex-grow-1 p-3 bg-light">
      <div className="container-fluid">
        <div className="card mx-auto" style={{ width: '1080px', marginBottom: '20px' }}>
          <div className="card-body">
            <h2 className="card-title">Analytics</h2>
            <div className="d-flex justify-content-between mb-4">
              <div className="card text-center" style={{ width: '48%', padding: '20px' }}>
                <h5>No. of Customers</h5>
                <h2>{customerCount}</h2>
              </div>
              <div className="card text-center" style={{ width: '48%', padding: '20px' }}>
                <h5>No. of Products</h5>
                <h2>{productCount}</h2>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <DatePicker
                selected={startDate}
                onChange={(date) => handleDateChange(date, 'start')}
                dateFormat="yyyy/MM/dd"
                className="form-control"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => handleDateChange(date, 'end')}
                dateFormat="yyyy/MM/dd"
                className="form-control"
              />
            </div>
            {chartData ? (
              <Line
                data={chartData}
                options={options}
                style={{ height: '300px', width: '1000px', margin: '0 auto' }}
              />
            ) : (
              <p className="text-center">No data available for the selected range</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Analytics;



