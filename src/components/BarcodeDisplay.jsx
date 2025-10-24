import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Componente para exibição de código de barras
 * @param {Object} props - Propriedades do componente
 * @param {string} props.value - Valor do código de barras (ex: código EAN-13)
 * @param {string} props.format - Formato do código de barras (default: 'EAN13')
 * @param {string} props.text - Texto a ser exibido abaixo do código (opcional)
 * @param {number} props.width - Largura das barras (default: 2)
 * @param {number} props.height - Altura das barras (default: 100)
 * @param {string} props.displayValue - Se deve exibir o valor abaixo do código (default: true)
 * @param {string} props.className - Classes CSS adicionais
 */
const BarcodeDisplay = ({ 
  value, 
  format = 'EAN13', 
  text,
  width = 2,
  height = 100,
  displayValue = true,
  className = ''
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        // Configurar e renderizar o código de barras
        JsBarcode(canvasRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: 16,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
          textMargin: 2,
          valid: (valid) => {
            if (!valid) {
              console.error('Código de barras inválido:', value);
            }
          }
        });
      } catch (error) {
        console.error('Erro ao gerar código de barras:', error);
      }
    }
  }, [value, format, width, height, displayValue]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4 flex flex-col items-center">
        <canvas ref={canvasRef} className="w-full" />
        {text && (
          <div className="text-center mt-2 text-sm text-gray-600">
            {text}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarcodeDisplay;
