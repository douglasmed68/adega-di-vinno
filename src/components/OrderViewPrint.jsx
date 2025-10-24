import React, { useState, useEffect, useRef } from 'react'
import {
  Eye,
  Printer,
  FileText,
  Download,
  Mail,
  Share2,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
  Package,
  DollarSign,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const OrderViewPrint = ({ order, isOpen, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const printRef = useRef(null)

  // Não renderizar se não há pedido
  if (!order) return null

  // Calcular totais
  const subtotal = order.itens?.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0) || 0
  const desconto = order.desconto || 0
  const frete = order.frete || 0
  const total = subtotal - desconto + frete

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Confirmado': 'bg-blue-100 text-blue-800',
      'Preparando': 'bg-orange-100 text-orange-800',
      'Enviado': 'bg-purple-100 text-purple-800',
      'Entregue': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Obter ícone do status
  const getStatusIcon = (status) => {
    const icons = {
      'Pendente': Clock,
      'Confirmado': CheckCircle,
      'Preparando': Package,
      'Enviado': Truck,
      'Entregue': CheckCircle,
      'Cancelado': AlertCircle
    }
    const Icon = icons[status] || Clock
    return <Icon className="h-4 w-4" />
  }

  // Imprimir pedido
  const handlePrint = async () => {
    try {
      setIsPrinting(true)
      
      // Criar janela de impressão
      const printWindow = window.open('', '_blank')
      const printContent = generatePrintHTML()
      
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // Aguardar carregamento e imprimir
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
      
    } catch (error) {
      console.error('Erro ao imprimir:', error)
      alert('Erro ao imprimir pedido')
    } finally {
      setIsPrinting(false)
    }
  }

  // Gerar PDF
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true)
      
      // Simular geração de PDF (em uma implementação real, usaria uma biblioteca como jsPDF)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Criar blob com conteúdo HTML para download
      const htmlContent = generatePrintHTML()
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Criar link de download
      const link = document.createElement('a')
      link.href = url
      link.download = `pedido-${order.numero || order.id}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Enviar por email
  const handleSendEmail = () => {
    const subject = `Pedido #${order.numero || order.id} - Adega Di Vinno`
    const body = `
Olá ${order.cliente?.nome || 'Cliente'},

Segue em anexo os detalhes do seu pedido:

Pedido: #${order.numero || order.id}
Data: ${formatDate(order.data)}
Status: ${order.status}
Total: ${formatCurrency(total)}

Obrigado pela preferência!

Atenciosamente,
Adega Di Vinno
    `.trim()

    const mailtoLink = `mailto:${order.cliente?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  // Compartilhar pedido
  const handleShare = async () => {
    const shareData = {
      title: `Pedido #${order.numero || order.id}`,
      text: `Pedido de ${order.cliente?.nome || 'Cliente'} - Total: ${formatCurrency(total)}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Compartilhamento cancelado')
      }
    } else {
      // Fallback: copiar para clipboard
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Informações do pedido copiadas para a área de transferência!')
      })
    }
  }

  // Gerar HTML para impressão
  const generatePrintHTML = () => {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido #${order.numero || order.id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #8B4513;
            margin-bottom: 10px;
        }
        
        .company-info {
            font-size: 14px;
            color: #666;
        }
        
        .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .info-section {
            flex: 1;
            min-width: 250px;
            margin-bottom: 20px;
        }
        
        .info-section h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #8B4513;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .info-section p {
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .items-table .text-right {
            text-align: right;
        }
        
        .totals {
            margin-left: auto;
            width: 300px;
        }
        
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        
        .totals .total-final {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #333;
            border-bottom: 2px solid #333;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .status-pendente { background-color: #fff3cd; color: #856404; }
        .status-confirmado { background-color: #d1ecf1; color: #0c5460; }
        .status-preparando { background-color: #ffeaa7; color: #d63031; }
        .status-enviado { background-color: #e1bee7; color: #4a148c; }
        .status-entregue { background-color: #d4edda; color: #155724; }
        .status-cancelado { background-color: #f8d7da; color: #721c24; }
        
        @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🍷 Adega Di Vinno</div>
        <div class="company-info">
            Rua dos Vinhos, 123 - Centro<br>
            Tel: (11) 1234-5678 | Email: contato@adegadivinno.com.br
        </div>
    </div>
    
    <div class="order-info">
        <div class="info-section">
            <h3>Informações do Pedido</h3>
            <p><strong>Número:</strong> #${order.numero || order.id}</p>
            <p><strong>Data:</strong> ${formatDate(order.data)}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${order.status?.toLowerCase()}">${order.status}</span></p>
            <p><strong>Vendedor:</strong> ${order.vendedor || 'Sistema'}</p>
        </div>
        
        <div class="info-section">
            <h3>Dados do Cliente</h3>
            <p><strong>Nome:</strong> ${order.cliente?.nome || 'Não informado'}</p>
            <p><strong>Email:</strong> ${order.cliente?.email || 'Não informado'}</p>
            <p><strong>Telefone:</strong> ${order.cliente?.telefone || 'Não informado'}</p>
            <p><strong>Endereço:</strong> ${order.cliente?.endereco || 'Não informado'}</p>
        </div>
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th>Produto</th>
                <th>Código</th>
                <th class="text-right">Qtd</th>
                <th class="text-right">Preço Unit.</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${order.itens?.map(item => `
                <tr>
                    <td>${item.produto || item.nome}</td>
                    <td>${item.codigo || '-'}</td>
                    <td class="text-right">${item.quantidade}</td>
                    <td class="text-right">${formatCurrency(item.precoUnitario)}</td>
                    <td class="text-right">${formatCurrency(item.quantidade * item.precoUnitario)}</td>
                </tr>
            `).join('') || '<tr><td colspan="5">Nenhum item encontrado</td></tr>'}
        </tbody>
    </table>
    
    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">${formatCurrency(subtotal)}</td>
            </tr>
            ${desconto > 0 ? `
            <tr>
                <td>Desconto:</td>
                <td class="text-right">-${formatCurrency(desconto)}</td>
            </tr>
            ` : ''}
            ${frete > 0 ? `
            <tr>
                <td>Frete:</td>
                <td class="text-right">${formatCurrency(frete)}</td>
            </tr>
            ` : ''}
            <tr class="total-final">
                <td>TOTAL:</td>
                <td class="text-right">${formatCurrency(total)}</td>
            </tr>
        </table>
    </div>
    
    ${order.observacoes ? `
    <div style="margin-top: 30px;">
        <h3 style="color: #8B4513; margin-bottom: 10px;">Observações</h3>
        <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #8B4513;">
            ${order.observacoes}
        </p>
    </div>
    ` : ''}
    
    <div class="footer">
        <p>Este documento foi gerado automaticamente pelo sistema Adega Di Vinno</p>
        <p>Data de impressão: ${new Date().toLocaleString('pt-BR')}</p>
    </div>
</body>
</html>
    `
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pedido #{order.numero || order.id}
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Ações
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePrint} disabled={isPrinting}>
                    <Printer className="h-4 w-4 mr-2" />
                    {isPrinting ? 'Imprimindo...' : 'Imprimir'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGeneratePDF} disabled={isGeneratingPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSendEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar por Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6" ref={printRef}>
          {/* Cabeçalho do pedido */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Pedido #{order.numero || order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.data)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Informações do cliente e pedido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.cliente?.nome || 'Nome não informado'}</span>
                </div>
                
                {order.cliente?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.cliente.email}</span>
                  </div>
                )}
                
                {order.cliente?.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.cliente.telefone}</span>
                  </div>
                )}
                
                {order.cliente?.endereco && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.cliente.endereco}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informações do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span>Número: #{order.numero || order.id}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Data: {formatDate(order.data)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Vendedor: {order.vendedor || 'Sistema'}</span>
                </div>
                
                {order.formaPagamento && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Pagamento: {order.formaPagamento}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Itens do pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.itens?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.produto || item.nome}</div>
                          {item.descricao && (
                            <div className="text-sm text-muted-foreground">
                              {item.descricao}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.codigo || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantidade}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.precoUnitario)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.quantidade * item.precoUnitario)}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum item encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Totais */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {desconto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(desconto)}</span>
                  </div>
                )}
                
                {frete > 0 && (
                  <div className="flex justify-between">
                    <span>Frete:</span>
                    <span>{formatCurrency(frete)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {order.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-muted p-4 rounded-lg">
                  {order.observacoes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OrderViewPrint
