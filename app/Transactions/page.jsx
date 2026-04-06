'use client'
import React, { useEffect, useState } from 'react'
import { transactions } from '../components/data'
import { useTheme } from '../useContext/useContext'
const Page = () => {
  const [allTransactions, setAllTransactions] = useState(transactions)
  const [filterdata, setfilterdata] = useState(transactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectRole, setSelectRole] = useState('')
  const [AddTransaction, setAddTransaction] = useState(false)
  const [transectiondetails, setTransectiondetails] = useState({
    category: '',
    amount: '',
    date: '' || new Date().toISOString().split('T')[0],
    type: 'income',
  })

  const applyfilter = () => {
    const filterd = allTransactions.filter((i) => {
      const matchesCategory = i.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = i.type.toLowerCase().includes(selectedType.toLowerCase())
      return matchesCategory && matchesType
    })
    setfilterdata(filterd)
  }

  const editTransiction = (item) => {
    deleteTransiction(item.id)
    setAddTransaction(true)
    setTransectiondetails(item)
  }

  const deleteTransiction = (id) => {
    const filterd = allTransactions.filter((i) => i.id !== id)
    setAllTransactions(filterd)
    setfilterdata(filterd)
  }
  const AddedTranstion = () => {
    if (
      transectiondetails.category &&
      transectiondetails.amount &&
      transectiondetails.date &&
      transectiondetails.type
    ) {
      const newTransaction = {
        ...transectiondetails,
        id: allTransactions.length + 1,
      }

      const updated = [...allTransactions, newTransaction]

      setAllTransactions(updated)
      setfilterdata(updated)
    }
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    setAddTransaction(false)
    setSelectedType('')

    AddedTranstion()
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    applyfilter()
  }, [searchTerm, selectedType])
  const { mode, toggleTheme } = useTheme()
  return (
    <div
      className={`flex-1 relative ${
        mode === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-slate-900 text-white'
      }`}
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
          Transactions Overview
        </h2>

        <p
          className={`text-center text-sm mt-2 ${
            mode === 'light' ? 'text-gray-600' : 'text-slate-300'
          }`}
        >
          Manage your financial transactions with ease
        </p>
      </div>

      <div
        className={`mx-auto pt-5 p-3 rounded border ${
          mode === 'light' ? 'border-gray-300 bg-white' : 'border-slate-700 bg-slate-900'
        }`}
      >
        <div className="flex-wrap flex my-2 gap-2 justify-center">
          <div
            className={`flex-1 px-2 rounded flex items-center gap-1 border ${
              mode === 'light'
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <i className="fa fa-search"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`p-1 my-1 focus:outline-none rounded w-full ${
                mode === 'light' ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
              placeholder="Search by Category.."
            />
          </div>

          <div
            className={`flex-1 px-2 rounded flex items-center gap-1 border ${
              mode === 'light'
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`p-1 focus:outline-none rounded w-full ${
                mode === 'light' ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div
            className={`flex-1 px-2 rounded flex items-center gap-1 border ${
              mode === 'light'
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <select
              onChange={(e) => setSelectRole(e.target.value)}
              className={`p-1 focus:outline-none rounded w-full ${
                mode === 'light' ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded flex items-center justify-center">
            <button
              onClick={() => setAddTransaction(true)}
              className="text-white font-bold px-4 py-1"
            >
              <span className="bg-rose-500 px-1 rounded">+</span> Add Transaction
            </button>
          </div>
        </div>

        <table
          className={`w-full text-left border-collapse border ${
            mode === 'light' ? 'border-gray-300' : 'border-slate-700'
          }`}
        >
          <tr
            className={`${mode === 'light' ? 'bg-gray-200 text-black' : 'bg-slate-800 text-white'}`}
          >
            <th className="border p-2 text-center">Date</th>
            <th className="border p-2 text-center">Category</th>
            <th className="border p-2 text-center">Amount</th>
            <th className="border p-2 text-center">Type</th>
            {selectRole === 'admin' && <th className="border p-2 text-center">Action</th>}
          </tr>

          {filterdata.map((item, index) => (
            <tr
              key={index}
              className={`border ${
                mode === 'light'
                  ? 'border-gray-300 text-gray-800'
                  : 'border-slate-700 text-slate-300'
              }`}
            >
              <td className="border p-1 text-center">{item.date}</td>
              <td className="border p-1 text-center">{item.category}</td>
              <td className="border p-1 text-center">${item.amount}</td>

              <td className="border p-1 text-center">
                <span
                  className={`font-bold px-2 py-1 rounded ${
                    item.type === 'income'
                      ? mode === 'light'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-emerald-400/20 text-emerald-400'
                      : mode === 'light'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-rose-400/20 text-rose-400'
                  }`}
                >
                  {item.type}
                </span>
              </td>

              {selectRole === 'admin' && (
                <td className="border p-2 text-center">
                  <button
                    onClick={() => editTransiction(item)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTransiction(item.id)}
                    className="bg-rose-500 hover:bg-rose-600 ml-2 text-white py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </table>

        <div
          className={`absolute ${AddTransaction ? 'block' : 'hidden'} top-0 left-0 w-full h-full bg-black/60 items-center justify-center`}
        >
          <div
            className={`flex flex-col max-w-3xl m-auto rounded p-4 border ${
              mode === 'light'

                ? 'bg-white text-black border-gray-300'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <form onSubmit={handleSubmit}>
              <h1 className="text-center text-xl mb-2">Add Transaction</h1>

              <div className="flex flex-col p-3">
                <label className="my-2">Category:</label>
                <input
                  type="text"
                  className={`border px-2 py-1 ${
                    mode === 'light'
                      ? 'bg-gray-100 text-black border-gray-300'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                  value={transectiondetails.category}
                  onChange={(e) =>
                    setTransectiondetails({ ...transectiondetails, category: e.target.value })
                  }
                />

                <label className="my-2">Amount:</label>
                <input
                  type="number"
                  className={`border px-2 py-1 ${
                    mode === 'light'
                      ? 'bg-gray-100 text-black border-gray-300'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                  value={transectiondetails.amount}
                  onChange={(e) =>
                    setTransectiondetails({ ...transectiondetails, amount: e.target.value })
                  }
                />

                <label className="my-2">Date:</label>
                <input
                  type="date"
                  className={`border px-2 py-1 ${
                    mode === 'light'
                      ? 'bg-gray-100 text-black border-gray-300'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                  value={transectiondetails.date}
                  onChange={(e) =>
                    setTransectiondetails({ ...transectiondetails, date: e.target.value })
                  }
                />

                <label className="my-2">Type:</label>
                <select
                  className={`border px-2 py-1 ${
                    mode === 'light'
                      ? 'bg-gray-100 text-black border-gray-300'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                  value={transectiondetails.type}
                  onChange={(e) =>
                    setTransectiondetails({ ...transectiondetails, type: e.target.value })
                  }
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="flex justify-center mt-3">
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-1 px-3 rounded"
                >
                  Add Transaction
                </button>

                <button
                  onClick={() => setAddTransaction(false)}
                  className="bg-rose-500 mx-2 hover:bg-rose-600 text-white py-1 px-3 rounded"
                >
                  ✕
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
