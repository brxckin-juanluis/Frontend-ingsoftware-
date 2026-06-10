import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TicketPrint = React.forwardRef(({ ticketData }, ref) => {
  if (!ticketData) return null;

  const { placa, qrString, fechaEntrada } = ticketData;
  const displayTime = new Date(fechaEntrada).toLocaleString();

  return (
    <div ref={ref} className="p-8 bg-white text-black w-[80mm] mx-auto border border-gray-200">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase tracking-widest">SmartParking</h1>
        <p className="text-xs text-gray-600">Comprobante de Entrada</p>
      </div>

      <div className="border-t border-b border-dashed border-gray-400 py-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-bold uppercase">Placa:</span>
          <span className="text-sm font-black">{placa}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold uppercase">Entrada:</span>
          <span className="text-xs">{displayTime}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="bg-white p-2 border border-gray-100">
          <QRCodeSVG value={qrString} size={150} level="H" />
        </div>
        <p className="text-[10px] text-gray-500 font-mono">{qrString}</p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] uppercase font-bold text-gray-700 mb-1">No pierda este ticket</p>
        <p className="text-[9px] text-gray-500">Escanee para realizar el pago al salir</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-[8px] text-center text-gray-400">
        &copy; {new Date().getFullYear()} SmartParking Systems
      </div>
    </div>
  );
});

export default TicketPrint;