import React from 'react'
import { Button } from './ui/button'
import { RotateCcw } from 'lucide-react'

const ResetData = () => {
  const handleResetData = () => {
    if (window.confirm('Tem certeza que deseja resetar todos os dados para os valores iniciais?\n\nEsta ação não pode ser desfeita e todos os produtos adicionados serão perdidos.')) {
      // Limpar localStorage
      localStorage.removeItem('adega-di-vinno-products')
      
      // Recarregar a página para aplicar os dados iniciais
      window.location.reload()
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleResetData}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      Resetar Dados
    </Button>
  )
}

export default ResetData
