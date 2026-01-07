import { useState, useEffect } from 'react'
import { AlertTriangle, X, CreditCard, Calendar, Phone } from 'lucide-react'

interface PaymentWarningProps {
  paymentStatus: {
    canAccess: boolean
    message: string
    status: 'paid' | 'warning' | 'blocked'
    daysLeft?: number
    blocked?: boolean
  }
  onClose?: () => void
}

export default function PaymentWarning({ paymentStatus, onClose }: PaymentWarningProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Agar to'langan bo'lsa, ogohlantirish ko'rsatmaslik
  if (paymentStatus.status === 'paid' || !isVisible) {
    return null
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  // Warning (1-10 sanalar) uchun sariq rang
  if (paymentStatus.status === 'warning') {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
        <div className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-xl border border-yellow-400/30 rounded-xl p-4 shadow-2xl animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-100" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">To'lov eslatmasi!</h3>
              <p className="text-yellow-100 text-sm mb-3">{paymentStatus.message}</p>
              <div className="flex items-center gap-4 text-xs text-yellow-200">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {paymentStatus.daysLeft} kun qoldi
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Admin bilan bog'laning
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-yellow-100" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Blocked (10-sanadan keyin) uchun qizil rang va modal
  if (paymentStatus.status === 'blocked') {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        
        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-600/95 to-red-800/95 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-red-200" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">To'lov muddati o'tdi!</h2>
              
              <p className="text-red-100 mb-6 leading-relaxed">
                {paymentStatus.message}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Foizlaringiz bloklangan</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-red-200">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">CRM admin bilan bog'laning</span>
                </div>
              </div>
              
              <div className="text-xs text-red-300 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <p className="font-medium mb-1">Eslatma:</p>
                <p>To'lov qilganingizdan keyin avtomatik ochiladi</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}