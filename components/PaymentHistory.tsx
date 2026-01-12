import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar, ArrowUpRight } from 'lucide-react';
import { Transaction, getTransactions } from '../services/transactionService';

const PaymentHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        getTransactions().then(setTransactions);
    }, []);

    const handleDownloadInvoice = (tx: Transaction) => {
        // Create a printable window
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date(tx.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${tx.id}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-start; }
                        .logo { font-size: 24px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: -1px; }
                        .invoice-badge { background: #f0fdf4; color: #166534; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
                        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .meta-group h3 { font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 5px; }
                        .meta-group p { font-size: 14px; font-weight: 600; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        .table th { text-align: left; padding: 15px; border-bottom: 1px solid #eee; font-size: 12px; text-transform: uppercase; color: #999; }
                        .table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
                        .total { text-align: right; font-size: 24px; font-weight: 900; }
                        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">AICrator Studio</div>
                        <div class="invoice-badge">Paid</div>
                    </div>

                    <div class="meta">
                        <div class="meta-group">
                            <h3>Billed To</h3>
                            <p>Valued Customer</p>
                        </div>
                        <div class="meta-group">
                            <h3>Invoice Details</h3>
                            <p>No: ${tx.id}</p>
                            <p>Date: ${date}</p>
                            <p>Method: ${tx.method}</p>
                        </div>
                    </div>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${tx.description} (${tx.tokens} Tokens)</td>
                                <td>${tx.amount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total">
                        Total: ${tx.amount.toLocaleString()}
                    </div>

                    <div class="footer">
                        Thank you for your business. This is a computer-generated receipt.
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No payment history yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 rounded-3xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
                <FileText className="text-purple-400" />
                <h3 className="font-bold text-white">Payment History</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                            <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Date</th>
                            <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Description</th>
                            <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Tokens</th>
                            <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                            <th className="p-5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                            <th className="p-5 font-bold uppercase tracking-wider text-[10px] text-right">Invoice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="text-slate-300 hover:bg-slate-800/30 transition-colors">
                                <td className="p-5">
                                    <div className="font-medium text-white">
                                        {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="p-5 font-medium">{tx.description}</td>
                                <td className="p-5">
                                    <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold">
                                        <ArrowUpRight size={10} /> {tx.tokens}
                                    </span>
                                </td>
                                <td className="p-5 font-bold text-white">${tx.amount.toLocaleString()}</td>
                                <td className="p-5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                        Success
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <button
                                        onClick={() => handleDownloadInvoice(tx)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        <Download size={14} /> PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistory;
