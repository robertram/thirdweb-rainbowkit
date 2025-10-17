import * as React from 'react';
// import WalletSelector from './WalletSelector';

const mockAssets = [
  { symbol: 'ETH-USD', name: 'Ethereum', price: 3000 },
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 60000 },
];

const mockWallets = [
  { id: 1, name: 'Examen 1', type: 'demo' },
  { id: 2, name: 'Examen 2', type: 'demo' },
  { id: 3, name: 'Cuenta Real', type: 'real' },
];

const mockOrders = [
  { id: 1, symbol: 'ETH-USD', side: 'Long', size: 1, leverage: 5, status: 'Open' },
  { id: 2, symbol: 'BTC-USD', side: 'Short', size: 0.5, leverage: 3, status: 'Filled' },
];

export default function TradeTab() {
  const [selectedWallet, setSelectedWallet] = React.useState(mockWallets[0].id);
  const [selectedAsset, setSelectedAsset] = React.useState(mockAssets[0].symbol);
  const [side, setSide] = React.useState('Long');
  const [orderType, setOrderType] = React.useState('Market');
  const [leverage, setLeverage] = React.useState(1);
  const [size, setSize] = React.useState('');
  const [stopLoss, setStopLoss] = React.useState('');
  const [takeProfit, setTakeProfit] = React.useState('');
  const [limitPrice, setLimitPrice] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la orden
    alert('Orden enviada (mock)');
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Trade</h2>
      {/* Selección de smart wallet */}
      {/* <WalletSelector
        wallets={mockWallets}
        selectedWallet={selectedWallet}
        onSelect={setSelectedWallet}
      /> */}
      {/* Formulario de trading */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Activo</label>
          <select
            className="w-full border rounded p-2"
            value={selectedAsset}
            onChange={e => setSelectedAsset(e.target.value)}
          >
            {mockAssets.map(a => (
              <option key={a.symbol} value={a.symbol}>
                {a.name} ({a.symbol}) - ${a.price}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" className={`flex-1 p-2 rounded ${side === 'Long' ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setSide('Long')}>Long</button>
          <button type="button" className={`flex-1 p-2 rounded ${side === 'Short' ? 'bg-red-500 text-white' : 'bg-gray-200'}`} onClick={() => setSide('Short')}>Short</button>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Tipo de Orden</label>
          <select className="w-full border rounded p-2" value={orderType} onChange={e => setOrderType(e.target.value)}>
            <option value="Market">Market</option>
            <option value="Limit">Limit</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Tamaño</label>
          <input type="number" className="w-full border rounded p-2" value={size} onChange={e => setSize(e.target.value)} min="0" step="any" required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Apalancamiento</label>
          <input type="number" className="w-full border rounded p-2" value={leverage} onChange={e => setLeverage(Number(e.target.value))} min="1" max="20" required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Stop Loss (opcional)</label>
          <input type="number" className="w-full border rounded p-2" value={stopLoss} onChange={e => setStopLoss(e.target.value)} min="0" step="any" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Take Profit (opcional)</label>
          <input type="number" className="w-full border rounded p-2" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} min="0" step="any" />
        </div>
        {orderType === 'Limit' && (
          <div>
            <label className="block mb-1 font-semibold">Precio Límite</label>
            <input type="number" className="w-full border rounded p-2" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} min="0" step="any" required />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">Enviar Orden</button>
      </form>
      {/* Órdenes abiertas */}
      <div className="mt-8">
        <h3 className="font-bold mb-2">Órdenes abiertas</h3>
        <ul>
          {mockOrders.map(o => (
            <li key={o.id} className="border-b py-2 flex justify-between">
              <span>{o.symbol} {o.side} x{o.size} Lev:{o.leverage}</span>
              <span className="text-xs">{o.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 