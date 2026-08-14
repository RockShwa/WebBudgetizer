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

<main class="min-h-screen bg-black text-white p-6 flex flex-col gap-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">

        <div>
            <h1 class="text-2xl font-bold text-white">
                Manage Income
            </h1>
            <p class="text-xs text-zinc-500 mt-1">
                Manage your income allocation and account balances
            </p>
        </div>

        <a
            href={resolve("/")}
            class="text-xs font-bold tracking-wide uppercase bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-2.5 transition-all active:scale-95"
        >
            Back
        </a>

    </div>

    <!-- Income Percentages -->
    <div class="w-full p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-sm">

        <div class="flex items-center justify-between mb-5">
            <div>
                <h2 class="text-xs font-bold tracking-widest uppercase text-zinc-400">
                    Income Percentages
                </h2>
                <p class="text-xs text-zinc-600 mt-1">
                    Choose how positive income is distributed
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

            <!-- Self Spending -->
            <div class="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                <div class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Self Spending
                </div>

                <div class="flex items-center gap-2">
                    <div 
                        contenteditable="true" 
                        id="editor" 
                        class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#72b0cf] focus:bg-zinc-900 rounded-lg px-3 py-2 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text min-w-[70px] text-lg font-semibold"
                        on:blur={(e) => handleEditedPercentage('UPDATE_PERCENTAGES', "Self Spending", e)}
                    >
                        {selfSpendingPercentage}
                    </div>

                    <span class="text-zinc-500 font-mono">%</span>
                </div>
            </div>

            <!-- Short Term Savings -->
            <div class="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                <div class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Short Term Savings
                </div>

                <div class="flex items-center gap-2">
                    <div 
                        contenteditable="true" 
                        id="editor" 
                        class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#72b0cf] focus:bg-zinc-900 rounded-lg px-3 py-2 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text min-w-[70px] text-lg font-semibold"
                        on:blur={(e) => handleEditedPercentage('UPDATE_PERCENTAGES', "Short Term Savings", e)}
                    >
                        {shortTermSavingsPercentage}
                    </div>

                    <span class="text-zinc-500 font-mono">%</span>
                </div>
            </div>

            <!-- Savings for Others -->
            <div class="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                <div class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Savings for Others
                </div>

                <div class="flex items-center gap-2">
                    <div 
                        contenteditable="true" 
                        id="editor" 
                        class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#72b0cf] focus:bg-zinc-900 rounded-lg px-3 py-2 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text min-w-[70px] text-lg font-semibold"
                        on:blur={(e) => handleEditedPercentage('UPDATE_PERCENTAGES', "Savings for Others", e)}
                    >
                        {savingsOthersPercentage}
                    </div>

                    <span class="text-zinc-500 font-mono">%</span>
                </div>
            </div>

        </div>
    </div>

    <!-- Transactions + Quick Tip -->
    <div class="flex flex-col lg:flex-row gap-6 items-start">

        <!-- Transactions -->
        <div class="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">

            <div class="p-4 border-b border-zinc-800 bg-zinc-900/40">
                <h2 class="text-xs font-bold tracking-widest uppercase text-zinc-400">
                    Income Transactions
                </h2>
                <p class="text-xs text-zinc-600 mt-1">
                    Positive transactions included in income allocation
                </p>
            </div>

            <table class="w-full border-collapse text-left text-sm">
                <thead>
                    <tr class="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                        <th class="p-4">Timestamp</th>
                        <th class="p-4">Amount</th>
                        <th class="p-4">Description</th>
                        <th class="p-4">Donated?</th>
                        <!-- donated
                         1. when check box clicked, send that to the lovely database (ew) 
                         2. add right click box with percentage of income to be donated & invested long term
                         3. add percentage boxes & patch updates for donation and long term investment 
                         -->
                    </tr>
                </thead>

                <tbody class="divide-y divide-zinc-900">
                    {#each positiveTransactions as t (t.id)}
                    <tr class="hover:bg-zinc-900/40 transition-colors duration-150 group">

                        <td class="p-4 text-zinc-400 font-mono text-xs">
                            {new Date(t.timestamp).toLocaleString()}
                        </td>
                        
                        <td class="p-4 text-white font-semibold">
                            ${t.amount}
                        </td>
                        
                        <td class="p-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            {t.description}
                        </td>

                        <!-- TODO: Handle donation check here -->
                        <td class="p-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            <input 
                                type="checkbox" 
                                id="donated"
                                class="accent-[#72b0cf] cursor-pointer"
                            >
                        </td>

                    </tr>
                    {/each}
                </tbody>
            </table>

        </div>

        <!-- Quick Tip -->
        <div class="w-full lg:w-64 shrink-0 bg-zinc-900/30 border-l-2 border-[#72b0cf] p-4 rounded-r-xl text-xs text-zinc-400 flex flex-col gap-2 leading-relaxed">

            <span class="font-bold text-white uppercase tracking-wider mb-1 block">
                Quick Tip
            </span>

            <p>
                Edit any of the
                <span class="text-[#72b0cf] font-semibold">income percentages</span>
                above to change how income is distributed.
            </p>

            <p>
                Only
                <span class="text-[#72b0cf] font-semibold">positive transactions</span>
                are currently included in the income allocation.
            </p>

        </div>

    </div>

    <!-- Account Balances -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Checking Account -->
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">

            <div class="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div>
                    <h2 class="text-xs font-bold tracking-widest uppercase text-zinc-400">
                        Checking Account
                    </h2>
                </div>

                <span class="text-[10px] font-mono uppercase tracking-wider text-[#72b0cf]">
                    Checking
                </span>
            </div>

            <div class="p-5 flex flex-col gap-5">

                <div>
                    <div class="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                        Total Balance
                    </div>

                    <div class="text-3xl font-bold text-white font-mono">
                        ${(checkingBalance + selfSpending).toFixed(2)}
                    </div>
                </div>

                <div class="h-px bg-zinc-800"></div>

                <div class="flex items-center justify-between">
                    <span class="text-sm text-zinc-400">
                        Personal Spending
                    </span>

                    <span class="text-sm font-semibold text-[#72b0cf] font-mono">
                        ${selfSpending.toFixed(2)}
                    </span>
                </div>

            </div>
        </div>

        <!-- Savings Account -->
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">

            <div class="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div>
                    <h2 class="text-xs font-bold tracking-widest uppercase text-zinc-400">
                        Savings Account
                    </h2>
                </div>

                <span class="text-[10px] font-mono uppercase tracking-wider text-[#72b0cf]">
                    Savings
                </span>
            </div>

            <div class="p-5 flex flex-col gap-5">

                <div>
                    <div class="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                        Total Balance
                    </div>

                    <div class="text-3xl font-bold text-white font-mono">
                        ${(shortTermSavings + savingsOthers).toFixed(2)}
                    </div>
                </div>

                <div class="h-px bg-zinc-800"></div>

                <div class="flex items-center justify-between">
                    <span class="text-sm text-zinc-400">
                        Short Term Savings
                    </span>

                    <span class="text-sm font-semibold text-[#72b0cf] font-mono">
                        ${shortTermSavings.toFixed(2)}
                    </span>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-sm text-zinc-400">
                        Savings for Others
                    </span>

                    <span class="text-sm font-semibold text-[#72b0cf] font-mono">
                        ${savingsOthers.toFixed(2)}
                    </span>
                </div>

            </div>
        </div>

    </div>

</main>

<style>
    /* Force the browser's native engine into dark mode for form controls */
    select {
        color-scheme: dark;
    }

    :global(select option) {
        background-color: #09090b !important;
        color: #ffffff !important;
    }
</style>