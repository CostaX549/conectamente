import PageHeader from '@/components/page-header'
import { Stethoscope } from 'lucide-react'
import React from 'react'

export const metadata = {
    title: "Painel do Médico - ConectaMente",
    description: "Gerencie seus agendamentos e horários"
}

const DoctorDashboardLayout = ({ children }) => {
  return (
    <div className="container mx-auto px-4  py-8">
         <PageHeader icon={<Stethoscope />} title={'Painel do Médico'} />
        {children}
    </div>
  )
}

export default DoctorDashboardLayout