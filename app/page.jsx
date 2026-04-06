'use client'
import React from 'react'
import {
  CartesianGrid,
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { transactions } from './components/data'
import { useTheme } from './useContext/useContext'

const Page = () => {
  const monthlyMap = {}

  transactions.forEach((item) => {
    const date = new Date(item.date)

    const monthYear = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear()

    if (!monthlyMap[monthYear]) {
      monthlyMap[monthYear] = {
        name: monthYear,
        income: 0,
        expense: 0,
      }
    }

    if (item.type === 'income') {
      monthlyMap[monthYear].income += Number(item.amount)
    } else {
      monthlyMap[monthYear].expense += Number(item.amount)
    }
  })

  const data = Object.values(monthlyMap)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalBalance = totalIncome - totalExpense

  const { mode } = useTheme()

  return (
    <div
      className={`w-full min-h-screen ${
        mode === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black text-white'
      }`}
    >
      {/* HEADER */}
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
          Dashboard Overview
        </h2>
        <p
          className={`text-center text-sm mt-2 ${
            mode === 'light' ? 'text-gray-700' : 'text-slate-400'
          }`}
        >
          Income, Expenses & Monthly Analytics
        </p>
      </div>

      {/* CARDS */}
      <div className="p-4 flex justify-center gap-4 flex-wrap">
        {/* BALANCE */}
        <div
          className={`border border-slate-700 hover:scale-[1.02] transition flex-1 w-[250px] rounded p-5 shadow-md flex justify-between items-center ${
            mode === 'light' ? 'bg-white text-gray-900' : 'bg-slate-900 text-white'
          }`}
        >
          <div>
            <h4 className="text-slate-400 text-sm uppercase">Total Balance</h4>
            <div className="mt-2 text-2xl font-bold text-amber-400">${totalBalance}</div>
          </div>
          <i className="fas fa-coins text-amber-400 text-3xl"></i>
        </div>

        {/* INCOME */}
        <div
          className={`border border-slate-700 hover:scale-[1.02] transition flex-1 w-[250px] rounded p-5 shadow-md flex justify-between items-center ${
            mode === 'light' ? 'bg-white text-gray-900' : 'bg-slate-900 text-white'
          }`}
        >
          <div>
            <h4 className="text-slate-400 text-sm uppercase">Total Income</h4>
            <div className="mt-2 text-2xl font-bold text-emerald-400">${totalIncome}</div>
          </div>
          <i className="fas fa-money-bill-wave text-emerald-400 text-3xl"></i>
        </div>

        {/* EXPENSE */}
        <div
          className={`border border-slate-700 hover:scale-[1.02] transition flex-1 w-[250px] rounded p-5 shadow-md flex justify-between items-center ${
            mode === 'light' ? 'bg-white text-gray-900' : 'bg-slate-900 text-white'
          }`}
        >
          <div>
            <h4 className="text-slate-400 text-sm uppercase">Total Expense</h4>
            <div className="mt-2 text-2xl font-bold text-rose-400">${totalExpense}</div>
          </div>
          <i className="fas fa-money-bill-wave text-rose-400 text-3xl"></i>
        </div>
      </div>

      {/* CHARTS */}
      <div className="flex px-4 flex-wrap gap-4">
        {/* LINE CHART */}
        <div
          className={`flex-1 rounded shadow-lg p-5 ${
            mode === 'light' ? 'bg-white border text-gray-900' : 'bg-slate-900 text-white'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`${mode === 'light' ? 'text-gray-900' : 'text-white'} font-semibold`}>
              Monthly Overview
            </h3>
            <span className="text-sm text-slate-400">Income vs Expense</span>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                  }}
                />

                <Legend wrapperStyle={{ color: '#cbd5f5' }} />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                  name="Income"
                />

                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#f43f5e' }}
                  activeDot={{ r: 6 }}
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}
        <div
          className={`flex-1 rounded shadow-lg p-5 ${
            mode === 'light' ? 'bg-white border text-gray-900' : 'bg-slate-900 text-white'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`${mode === 'light' ? 'text-gray-900' : 'text-white'} font-semibold`}>
              Income vs Expense (Bar)
            </h3>
            <span className="text-sm text-slate-400">Monthly Comparison</span>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={data} barGap={8}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    border: 'none',
                    borderRadius: '10px',
                  }}
                />

                <Legend />

                <Bar dataKey="income" fill="#10b981" radius={[10, 10, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
