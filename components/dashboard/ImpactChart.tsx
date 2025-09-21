
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector, Label } from 'recharts';
import { OpportunityCategory } from '../../types';
import tailwindConfig from 'tailwindcss/defaultConfig'; // Import to access theme

// Access colors from the Tailwind config (ensure your build process handles this or define them directly)
// For simplicity here, assuming CHART_COLORS is globally available or defined in a constants file
const CHART_COLORS = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e', '#d35400', '#8e44ad', '#27ae60'];


interface ChartDataPoint {
  name: string;
  value: number;
}

interface ImpactChartProps {
  data: ChartDataPoint[];
  chartType: 'bar' | 'pie';
  title?: string;
  dataKey?: string; 
  fillColor?: string; 
  height?: number;
}


const RADIAN = Math.PI / 180;
interface CustomizedLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
    name: string;
    value: number;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: CustomizedLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 4) return null; // Don't render label for very small slices

  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" className="text-[10px] sm:text-xs font-semibold drop-shadow-sm">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom XAxis tick component for angled labels
const AngledXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#718096" transform="rotate(-35)" fontSize="0.7rem" className="font-medium">
          {payload.value.length > 15 ? `${payload.value.substring(0,13)}...` : payload.value}
        </text>
      </g>
    );
  };

const ImpactChart: React.FC<ImpactChartProps> = ({ data, chartType, title, dataKey = "value", fillColor = "#3498db", height = 350 }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-dashboard-text-secondary p-4">No data available for this chart.</div>;
  }
  
  return (
    <div className="bg-dashboard-card p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
      {title && <h3 className="text-xl sm:text-2xl font-semibold text-dashboard-text-primary mb-6 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'bar' ? (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 70 /* Increased for angled labels */ }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={<AngledXAxisTick />} interval={0} height={80} />
            <YAxis stroke="#a0aec0" tick={{fontSize: '0.75rem', fill: '#718096', fontWeight: 500}} allowDecimals={false} />
            <Tooltip 
              cursor={{fill: 'rgba(237, 242, 247, 0.5)'}}
              contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#cbd5e0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
              itemStyle={{ color: '#2d3748' }}
              labelStyle={{ color: '#2d3748', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Legend 
              wrapperStyle={{paddingTop: '25px'}} 
              formatter={(value) => <span className="text-dashboard-text-secondary text-sm font-medium">{value}</span>}
            />
            <Bar dataKey={dataKey} fill={fillColor} radius={[5, 5, 0, 0]} barSize={35} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius="80%" // Slightly smaller to accommodate legend better
              innerRadius="45%" // Donut chart effect
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              stroke="none" // Remove cell stroke for cleaner look
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#cbd5e0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
               itemStyle={{ color: '#2d3748' }}
               labelStyle={{ color: '#2d3748', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center" 
              iconSize={10}
              iconType="circle"
              wrapperStyle={{paddingTop: '20px', paddingBottom: '0px', lineHeight: '1.5em'}}
              formatter={(value) => <span className="text-dashboard-text-secondary text-xs sm:text-sm font-medium ml-1 mr-2">{value}</span>}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactChart;