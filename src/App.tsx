import { useEffect, useState } from "react";
import { db } from "./db";
import type { Transaction } from "./db";  // ✅ type import
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./styles.css";


export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({ type: "income", category: "", description: "", amount: "", date: "" });
  // const [categories, setCategories] = useState<string[]>(["Salary", "Rent", "Groceries"]);
  const COLORS = ["#00C49F", "#FF8042", "#FFBB28", "#0088FE", "#FF4444"];

  useEffect(() => {
    db.transactions.toArray().then(setTransactions);
  }, []);

  const addTransaction = async () => {
    if (!form.category || !form.amount || !form.date) return;
    const newTx: Transaction = {
      type: form.type as "income" | "expense",
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
    };
    await db.transactions.add(newTx);
    setTransactions(await db.transactions.toArray());
    setForm({ type: "income", category: "", description: "", amount: "", date: "" });
  };

  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  const breakdownData = Object.values(
    transactions.filter(t => t.type === "expense")
      .reduce((acc, tx) => {
        acc[tx.category] = acc[tx.category] || { name: tx.category, value: 0 };
        acc[tx.category].value += tx.amount;
        return acc;
      }, {} as Record<string, { name: string; value: number }>)
  );

  return (
        <div className="app-container">
  <h1 className="app-title">Mini Budget Planner - logged in as Vishal</h1>

  {/* Add Transaction */}
  <div className="transaction-box">
    <h2 className="transaction-title">Add Transaction</h2>
    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input">
      <option value="income">Income</option>
      <option value="expense">Expense</option>
    </select>
    <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input" />
    <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" />
    <input placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input" />
    <input placeholder="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input" />
    <button onClick={addTransaction} className="button">Add</button>
  </div>

  {/* Row Layout */}
  <div className="row">
    {/* Summary */}
    <div className="card">
      <h2 className="card-title">Summary</h2>
      <p>Income: ₹{income}</p>
      <p>Expenses: ₹{expenses}</p>
      <p>Balance: ₹{balance}</p>
    </div>

    {/* Transactions */}
    <div className="card">
      <h2 className="card-title">Recent Transactions</h2>
      <ul>
        {transactions.slice().reverse().map((tx) => (
          <li key={tx.id} className="transaction-list">
            <span>{tx.type === "income" ? "[+]" : "[-]"} {tx.category} - {tx.description}</span>
            <span>₹{tx.amount}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Pie Chart */}
    <div className="card">
      <h2 className="card-title">Spending Breakdown</h2>
      {breakdownData.length > 0 ? (
        <PieChart width={250} height={250}>
          <Pie data={breakdownData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
            {breakdownData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      ) : (
        <p style={{ color: "#888", fontSize: "14px" }}>No data to display</p>
      )}
    </div>
  </div>
</div>

  );
}
