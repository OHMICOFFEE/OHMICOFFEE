'use client'
import BinaryTree from '@/components/BinaryTree'
export default function RepTree({ params }: { params: { repId: string } }) {
  return <BinaryTree portalType="rep" repId={params.repId} />
}
