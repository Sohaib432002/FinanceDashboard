'use client'

import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Slider from './components/Slider'
import { useTheme } from './useContext/useContext'

const Newlayout = ({ children }) => {
  const [IsOpen, setIsopen] = useState(false)
  const { mode } = useTheme()

  return (
    <div
      className={`min-h-screen flex flex-col ${mode === 'light' ? 'bg-gray-100' : 'bg-slate-900'}`}
    >
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar IsOpen={IsOpen} setIsopen={setIsopen} />
      </div>

      <div className="flex pt-[80px]">
        {/* SIDEBAR (Desktop) */}
        <div className="hidden md:block">
          <Slider IsOpen={IsOpen} />
        </div>

        {/* SIDEBAR (Mobile Drawer) */}
        <div
          className={`fixed md:hidden top-15 left-0 h-full z-40 transform transition-transform duration-300 ${
            IsOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Slider IsOpen={IsOpen} />
        </div>

        {/* OVERLAY (Mobile when sidebar open) */}
        {IsOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setIsopen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main
          className={`flex-1 p-4 transition-all duration-300 ${
            mode === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-slate-900 text-white'
          }`}
        > 
          
          {children}
        </main>
      </div>
    </div>
  )
}

export default Newlayout
