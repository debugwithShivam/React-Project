import React from 'react'
import Layout from './AdminRoute/layout'
import { Outlet } from 'react-router-dom'

export default function Admin() {
  return (
    <div>
      <Layout/>
      <Outlet/>
    </div>
  )
}
