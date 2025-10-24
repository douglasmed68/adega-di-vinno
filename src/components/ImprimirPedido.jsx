import React, { useRef } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Printer, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Truck,
  Package
} from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

const ImprimirPedido = ({ isOpen, onClose, pedido }) => {
  const printRef = useRef()

  if (!pedido) return null

  // Formatar data
  const formatarData = (timestamp) => {
    const data = new Date(timestamp)
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calcular total do pedido
  const calcularTotal = () => {
    return pedido.itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0)
  }

  // Obter status do pedido com cor
  const getStatusBadge = () => {
    const statusMap = {
      'pendente': { label: 'Pendente', variant: 'default', icon: <Clock className="h-4 w-4 mr-1" /> },
      'pago': { label: 'Pago', variant: 'default', icon: <CheckCircle className="h-4 w-4 mr-1" /> },
      'enviado': { label: 'Enviado', variant: 'default', icon: <Truck className="h-4 w-4 mr-1" /> },
      'entregue': { label: 'Entregue', variant: 'default', icon: <Package className="h-4 w-4 mr-1" /> },
      'cancelado': { label: 'Cancelado', variant: 'destructive', icon: <AlertTriangle className="h-4 w-4 mr-1" /> }
    }

    const status = statusMap[pedido.status] || statusMap.pendente

    return (
      <Badge variant={status.variant} className="flex items-center">
        {status.icon}
        {status.label}
      </Badge>
    )
  }

  // Função para imprimir
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido_${pedido.numero}_Adega_Di_Vinno`,
    onAfterPrint: () => console.log('Impressão concluída')
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Imprimir Pedido #{pedido.numero}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Opções de Impressão</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Download className="mr-2 h-4 w-4" />
                    Salvar como PDF
                  </Button>
                  <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo para impressão */}
          <div ref={printRef} className="p-8 bg-white rounded-lg border">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Adega Di Vinno</h1>
                <p className="text-gray-500">Sistema de Gestão</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl">Pedido #{pedido.numero}</h2>
                <p>{formatarData(pedido.data)}</p>
                <div className="mt-2">{getStatusBadge()}</div>
              </div>
            </div>

            {/* Informações do cliente e pedido */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold mb-2">Informações do Cliente</h3>
                <p className="font-medium">{pedido.cliente.nome}</p>
                <p className="text-sm text-gray-600">{pedido.cliente.telefone}</p>
                <p className="text-sm text-gray-600">{pedido.cliente.email}</p>
                {pedido.cliente.endereco && (
                  <p className="text-sm text-gray-600">{pedido.cliente.endereco}</p>
                )}
              </div>
              <div>
                <h3 className="font-bold mb-2">Detalhes do Pedido</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data:</span>
                    <span>{formatarData(pedido.data)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Forma de Pagamento:</span>
                    <span>{pedido.formaPagamento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span>{pedido.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Itens do pedido */}
            <div className="mb-6">
              <h3 className="font-bold mb-2">Itens do Pedido</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Código</th>
                    <th className="text-left py-2">Produto</th>
                    <th className="text-right py-2">Qtd</th>
                    <th className="text-right py-2">Preço Unit.</th>
                    <th className="text-right py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.itens.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-mono">{item.codigo}</td>
                      <td className="py-2">
                        <div>
                          <p className="font-medium">{item.nome}</p>
                          {item.descricao && (
                            <p className="text-xs text-gray-500">{item.descricao}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-right">{item.quantidade}</td>
                      <td className="py-2 text-right">R$ {item.precoUnitario.toFixed(2)}</td>
                      <td className="py-2 text-right font-medium">
                        R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo do pedido */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal:</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                  {pedido.frete > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Frete:</span>
                      <span>R$ {pedido.frete.toFixed(2)}</span>
                    </div>
                  )}
                  {pedido.desconto > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Desconto:</span>
                      <span>- R$ {pedido.desconto.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-bold text-lg mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>R$ {(calcularTotal() + (pedido.frete || 0) - (pedido.desconto || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observações */}
            {pedido.observacoes && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-bold mb-2">Observações</h3>
                <p className="text-sm">{pedido.observacoes}</p>
              </div>
            )}

            {/* Rodapé */}
            <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
              <p>Adega Di Vinno - Sistema de Gestão</p>
              <p>Pedido gerado em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImprimirPedido
