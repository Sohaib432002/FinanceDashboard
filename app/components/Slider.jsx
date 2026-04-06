import React from 'react'
import Link from 'next/link'
import { useTheme } from '../useContext/useContext'

const Slider = ({ IsOpen }) => {
  const { mode, toggleTheme } = useTheme()

  return (
    <div
      className={`min-w-[280px] sm:min-w-[320px] min-h-screen border-r transition-all duration-300 ${
        mode === 'light'
          ? 'bg-white text-gray-900 border-gray-200'
          : 'bg-slate-900 text-white border-slate-700'
      }`}
    >
      <div className="flex justify-center py-8">
        <img
          src="/logo.png"
          className="w-[110px] h-[110px] object-cover rounded-full border border-slate-500"
          alt="logo"
        />
      </div>

      <div className="flex flex-col items-center m-5 gap-3">
        <Link
          className={`w-full p-3 rounded text-center font-medium transition ${
            mode === 'light'
              ? 'bg-gray-100 hover:bg-indigo-600 hover:text-white'
              : 'bg-slate-800 hover:bg-indigo-600 hover:text-white'
          }`}
          href="/"
        >
          Dashboard
        </Link>

        <Link
          className={`w-full p-3 rounded text-center font-medium transition ${
            mode === 'light'
              ? 'bg-gray-100 hover:bg-indigo-600 hover:text-white'
              : 'bg-slate-800 hover:bg-indigo-600 hover:text-white'
          }`}
          href="/Transactions"
        >
          Transactions
        </Link>

        <Link
          className={`w-full p-3 rounded text-center font-medium transition ${
            mode === 'light'
              ? 'bg-gray-100 hover:bg-indigo-600 hover:text-white'
              : 'bg-slate-800 hover:bg-indigo-600 hover:text-white'
          }`}
          href="/Insights"
        >
          Insights
        </Link>

        <Link
          className={`w-full p-3 rounded text-center font-medium transition ${
            mode === 'light'
              ? 'bg-gray-100 hover:bg-indigo-600 hover:text-white'
              : 'bg-slate-800 hover:bg-indigo-600 hover:text-white'
          }`}
          href="/Reports"
        >
          Reports
        </Link>

        <div className="md:hidden w-full flex mt-4">
          <button
            onClick={toggleTheme}
            className={`w-full p-2 rounded font-medium transition ${
              mode === 'light'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-purple-700 text-white hover:bg-purple-800'
            }`}
          >
            {mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Slider
