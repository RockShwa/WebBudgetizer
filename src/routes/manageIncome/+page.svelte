<script lang="ts">
    import { resolve } from '$app/paths';
    import type { Transaction } from '$lib/classes/Transaction';
    import type { Category } from '$lib/classes/Category';
    import type { Percentage } from '$lib/classes/Percentage';
    import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

    export let data: { 
        transactionData: Transaction[];
        categoryData: Category[];
        percentageData: Percentage[];
    };

    $: percentageData = data.percentageData ?? [];

    $: categoryData = data.categoryData ?? [];

    let selfSpending: number = 0;
    let shortTermSavings: number = 0;
    let savingsOthers: number = 0;

    let selectedMonth = "";
    let selectedYear = "";

    onMount(() => {
        createMonthOptions();
        createYearOptions();
    });

    $: selfSpendingPercentage = Number(percentageData.find(p => p.category === "Self Spending")?.percentage);
    $: shortTermSavingsPercentage = Number(percentageData.find(p => p.category === "Short Term Savings")?.percentage);
    $: savingsOthersPercentage = Number(percentageData.find(p => p.category === "Savings for Others")?.percentage);

    // TODO this should be displayed if I right click on an income amount (should be an instructions box somewhere)
    $: donationsPercentage = Number(percentageData.find(p => p.category === "Donation")?.percentage);;
    $: longTermSavingsPercentage = Number(percentageData.find(p => p.category === "Long Term Savings")?.percentage);;


    // let startingCheckingBalance = 0;
    // let startingSavingsBalance = 0;

    let checkingBalance = 0;

    $: transactionData = data.transactionData ?? [];
    let positiveTransactions: Transaction[] = [];

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

    $: {
        checkingBalance = 0;
        // for each transaction, I want to look at the category and then determine which income category it subtracts from
        for (const transaction of transactionData) {

            for (const category of categoryData) {
                if (transaction.category.startsWith(category.name)) {
                    if (category.includedInChecking) {
                        checkingBalance = checkingBalance + transaction.amount;
                    } else if (cateegory.includedInSavings) {
                        savingsOthers = savingsOthers + transaction.amount;
                    }
                }
            }

            // iterate through each category: if includesWithChecking is checked, add to checkingBalance. If savings checked, add to savingsBalance
            if (!transaction.category.startsWith("Gift") && !transaction.category.startsWith("Income") && !transaction.category.startsWith("Savings")) {
                checkingBalance = checkingBalance + transaction.amount;
            } else if (transaction.category.startsWith("Gift")) {
                savingsOthers = savingsOthers + transaction.amount;
            }
        }
    }

    function createMonthOptions() {
        const monthSelect = document.getElementById('month-select');
        const addedMonths = new SvelteSet<number>(); // track months added

        for (const t of transactionData) {
            const month = new Date(t.timestamp).getMonth(); 
            if (!addedMonths.has(month)) {
                const opt = document.createElement('option');
                opt.textContent = new Date(t.timestamp).toLocaleString('default', {month: 'long'});
                monthSelect?.appendChild(opt);
                addedMonths.add(month)
            }
        }
    }

    function createYearOptions() {
        const yearSelect = document.getElementById('year-select');
        const addedYears = new SvelteSet<number>(); // track months added

        for (const t of transactionData) {
            const year = new Date(t.timestamp).getFullYear(); 
            if (!addedYears.has(year)) {
                const opt = document.createElement('option');
                opt.textContent = new Date(t.timestamp).getFullYear().toString();
                yearSelect?.appendChild(opt);
                addedYears.add(year)
            }
        }
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];

    $: filteredTransactions = transactionData.filter((t: Transaction) => {
            if (!t.timestamp) return false;
        
            const isCorrectMonth = new Date(t.timestamp).getMonth() === monthNames.indexOf(selectedMonth);
            const isCorrectYear = new Date(t.timestamp).getFullYear() === parseFloat(selectedYear);
            return isCorrectYear && isCorrectMonth;
    });  

    // CHANGE TO TRANSACTION.CATEGORY.startsWith("Income") AFTER TESTING WITH THIS TRANSACTION SET SO IMPORTANT
    $: positiveTransactions = filteredTransactions.filter(
        (transaction) => transaction.amount > 0
    );

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

    async function handleDonationCheckChange(action: string, event: Event, id: number) {
        let bitDonated = Number(transactionData.find(t => t.id === id)?.donated)

        if (bitDonated === 0) {
            bitDonated = 1;
        } else {
            bitDonated = 0;
        }
        
        if (action === 'UPDATE_DONATION') {
            // query database with input
            await fetch('/api/manageIncome', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'UPDATE_DONATION',
                    transactionID: id,
                    isDonated: bitDonated
                })
            });
        }
    }

    let showMenu = false;
    let pos = { x: -9999, y: -9999 };
    let selectedTransaction: Transaction | null = null;
    let menuEl: HTMLDivElement;

    function handleRightClick(e: MouseEvent, t: Transaction) {
        
        showMenu = true;
        selectedTransaction = t;

        if (menuEl) {
            const { width, height } = menuEl.getBoundingClientRect();
            pos = getMenuPosition(e.clientX, e.clientY, width, height);
        }
    }

    function getMenuPosition(x: number, y: number, menuWidth: number, menuHeight: number) {
        const padding = 14;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = x;
        let top = y;

        if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - padding;
        }
        if (top + menuHeight > viewportHeight) {
            top = y - menuHeight;
        }
        if (top < padding) top = padding;
        if (left < padding) left = padding;

        return { x: left, y: top };
    }

    function handleWindowClick() {
        if (showMenu) {
            showMenu = false;
            selectedTransaction = null;
        }
    }

</script>

<svelte:head>
    <title>Manage Income | FreeBudgetPro</title>
</svelte:head>

<svelte:window on:click={handleWindowClick} on:scroll={handleWindowClick}/>

<main class="min-h-screen bg-black text-white p-6 flex flex-col gap-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">

        <div>
            <h1 class="text-2xl font-bold text-white">
                Manage <span class="text-[#72b0cf] font-bold">Income</span>
            </h1>
            <p class="text-xs text-zinc-500 mt-1">
                Manage your income allocation and account balances
            </p>
        </div>

        <div class="flex gap-2">
            <a
                href={resolve("/settings")}
                class="text-xs font-bold tracking-wide uppercase bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-2.5 transition-all active:scale-95"
            >
                Settings
            </a>

            <a
                href={resolve("/")}
                class="text-xs font-bold tracking-wide uppercase bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-2.5 transition-all active:scale-95"
            >
                Back
            </a>
        </div>

    </div>

    <!-- Income Percentages -->
    <div class="w-full p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-sm">

        <div class="flex items-center justify-between mb-5">
            <div>
                <h2 class="text-xs font-bold tracking-widest uppercase text-zinc-400">
                    Income Percentages
                </h2>
                <p class="text-xs text-zinc-600 mt-1">
                    Choose how income is distributed
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

            <!-- Donation -->
            <div class="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                <div class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Donation
                </div>

                <div class="flex items-center gap-2">
                    <div 
                        contenteditable="true" 
                        id="editor" 
                        class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#72b0cf] focus:bg-zinc-900 rounded-lg px-3 py-2 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text min-w-[70px] text-lg font-semibold"
                        on:blur={(e) => handleEditedPercentage('UPDATE_PERCENTAGES', "Donation", e)}
                    >
                        {donationsPercentage}
                    </div>

                    <span class="text-zinc-500 font-mono">%</span>
                </div>
            </div>

            <!-- Long Term Savings -->
            <div class="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                <div class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Long Term Savings
                </div>

                <div class="flex items-center gap-2">
                    <div 
                        contenteditable="true" 
                        id="editor" 
                        class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#72b0cf] focus:bg-zinc-900 rounded-lg px-3 py-2 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text min-w-[70px] text-lg font-semibold"
                        on:blur={(e) => handleEditedPercentage('UPDATE_PERCENTAGES', "Long Term Savings", e)}
                    >
                        {longTermSavingsPercentage}
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

            <div class="p-4 border-b border-zinc-800 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-4">

                <div>
                    <h2 class="text-xs font-bold tracking-widest uppercase text-zinc-400">
                        Income Statements
                    </h2>
                    <p class="text-xs text-zinc-600 mt-1">
                        Positive transactions included in income allocation
                    </p>
                </div>

                <!-- month and year stuff -->
                <div class="flex items-center gap-3">
                    <label class="text-xs font-bold tracking-wide uppercase bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2 text-zinc-400 focus-within:border-[#72b0cf] transition-colors cursor-pointer">
                        Month
                        <select class="bg-transparent text-white font-medium outline-none ml-1 cursor-pointer" id="month-select" bind:value={selectedMonth}></select>
                    </label>

                    <label class="text-xs font-bold tracking-wide uppercase bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2 text-zinc-400 focus-within:border-[#72b0cf] transition-colors cursor-pointer">
                        Year
                        <select class="bg-transparent text-white font-medium outline-none ml-1 cursor-pointer" id="year-select" bind:value={selectedYear}></select>
                    </label>
                </div>

            </div>

            <table class="w-full border-collapse text-left text-sm">
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

                        <td class="p-4 text-zinc-400 font-mono text-xs">
                            {new Date(t.timestamp).toLocaleString()}
                        </td>
                        
                        <td class="p-4 text-white font-semibold"
                            on:contextmenu|preventDefault|stopPropagation={(e) => handleRightClick(e, t)}
                        >
                            ${t.amount}
                        </td>
                        
                        <td class="p-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            {t.description}
                        </td>

                        <td class="p-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            <input 
                                type="checkbox" 
                                id="donated"
                                class="accent-[#72b0cf] cursor-pointer"
                                checked = {Boolean(t.donated)}
                                on:change={(e) => handleDonationCheckChange("UPDATE_DONATION", e, t.id)}
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
                <span class="text-[#72b0cf] font-semibold">Right click</span>
                on an income statement's <span class="text-[#72b0cf] font-semibold">amount</span> to see the portion of it needed to be donated and invested in the long term
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

    {#if showMenu && selectedTransaction != null} 
        <div
            bind:this={menuEl}
            class="fixed z-50 bg-zinc-950/95 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-zinc-800/80 rounded-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 w-52 overflow-hidden"
            style="top: {pos.y}px; left: {pos.x}px;"
        >
            <div class="p-3 border-b border-zinc-800 bg-zinc-900/50">
                <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Donation & Long Term Savings
                </span>
            </div>

            <div class="p-3 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-zinc-400">Donation</span>
                    <span class="text-xs font-semibold text-[#72b0cf] font-mono">
                        ${(selectedTransaction.amount * donationsPercentage / 100).toFixed(2)}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-zinc-400">Long Term Savings</span>
                    <span class="text-xs font-semibold text-[#72b0cf] font-mono">
                        ${(selectedTransaction.amount * longTermSavingsPercentage / 100).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    {/if}    

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