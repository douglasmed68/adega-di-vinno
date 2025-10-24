import React, { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Printer, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Truck,
  Package
} from 'lucide-react'

const VisualizarPedido = ({ isOpen, onClose, pedido }) => {
  const [isPrinting, setIsPrinting] = useState(false)

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
    const itens = pedido.itens || [];
    return itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);
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

  // Referência para impressão
  const printRef = useRef()

  // Imprimir pedido
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido_${pedido.numero}_Adega_Di_Vinno`,
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false)
  })

  // Exportar como PDF
  const handleExportPDF = () => {
    const element = printRef.current
    const opt = {
      margin: 10,
      filename: `Pedido_${pedido.numero}_Adega_Di_Vinno.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    
    // Simular exportação para PDF
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Pedido #{pedido.numero}</span>
              {getStatusBadge()}
            </DialogTitle>
          </DialogHeader>

          <div ref={printRef} className="space-y-6 print:space-y-4">
            {/* Cabeçalho do pedido para impressão */}
            <div className="hidden print:block">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h1 className="text-2xl font-bold">Adega Di Vinno</h1>
                  <p className="text-gray-500">Sistema de Gestão</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl">Pedido #{pedido.numero}</h2>
                  <p>{formatarData(pedido.data)}</p>
                </div>
              </div>
            </div>

            {/* Informações do pedido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
	                    <p className="font-medium">{pedido.cliente?.nome || 'Cliente Não Informado'}</p>
	                      {pedido.cliente?.telefone && (
	                        <p className="text-sm flex items-center text-gray-500">
	                          <Phone className="h-3 w-3 mr-1" />
	                          {pedido.cliente.telefone}
	                        </p>
	                      )}
	                    {pedido.cliente?.email && (
	                      <p className="text-sm flex items-center text-gray-500">
	                        <Mail className="h-3 w-3 mr-1" />
	                        {pedido.cliente.email}
	                      </p>
	                    )}
	                    {pedido.cliente?.endereco && (
                      <p className="text-sm flex items-center text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {pedido.cliente.endereco}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Detalhes do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Data:</span>
	                      <span>{formatarData(pedido.criado_em)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Forma de Pagamento:</span>
                      <span className="flex items-center">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {pedido.formaPagamento}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span>{getStatusBadge()}</span>
                    </div>
                    {pedido.observacoes && (
                      <div className="pt-2">
                        <span className="text-sm text-gray-500 block">Observações:</span>
                        <p className="text-sm">{pedido.observacoes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Itens do pedido */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
	                    {(pedido.itens || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{item.codigo}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.nome}</p>
                            {item.descricao && (
                              <p className="text-xs text-gray-500">{item.descricao}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantidade}</TableCell>
                        <TableCell className="text-right">R$ {item.precoUnitario.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Resumo do pedido */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center">
	                      <span className="font-medium">Subtotal:</span>
	                      <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
	                  {(pedido.frete || 0) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Frete:</span>
                      <span>R$ {pedido.frete.toFixed(2)}</span>
                    </div>
                  )}
	                  {(pedido.desconto || 0) > 0 && (
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
              </CardContent>
            </Card>

            {/* Rodapé para impressão */}
            <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-gray-500">
              <p>Adega Di Vinno - Sistema de Gestão</p>
              <p>Pedido gerado em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <DialogFooter className="print:hidden">
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={handleExportPDF} disabled={isPrinting}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
              <Button onClick={handlePrint} disabled={isPrinting}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </>
  )
}

export default VisualizarPedido
