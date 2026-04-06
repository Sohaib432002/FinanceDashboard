'use client'

import { useState } from 'react'
import { useTheme } from '../useContext/useContext'

const Navbar = ({ IsOpen, setIsopen }) => {
  const [data, setdata] = useState([])
  const { mode, toggleTheme } = useTheme()

  return (
    <div
      className={`z-10 flex justify-between items-center p-4 shadow-md border-b transition-all duration-300 ${
        mode === 'light'
          ? 'bg-white text-gray-900 border-gray-200'
          : 'bg-slate-900 text-white border-slate-700'
      }`}
    >
      <div className="flex items-center px-2 gap-3">
        <img
          src="/Profile.png"
          className="w-[45px] h-[45px] rounded-full border border-slate-500 object-cover"
          alt="profile"
        />

        <h1
          className={`tracking-tight underline font-semibold text-lg md:text-2xl ${
            mode === 'light' ? 'text-indigo-700' : 'text-indigo-400'
          }`}
        >
          Smart Finance Dashboard
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
            mode === 'light'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-purple-700 text-white hover:bg-purple-800'
          }`}
        >
          {mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
        </button>
      </div>

      <div
        className={`md:hidden cursor-pointer text-xl transition ${
          mode === 'light'
            ? 'text-gray-700 hover:text-indigo-600'
            : 'text-slate-300 hover:text-indigo-400'
        }`}
        onClick={() => setIsopen(!IsOpen)}
      >
        {IsOpen ? <i className="fas fa-close"></i> : <i className="fas fa-bars"></i>}
      </div>
    </div>
  )
}

export default Navbar
