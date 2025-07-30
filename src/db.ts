import Dexie from "dexie";

// Define our transaction type (our own interface, not Dexie's)
export interface Transaction {
  id?: number;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
}

// Create Dexie database
class BudgetDB extends Dexie {
  transactions!: Dexie.Table<Transaction, number>;

  constructor() {
    super("BudgetDB");
    this.version(1).stores({
      transactions: "++id,type,category,description,amount,date",
    });
  }
}

export const db = new BudgetDB();
