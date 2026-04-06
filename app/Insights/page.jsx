'use client'
import React from 'react'
import { transactions } from '../components/data'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  YAxis,
  XAxis,
  CartesianGrid,
} from 'recharts'
import { useTheme } from '../useContext/useContext'

const Page = () => {
  const COLORS = ['#10b981', '#f43f5e']
  const getChartData = () => {
    let income = 0
    let expense = 0

    transactions.forEach((item) => {
      if (item.type === 'income') {
        income += Number(item.amount)
      } else {
        expense += Number(item.amount)
      }
    })

    return [
      { name: 'Income', value: income },
      { name: 'Expense', value: expense },
    ]
  }
  const getMonthlyData = () => {
    const monthly = {}

    transactions.forEach((item) => {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]

      const date = new Date(item.date)
      const month = monthNames[date.getMonth()]

      if (!monthly[month]) {
        monthly[month] = { income: 0, expense: 0 }
      }

      if (item.type === 'income') {
        monthly[month].income += Number(item.amount)
      } else {
        monthly[month].expense += Number(item.amount)
      }
    })

    const monthOrder = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const result = []
    monthOrder.forEach((m) => {
      if (monthly[m]) {
        result.push({
          month: m,
          income: monthly[m].income,
          expense: monthly[m].expense,
        })
      }
    })
    return result
  }
  const { mode, toggleTheme } = useTheme()
  const datatimeLineGraph = getMonthlyData()
  const totalIncome = transactions.reduce((a, t) => (t.type === 'income' ? a + t.amount : a), 0)
  const totalExpenses = transactions.reduce((a, t) => (t.type === 'expense' ? a + t.amount : a), 0)
  const totalBalance = totalIncome - totalExpenses
  const top_5 = [...transactions].sort((a, b) => b.amount - a.amount).slice(0, 5)
  const categoryMap = {}

  transactions.forEach((t) => {
    if (!categoryMap[t.category] || t.amount > categoryMap[t.category].amount) {
      categoryMap[t.category] = t
    }
  })

  const uniqueCategories = Object.values(categoryMap)

  const top_5_unique_categories = uniqueCategories.sort((a, b) => b.amount - a.amount).slice(0, 5)

  console.log(top_5_unique_categories)
  return (
    <div
      className={`w-full  ${mode === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black text-white'}`}
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
          Insight Overview
        </h2>
        <p
          className={`text-center text-sm mt-2 ${
            mode === 'light' ? 'text-gray-600' : 'text-slate-400'
          }`}
        >
          Income, Expenses & Monthly Analytics
        </p>
      </div>

      <div className="flex justify-center flex-wrap gap-3 p-2">
        
        <div
          className={`flex-1 flex items-center justify-center border rounded p-4 shadow-md hover:scale-[1.02] transition ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'
          }`}
        >
          <i className="text-5xl mr-3 text-emerald-400 fa-solid fa-money-bill-wave"></i>
          <div>
            <h2
              className={`text-2xl font-bold ${mode === 'light' ? 'text-gray-900' : 'text-white'}`}
            >
              ${totalIncome}
            </h2>
            <p className="text-sm text-slate-400">Total Income</p>
          </div>
        </div>

        <div
          className={`flex-1 flex items-center justify-center border rounded p-4 shadow-md hover:scale-[1.02] transition ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'
          }`}
        >
          <i className="text-5xl mr-3 text-rose-400 fa-solid fa-wallet"></i>
          <div>
            <h2
              className={`text-2xl font-bold ${mode === 'light' ? 'text-gray-900' : 'text-white'}`}
            >
              ${totalExpenses}
            </h2>
            <p className="text-sm text-slate-400">Total Expenses</p>
          </div>
        </div>

        <div
          className={`flex-1 flex items-center justify-center border rounded p-4 shadow-md hover:scale-[1.02] transition ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'
          }`}
        >
          <i className="text-5xl mr-3 text-indigo-400 fa-solid fa-balance-scale"></i>
          <div>
            <h2
              className={`text-2xl font-bold ${mode === 'light' ? 'text-gray-900' : 'text-white'}`}
            >
              ${totalBalance}
            </h2>
            <p className="text-sm text-slate-400">Total Balance</p>
          </div>
        </div>

        <div
          className={`flex-1 flex items-center justify-center border rounded p-4 shadow-md hover:scale-[1.02] transition ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'
          }`}
        >
          <i className="text-5xl mr-3 text-amber-400 fa-solid fa-circle-check"></i>
          <div>
            <h2
              className={`text-2xl font-bold ${mode === 'light' ? 'text-gray-900' : 'text-white'}`}
            >
              {transactions.length}
            </h2>
            <p className="text-sm text-slate-400">Total Transactions</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 p-2">
       
        <div
          className={`border shadow-lg rounded p-6 ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <h1 className="text-center text-lg font-semibold mb-3">Income vs Expense</h1>
          <hr className="border-slate-700 mb-3" />

          <div className="flex justify-center items-center">
            <BarChart width={350} height={280} data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </div>
        </div>

        <div
          className={`border shadow-lg rounded p-6 ${
            mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <h1 className="text-center text-lg font-semibold mb-3">Income vs Expense</h1>
          <hr className="border-slate-700 mb-3" />

          <div className="flex justify-center items-center">
            <PieChart width={320} height={280}>
              <Pie
                data={getChartData()}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {getChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                }}
              />

              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ color: '#d1d5db' }}
              />
            </PieChart>
          </div>
        </div>
      </div>

      <div
        className={`border shadow-lg rounded p-6 m-2 ${
          mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
        }`}
      >
        <h1 className="text-center text-lg font-semibold mb-3">Top Categories</h1>
        <hr className="border-slate-700 mb-3" />

        <ul>
          {top_5_unique_categories.map((item) => (
            <li key={item.category} className="text-slate-500 text-lg mt-2 flex justify-between">
              <span>{item.category || 'N/A'}</span>
              <span className="font-bold text-amber-400">${item.amount || 0}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Page
