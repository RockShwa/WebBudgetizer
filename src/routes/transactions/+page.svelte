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
    <title>Transactions</title>
</svelte:head>


<div class="flex flex-col">
    <!-- menu div -->
    <div class="flex m-2">
        <a href={resolve("/manageCategories")} class="font-bold bg-blue-500 rounded-sm m-0.5 p-1 active:scale-95">Manage Categories</a>
        
        <!-- the sort button that sorts depending on the option with the array of transactions in the database-->
        <label class="font-bold bg-blue-500 rounded-sm m-0.5 p-1">Sort
            <!-- check the value of the option selected -->
            <select class="select" on:change={(e) => {
                const value = (e.target as HTMLSelectElement).value;

                if (value === "Timestamp") handleTimeSort();
                if (value === "Amount") handleAmountSort();
            }}>
                <option value="Timestamp">Timestamp</option>
                <option value="Amount">Amount</option>
            </select>
        </label>

        <label class="font-bold bg-blue-500 rounded-sm m-0.5 p-1"> Upload
            <!-- accept=".csv" -->
            <input on:change={uploadFile} type="file" id="file" class="hidden"/>
        </label>

        <label class="font-bold bg-blue-500 rounded-sm m-0.5 p-1">Month
            <select class="select" id="month-select" bind:value={selectedMonth}></select>
        </label>

        <label class="font-bold bg-blue-500 rounded-sm m-0.5 p-1">Year
            <select class="select" id="year-select" bind:value={selectedYear}>
            </select>
        </label>


        <a href={resolve("/")} class="font-bold bg-blue-500 rounded-sm m-0.5 p-1 active:scale-95">Back</a>  
    </div> 

    <!-- table div -->
    <div class="flex flex-row m-3">
        <table class="border-collapse border border-gray-300">
            <thead>
                <!-- table headings -->
                <tr class="bg-gray-300">
                    <th class="border border-gray-300 p-1">Timestamp</th>
                    <th class="border border-gray-300 p-1">Amount</th>
                    <th class="border border-gray-300 p-1">Category</th>
                    <th class="border border-gray-300 p-1">Description</th>
                </tr>
            </thead>
            <tbody>
                <!-- table data: creates a row for each transaction -->
                {#each filteredTransactions as t (t.id)}
                <tr>
                    <!-- timestamp -->
                    <td class="border border-gray-300 p-1">{new Date(t.timestamp).toLocaleString()}</td>
                    <!-- amount -->
                    <td class="border border-gray-300 p-1">${t.amount}</td>
                    <!-- category, if right clicked shows a pop-up box to give it a category -->
                    <td class="border border-gray-300 p-1 cursor-context-menu" on:contextmenu|preventDefault|stopPropagation=
                    {(e) => handleRightClick(e, t)}>{t.category}</td>
                    <!-- description -->
                    <td class="border border-gray-300 p-1">{t.description}</td>
                </tr>
                {/each}
            </tbody>
        </table>

        <div class="m-5 font-bold bg-blue-500 rounded-sm p-3">
            <p>Please Right</p>
            <p>Click a Category</p>
            <p>Cell to Change It</p>
        </div>
    </div>
</div>

<!-- right click menu for setting categories (redo styling) -->
{#if showMenu} 
    {@const suggested = selectedTransaction ? getSuggestedCategory(selectedTransaction.description) : null}

    <div 
        class="fixed z-100 bg-white shadow-2xl border border-gray-300 rounded-lg py-2 w-48 flex flex-col"
        style="top: {pos.y}px; left: {pos.x}px;">

        {#if suggested}
            <div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b mb-1">
                Suggested
            </div>
            <button class="w-full text-left px-4 py-2" on:click|stopPropagation={() => {
                if (selectedTransaction) updateTransactionCategory(selectedTransaction, suggested) 
            }}>
                {suggested}
            </button>
        {/if}

        <div class="max-h-60 overflow-y-auto"> 
            {#each categoryData.filter(c => c.name !== suggested) as c (c.name)} 
                <button 
                    type="button"
                    class="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white text-sm transition-colors"
                    on:click|stopPropagation={() => { if (selectedTransaction) {
                                                        updateTransactionCategory(selectedTransaction, c.name);
                                                    }}}
                >
                    {c.name}
                </button>
            {/each}
        </div>    
               
        <!-- even if you have to click uncategorized a bunch, since it's not part of category data it will stay at the bottom! -->
        <button type="button" class="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white text-sm transition-colors"
        on:click|stopPropagation={() => { if (selectedTransaction) {
                                                    updateTransactionCategory(selectedTransaction, "");
                                                }}}>
            Uncategorized
        </button>
    </div>
{/if}    

<style>
    tr:nth-child(even) {
        background-color: white;
    }
    tr:nth-child(odd) {
        background-color: var(--color-gray-300);
    }
</style>
