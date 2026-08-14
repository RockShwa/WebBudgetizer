<script lang="ts">
    import { resolve } from '$app/paths';
	import type { Transaction } from '$lib/classes/Transaction';
	import type { Category } from '$lib/classes/Category';
    import type { Percentage } from '$lib/classes/Percentage';
    import { invalidateAll } from '$app/navigation';

    export let data: { 
        transactionData: Transaction[];
        categoryData: Category[];
        percentageData: Percentage[];
    };

    $: percentageData = data.percentageData ?? [];

    let selfSpending: number = 0;
    let shortTermSavings: number = 0;
    let savingsOthers: number = 0;

    $: selfSpendingPercentage = Number(percentageData.find(p => p.category === "Self Spending")?.percentage);
    $: shortTermSavingsPercentage = Number(percentageData.find(p => p.category === "Short Term Savings")?.percentage);
    $: savingsOthersPercentage = Number(percentageData.find(p => p.category === "Savings for Others")?.percentage);

    // TODO this should be displayed if I right click on an income amount (should be an instructions box somewhere)
    // let donationsPercentage = 30;
    // let longTermSavingsPercentage = 20;

    // let startingCheckingBalance = 0;
    // let startingSavingsBalance = 0;

    let checkingBalance = 0;

    $: transactionData = data.transactionData ?? [];
    let positiveTransactions: Transaction[] = [];

    // CHANGE TO TRANSACTION.CATEGORY.startsWith("Income") AFTER TESTING WITH THIS TRANSACTION SET SO IMPORTANT
    $: positiveTransactions = transactionData.filter(
        (transaction) => transaction.amount > 0
    );

    $: {
        // reset so we dont double count when smth changes
        selfSpending = 0;
        shortTermSavings = 0;
        savingsOthers = 0;

        for (const transaction of positiveTransactions) {
            selfSpending = selfSpending + transaction.amount * (selfSpendingPercentage / 100);
            shortTermSavings = shortTermSavings + transaction.amount * (shortTermSavingsPercentage / 100);
            savingsOthers = savingsOthers + transaction.amount * (savingsOthersPercentage / 100);
        }
    }

    // eventually I need to make a settings option where the user can select what categories they want to be a part of which income categrory
    $: {
        checkingBalance = 0;
        // for each transaction, I want to look at the category and then determine which income category it subtracts from
        // save to database
        for (const transaction of transactionData) {
            if (!transaction.category.startsWith("Gift") && !transaction.category.startsWith("Income") && !transaction.category.startsWith("Savings")) {
                checkingBalance = checkingBalance + transaction.amount;
            } else if (transaction.category.startsWith("Gift")) {
                savingsOthers = savingsOthers + transaction.amount;
            }
        }
    }

    async function handleEditedPercentage(action: string, categoryName: string, event: Event) {
        const element = event.target as HTMLElement;
        const newPercentage = Number(element.innerText);

        if (action === 'UPDATE_PERCENTAGES') {
            // query database with input
            await fetch('/api/manageIncome', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'UPDATE_PERCENTAGES',
                    incomeCategory: categoryName,
                    percentage: newPercentage
                })
            });
        }

        await invalidateAll();
    }
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
                    on:blur={(e) => handleEditedPercentage('UPDATE_PERCENTAGES', "Self Spending", e)}
                    >
                    {selfSpendingPercentage}
                </div>
                %
            </div>
            
            <div>
                Short Term Savings:
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
                Savings for Others:
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
        <!-- This should work because checkingBalance sums up everything supposed to go into checking EXCEPT income so we add income here -->
            Total Balance: {(checkingBalance + selfSpending).toFixed(2)}
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
        <!-- Here though, when I add a gift, I want it to subtract from savingsOthers so we add shortTermSavings and savingsOthers for the total -->
            Total Balance: {(shortTermSavings + savingsOthers).toFixed(2)}
        </div>

        <div>
            Short Term Savings: {shortTermSavings.toFixed(2)}
        </div>

        <div>
            Savings for Others: {savingsOthers.toFixed(2)}
        </div>
   </div>

   <a href={resolve("/")} class="text-xs font-bold tracking-wide uppercase bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-2.5 transition-all active:scale-95">
        Back
    </a>

</main>