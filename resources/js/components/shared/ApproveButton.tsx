import React from 'react'
import { ShieldCheck, Lock, Unlock } from 'lucide-react'

interface ApproveButtonProps {
  isApproved: boolean
  hasChanges: boolean
  onApprove: () => void
}

const ApproveButton = ({ isApproved, hasChanges, onApprove }: ApproveButtonProps) => {
  if (isApproved && !hasChanges) {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#9DFF4A]/10 border border-[#9DFF4A]/30 text-[#9DFF4A]">
        <ShieldCheck className="w-5 h-5" />
        <span className="text-sm font-semibold">Data Telah Disetujui</span>
        <Lock className="w-4 h-4 opacity-60" />
      </div>
    )
  }

  return (
    <button
      onClick={onApprove}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-[#9DFF4A] to-[#7AD936] text-[#0F1329] hover:shadow-[0_0_24px_-4px_rgba(157,255,74,0.4)] hover:scale-[1.01] transition-all duration-300 font-semibold group"
    >
      <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
      <span>Approve All Data</span>
      <Unlock className="w-4 h-4 opacity-60" />
    </button>
  )
}

export default ApproveButton
