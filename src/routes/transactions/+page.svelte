<script lang="ts">
    import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
    import { onMount } from 'svelte';
	import type { Transaction } from '$lib/classes/Transaction';
	import type { Category } from '$lib/classes/Category';

    export let data: { 
        transactionData: Transaction[];
        categoryData: Category[];
    };

    onMount(() => {
        createMonthOptions();
        createYearOptions();
    });

    let transactionData = data.transactionData ?? [];

    let categoryData = data.categoryData ?? [];

    let file: File | undefined;

    let selectedMonth = "July";
    let selectedYear = "2024";

    export function navigateBack() {
        history.go(-1);
    }

    export function sortTime(transactions: Transaction[]) {
        // if transsactions less than 1, no need to sort so exit method
        if (transactions.length <= 1) return transactions;
    
        let result: Transaction[]=[];
        let left;
        let right;

        // recursively slice the arrays in half
        let mid = Math.floor(transactions.length / 2);
        left = sortTime(transactions.slice(0, mid));
        right = sortTime(transactions.slice(mid));

        // create indicies
        let i: number = 0;
        let j: number = 0;

        // as long as the indicies are less than right and left's length, 
        // the originial array is set equal to the left if it's
        // less than the right, and vice versa

        while (i < left.length && j < right.length) {
            if (new Date(left[i].timestamp) < new Date(right[j].timestamp)) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            } 
        }

        // merge the remaining left and right arrays

        while (i < left.length) {
            result.push(left[i]);
            i++;
        }

        while (j < right.length) {
            result.push(right[j]);
            j++;
        }

        return result;
    }
    

    function handleTimeSort() {
        transactionData = sortTime(transactionData);
    }

    export function sortAmount(transactions: Transaction[]) {
        if (transactions.length <= 1) return transactions;
    
        let result: Transaction[]=[];
        let left;
        let right;
        

        // recursively slice the arrays in half
        let mid = Math.floor(transactions.length / 2);

        left = sortAmount(transactions.slice(0, mid));
        right = sortAmount(transactions.slice(mid));

        // create indicies
        let i: number = 0;
        let j: number = 0;

        // as long as the indicies are less than right and left's length, 
        // we're going to set the originial array equal to the left if it's
        // less than the right, and vice versa

        while (i < left.length && j < right.length) {
            if (left[i].amount < right[j].amount) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            } 
        }

        // merge the remaining left and right arrays

        while (i < left.length) {
            result.push(left[i]);
            i++;
        }

        while (j < right.length) {
            result.push(right[j]);
            j++;
        }

        return result;
    }

    function handleAmountSort() {
        transactionData = sortAmount(transactionData);
    }

    async function uploadFile(e: Event) {
        // get file input from the passed event
        const input = e.target as HTMLInputElement;
        // get the first of the files chosen
        file = input.files?.[0];

        // if it doesn't exist exit method
        if (!file) return;

        // if a csv file isn't chosen, create a pop-up alerting the user and exit method
        if (!file.name.toLowerCase().endsWith(".csv")) {
            alert("Please select a CSV file")
            input.value = "";
            return;
        }

        // attach file in the format of a key value pair (FormData) to the form
        const formData = new FormData();
        formData.append('file', file);
        
        // send that form to the database for storing in the Transaction table
        await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        // reload to ensure upload updates frontend
        location.reload();
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

    let showMenu = false;
    let pos = { x: 0, y: 0 };
    let selectedTransaction: Transaction | null = null;

    function handleRightClick(e: MouseEvent, transaction: Transaction) {

        selectedTransaction = transaction;

        pos = {x: e.clientX, y: e.clientY};
        showMenu = true;
    }

    function closeMenu() {
        showMenu = false;
    }

    async function updateTransactionCategory(transaction: Transaction, categoryName: string) {

        await fetch ('/api/transactions', {
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'UPDATE_CATEGORY_NAME',
                id: transaction.id, 
                category: categoryName,
                amount: transaction.amount
            })
        })

        transactionData = transactionData.map(t => {
            if (t.id === transaction.id) {
                t.category = categoryName;
            }
            return t;
        }) 

        closeMenu();

        addAmountToCategory(transaction, categoryName);
    }

    function getSuggestedCategory(description: string) {
        // get description from input and turn to lowercase
        const desc = description.toLowerCase();
        // define scores: holds the score for each category. the score represents how much a  
        // category fits the description based on user history
        const scores: Record<string, number> = {};

        // for every transaction
        transactionData.forEach(t => {
            // get description
            const historyDesc = t.description.toLowerCase();

            // if historical description is inside the new one or vice versa,
            // increase the score for that category

            if (desc.includes(historyDesc) || historyDesc.includes(desc)) {
                scores[t.category] = scores[t.category] + 1;
            }
        });

        // find category with highest score
        const highest = Object.entries(scores).reduce((max, current) => {
            return current[1] > max[1] ? current: max});

        const bestCategory = highest[0];

        return bestCategory;
    }

    async function addAmountToCategory(transaction: Transaction, categoryName: string) {

            const response = await fetch(`/api/transactions?name=${categoryName}`);
            const catTotal: number = await response.json();
            const newTotal = Number(catTotal) + Number(transaction.amount);

            await fetch ('/api/transactions', {
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'UPDATE_CATEGORY_AMOUNT',
                    id: transaction.id, 
                    category: categoryName,
                    amount: newTotal
                })
            })
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

</script>

<svelte:window on:click={closeMenu} />

<svelte:head>
    <title>Transactions | FreeBudgetPro</title>
</svelte:head>

<div class="min-h-screen bg-black text-white p-6 flex flex-col gap-6">
    
    <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">
        
        <div class="flex flex-wrap items-center gap-2">
            <a href={resolve("/manageCategories")} class="text-xs font-bold tracking-wide uppercase bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#72b0cf] text-zinc-200 hover:text-white rounded-lg px-4 py-2.5 transition-all active:scale-95">
                Manage Categories
            </a>
            
            <label class="text-xs font-bold tracking-wide uppercase bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-zinc-400 focus-within:border-[#72b0cf] transition-colors cursor-pointer">
                Sort
                <select class="bg-transparent text-white font-medium outline-none ml-1 cursor-pointer py-1" on:change={(e) => {
                    const value = (e.target as HTMLSelectElement).value;
                    if (value === "Timestamp") handleTimeSort();
                    if (value === "Amount") handleAmountSort();
                }}>
                    <option value="Timestamp" class="bg-zinc-950 text-white">Timestamp</option>
                    <option value="Amount" class="bg-zinc-950 text-white">Amount</option>
                </select>
            </label>

            <label class="text-xs font-bold tracking-wide uppercase bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#72b0cf] text-zinc-200 hover:text-white rounded-lg px-4 py-2.5 transition-all cursor-pointer active:scale-95">
                Upload
                <input on:change={uploadFile} type="file" id="file" class="hidden"/>
            </label>

            <label class="text-xs font-bold tracking-wide uppercase bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-zinc-400 focus-within:border-[#72b0cf] transition-colors cursor-pointer">
                Month
                <select class="bg-transparent text-white font-medium outline-none ml-1 cursor-pointer py-1" id="month-select" bind:value={selectedMonth}></select>
            </label>

            <label class="text-xs font-bold tracking-wide uppercase bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-zinc-400 focus-within:border-[#72b0cf] transition-colors cursor-pointer">
                Year
                <select class="bg-transparent text-white font-medium outline-none ml-1 cursor-pointer py-1" id="year-select" bind:value={selectedYear}></select>
            </label>
        </div>

        <a href={resolve("/")} class="text-xs font-bold tracking-wide uppercase bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-2.5 transition-all active:scale-95">
            Back
        </a>  
    </div> 

    <div class="flex flex-col lg:flex-row gap-6 items-start">
        
        <div class="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
            <table class="w-full border-collapse text-left text-sm">
                <thead>
                    <tr class="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                        <th class="p-4">Timestamp</th>
                        <th class="p-4">Amount</th>
                        <th class="p-4">Category</th>
                        <th class="p-4">Description</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-900">
                    {#each filteredTransactions as t (t.id)}
                    <tr class="hover:bg-zinc-900/40 transition-colors duration-150 group">
                        <td class="p-4 text-zinc-400 font-mono text-xs">{new Date(t.timestamp).toLocaleString()}</td>
                        
                        <td class="p-4 text-white font-semibold">${t.amount}</td>
                        
                        <td class="p-4 text-[#72b0cf] font-medium cursor-context-menu relative hover:underline decoration-dotted" 
                            on:contextmenu|preventDefault|stopPropagation={(e) => handleRightClick(e, t)}>
                            {t.category || "Uncategorized"}
                        </td>
                        
                        <td class="p-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">{t.description}</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="w-full lg:w-64 shrink-0 bg-zinc-900/30 border-l-2 border-[#72b0cf] p-4 rounded-r-xl text-xs text-zinc-400 flex flex-col gap-1 leading-relaxed">
            <span class="font-bold text-white uppercase tracking-wider mb-1 block">Quick Tip</span>
            <p>Right-click any entry within the <span class="text-[#72b0cf] font-semibold">Category</span> column to change or apply a category.</p>
        </div>
    </div>
</div>

{#if showMenu} 
    {@const suggested = selectedTransaction ? getSuggestedCategory(selectedTransaction.description) : null}

    <div 
        class="fixed z-50 bg-zinc-950/95 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-zinc-800/80 rounded-xl py-2 w-52 flex flex-col backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
        style="top: {pos.y}px; left: {pos.x}px;">

        {#if suggested}
            <div class="px-4 py-1.5 text-[10px] font-black tracking-widest text-[#72b0cf] uppercase border-b border-zinc-900 mb-1">
                Suggested
            </div>
            <button class="w-full text-left px-4 py-2 text-sm text-zinc-200 font-medium hover:bg-[#72b0cf]/10 hover:text-[#72b0cf] transition-colors" on:click|stopPropagation={() => {
                if (selectedTransaction) updateTransactionCategory(selectedTransaction, suggested) 
            }}>
                {suggested}
            </button>
            <div class="h-px bg-zinc-900 my-1"></div>
        {/if}

        <div class="max-h-60 overflow-y-auto custom-scrollbar"> 
            {#each categoryData.filter(c => c.name !== suggested) as c (c.name)} 
                <button 
                    type="button"
                    class="w-full text-left px-4 py-2 text-zinc-300 hover:bg-zinc-900 hover:text-white text-sm transition-colors"
                    on:click|stopPropagation={() => { if (selectedTransaction) {
                        updateTransactionCategory(selectedTransaction, c.name);
                    }}}
                >
                    {c.name}
                </button>
            {/each}
        </div>    
                
        <div class="h-px bg-zinc-900 my-1"></div>

        <button type="button" class="w-full text-left px-4 py-2 text-zinc-500 hover:bg-red-950/30 hover:text-red-400 text-sm transition-colors font-medium"
        on:click|stopPropagation={() => { if (selectedTransaction) {
                    updateTransactionCategory(selectedTransaction, "");
                }}}>
            Clear Category
        </button>
    </div>
{/if}    

<style>
    /* 1. Force the browser's native engine into dark mode for form controls */
    select {
        color-scheme: dark;
    }

    /* 2. Tell Svelte NOT to delete this rule using the :global modifier */
    :global(select option) {
        background-color: #09090b !important; /* Forces pitch-black background */
        color: #ffffff !important;            /* Forces crisp white text */
    }
    /* Clean custom scrollbar for long category overlays */
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #27272a;
        border-radius: 2px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #72b0cf;
    }
</style>