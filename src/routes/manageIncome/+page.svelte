<script lang="ts">
    //import { resolve } from '$app/paths';
	import type { Transaction } from '$lib/classes/Transaction';
	import type { Category } from '$lib/classes/Category';

    let selfSpending: number = 0;
    let shortTermSavings: number = 0;
    let savingsOthers: number = 0;

    let selfSpendingPercentage = 10;
    let shortTermSavingsPercentage = 10;
    let savingsOthersPercentage = 30;
    // TODO this should be displayed if I right click on an income amount (should be an instructions box somewhere)
    // let donationsPercentage = 30;
    // let longTermSavingsPercentage = 20;

    let startingCheckingBalance = 0;
    let startingSavingsBalance = 0;

    export let data: { 
        transactionData: Transaction[];
        categoryData: Category[];
    };

    $: transactionData = data.transactionData ?? [];
    let positiveTransactions: Transaction[] = [];

    $: positiveTransactions = transactionData.filter(
        (transaction) => transaction.amount > 0
    );

    $: for (const transaction of positiveTransactions) {
        selfSpending = selfSpending + transaction.amount * (selfSpendingPercentage / 100);
        shortTermSavings = selfSpending + transaction.amount * (shortTermSavingsPercentage / 100);
        savingsOthers = selfSpending + transaction.amount * (savingsOthersPercentage / 100);
    }

    // function handleEditedPercentage() {
        // REMEMBER TO SAVE PERCENTAGE IN DATABASE
    // }
</script>

<svelte:head>
    <title>Manage Income | FreeBudgetPro</title>
</svelte:head>

<main>

   <h1 class="text-2xl">
        Manage Income
   </h1>

   <div>
        <div>
            Income Percentages
            <div>
                Self Spending:
                <div 
                    contenteditable="true" 
                    id="editor" 
                    class="bg-zinc-950/40 border border-zinc-800/60 focus:border-[#72b0cf] focus:bg-zinc-900 rounded px-2 py-1 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text inline-block min-w-[60px]"
                    >
                    {selfSpendingPercentage}
                </div>
                %
            </div>
            
            <div>
                Self Spending:
                <div 
                    contenteditable="true" 
                    id="editor" 
                    class="bg-zinc-950/40 border border-zinc-800/60 focus:border-[#72b0cf] focus:bg-zinc-900 rounded px-2 py-1 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text inline-block min-w-[60px]"
                    >
                    {shortTermSavingsPercentage}
                </div>
                %
            </div>

            <div>
                Self Spending:
                <div 
                    contenteditable="true" 
                    id="editor" 
                    class="bg-zinc-950/40 border border-zinc-800/60 focus:border-[#72b0cf] focus:bg-zinc-900 rounded px-2 py-1 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text inline-block min-w-[60px]"
                    >
                    {savingsOthersPercentage}
                </div>
                %
            </div>
        </div>

        <table>
            <thead>
                <tr class="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                    <th class="p-4">Timestamp</th>
                    <th class="p-4">Amount</th>
                    <th class="p-4">Description</th>
                    <th class="p-4">Donated?</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-zinc-900">
                {#each positiveTransactions as t (t.id)}
                <tr class="hover:bg-zinc-900/40 transition-colors duration-150 group">
                    <td class="p-4 text-zinc-400 font-mono text-xs">{new Date(t.timestamp).toLocaleString()}</td>
                    
                    <td class="p-4 text-white font-semibold">${t.amount}</td>
                    
                    <td class="p-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">{t.description}</td>

                    <!-- TODO: Handle donation check here -->
                    <td class="p-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <input type="checkbox" id="donated">
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
   </div>

   <div>
        Checking Account

        <div>
            Total Balance: {(startingCheckingBalance + selfSpending).toFixed(2)}
        </div>

        <div>
            Personal Spending: {selfSpending.toFixed(2)}
        </div>
   </div>

   <!-- Find a way to update your savings account? Will probably have to keep a set balance and then if there's income transfer
    from a savings account deduct -->
   <div>
        Savings Account

        <div>
            Total Balance: {(startingSavingsBalance + shortTermSavings + savingsOthers).toFixed(2)}
        </div>

        <div>
            Short Term Savings: {shortTermSavings.toFixed(2)}
        </div>

        <div>
            Savings for Others: {savingsOthers.toFixed(2)}
        </div>
   </div>

</main>