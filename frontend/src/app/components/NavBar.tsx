'use client';
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NavBar = () => {
    const currentPath=usePathname();
    const links=[
        {label: 'Home', href:"/"},
        {label: 'Draw', href:"/draw"},
    ]
  return (
    <nav className="flex py-4 px-5 h-22 w-full justify-between bg-black">
        <div className="flex items-center justify-center lg:justify-start w-full">
            <ul className="flex space-x-4 md:space-x-8 text-lg md:text-2xl text-white">
                {links.map(link => 
                <Link 
                    key={link.href}
                    href={link.href}
                    className={`${link.href===currentPath ? 'text-zinc-400':'text-slate-200'} hover:text-zinc-400 transition-colors`}>{link.label}
                </Link>)}
            </ul>
        </div>
    </nav>
  )
}
export default NavBar