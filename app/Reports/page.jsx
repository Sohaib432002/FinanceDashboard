'use client'
import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { transactions } from '../components/data'
import { useTheme } from '../useContext/useContext'

const Page = () => {
 
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  const categoryData = useMemo(() => {
    const map = {}

    transactions.forEach((t) => {
      if (!map[t.category]) map[t.category] = 0
      map[t.category] += Number(t.amount)
    })

    return Object.keys(map).map((key) => ({
      name: key,
      value: map[key],
    }))
  }, [])

  const monthlyData = useMemo(() => {
    const map = {}

    transactions.forEach((t) => {
      const d = new Date(t.date)
      const month = d.toLocaleString('default', { month: 'short' })

      if (!map[month]) {
        map[month] = { name: month, income: 0, expense: 0 }
      }

      if (t.type === 'income') map[month].income += Number(t.amount)
      else map[month].expense += Number(t.amount)
    })

    return Object.values(map)
  }, [])

  const COLORS = ['#10b981', '#f43f5e', '#6366f1', '#f59e0b', '#06b6d4']
  const { mode, toggleTheme } = useTheme()
  return (
    <div
      className={`w-full min-h-screen ${mode === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-slate-950 text-white'}`}
    >
      <div
        className={`w-full  px-6 py-6 border-b shadow-md ${
          mode === 'light'
            ? 'bg-gray-200 border-gray-300'
            : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-slate-700'
        }`}
      >
        <h2
          className={`text-2xl md:text-3xl font-bold text-center ${
            mode === 'light' ? 'text-gray-900' : 'text-white'
          }`}
        >
          Report Overview
        </h2>

        <p
          className={`text-center text-sm mt-2 ${mode === 'light' ? 'text-gray-600' : 'text-slate-400'}`}
        >
          Detailed financial reports and analytics
        </p>
      </div>

      <div className="p-4 flex flex-wrap gap-4 justify-center">
        <div
          className={`border rounded p-4 w-[250px] ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <h4 className="text-sm text-slate-400">Total Income</h4>
          <p className="text-2xl text-emerald-400 font-bold">${totalIncome}</p>
        </div>

        <div
          className={`border rounded p-4 w-[250px] ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <h4 className="text-sm text-slate-400">Total Expense</h4>
          <p className="text-2xl text-rose-400 font-bold">${totalExpense}</p>
        </div>

        <div
          className={`border rounded p-4 w-[250px] ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <h4 className="text-sm text-slate-400">Balance</h4>
          <p className="text-2xl text-indigo-400 font-bold">${balance}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-4">
       
        <div
          className={`flex-1 min-w-[300px] border rounded p-5 ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <h3 className="mb-3 text-lg">Category Distribution</h3>

          <div className="h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: mode === 'light' ? '#ffffff' : '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className={`flex-1 min-w-[300px] border rounded p-5 ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <h3 className="mb-3 text-lg">Monthly Overview</h3>

          <div className="h-[250px]">
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid
                  stroke={mode === 'light' ? '#d1d5db' : '#1e293b'}
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fill: mode === 'light' ? '#374151' : '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: mode === 'light' ? '#374151' : '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: mode === 'light' ? '#ffffff' : '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                  }}
                />

                <Legend />

                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
