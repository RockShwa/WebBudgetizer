<script lang="ts">
    import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
    import { onMount } from 'svelte';

    export let data: { 
        transactionData: { 
            id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        }[];
        categoryData: {
            name: string; 
            goal: number; 
            defaultGoal: number; 
        }[];
    };

    onMount(() => {
        createMonthOptions();
        createYearOptions();
    });

    let transactionData = data.transactionData ?? [];

    let categoryData = data.categoryData ?? [];

    let file: File | undefined;

    export function navigateBack() {
        history.go(-1);
    }

    // get transactionTimes from sql query
    export function sortTime(transactions: { 
            id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        }[]) {
        
        if (transactions.length <= 1) return transactions;
    
        let result=[];
        let left;
        let right;
        

        // recursively slice the arrays in half
        let mid = Math.floor(transactions.length / 2);
        left = transactions.slice(0, mid);
        right = transactions.slice(mid);

        sortTime(left);
        sortTime(right);

        // create indicies
        let i: number = 0;
        let j: number = 0;

        // as long as the indicies are less than right and left's length, 
        // we're going to set the originial array equal to the left if it's
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
        transactionData = sortAmount(transactionData);
    }

    export function sortAmount(transactions: { 
            id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        }[]) {
        if (transactions.length <= 1) return transactions;
    
        let result=[];
        let left;
        let right;
        

        // recursively slice the arrays in half
        let mid = Math.floor(transactions.length / 2);
        left = transactions.slice(0, mid);
        right = transactions.slice(mid);

        sortAmount(left);
        sortAmount(right);

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
        const input = e.target as HTMLInputElement;
        file = input.files?.[0];

        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        
        await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

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
    let selectedTransaction: | { 
            id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        } | null = null;

    function handleRightClick(e: MouseEvent, transaction: { 
            id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        }) {

        selectedTransaction = transaction;

        pos = {x: e.clientX, y: e.clientY};
        showMenu = true;
    }

    function closeMenu() {
        showMenu = false;
    }

    async function updateTransactionCategory(transaction: { 
            id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        }, categoryName: string) {

        await fetch ('/api/transactions', {
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: transaction.id, 
                category: categoryName
            })
        })

        transactionData = transactionData?.map(t => {
            if (t.id === transaction.id) {
                return { ...t, category: categoryName}
            }
            return t;
        }) 

        closeMenu();
    }

</script>

<svelte:window on:click={closeMenu} />

<svelte:head>
    <title>Transactions</title>
</svelte:head>


<div class="flex flex-col" style="background-color:rgb(143, 201, 163);">
    <!-- menu div -->
    <div class="flex m-2">
        <a href={resolve("/manageCategories")} class="font-bold bg-white rounded-sm m-0.5 p-1">Manage Categories</a>
        <a href={resolve("/manageGoals")} class="font-bold bg-white rounded-sm m-0.5 p-1">Manage Goals</a>   
        
        <!-- the sort button that sorts depending on the option with the array of transactions in the database-->
        <label class="font-bold bg-white rounded-sm m-0.5 p-1">Sort
            <select class="select" on:change={(e) => {
                const value = (e.target as HTMLSelectElement).value;

                if (value === "Timestamp") handleTimeSort();
                if (value === "Amount") handleAmountSort();
            }}>
                <option value="Timestamp">Timestamp</option>
                <option value="Amount">Amount</option>
            </select>
        </label>

        <label class="font-bold bg-white rounded-sm m-0.5 p-1"> Upload
            <input on:change={uploadFile} type="file" id="file" class="hidden"/>
        </label>

        <label class="font-bold bg-white rounded-sm m-0.5 p-1">Month
            <select class="select" id="month-select"></select>
        </label>

        <label class="font-bold bg-white rounded-sm m-0.5 p-1">Year
            <select class="select" id="year-select">
            </select>
        </label>


        <a href={resolve("/")} class="font-bold bg-white rounded-sm m-0.5 p-1">Back</a>  
    </div> 

    <!-- table div -->
    <div class="flex m-3">
        <table class="border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-300">
                    <th class="border border-gray-300 p-1">ID</th>
                    <th class="border border-gray-300 p-1">Timestamp</th>
                    <th class="border border-gray-300 p-1">Amount</th>
                    <th class="border border-gray-300 p-1">Category</th>
                    <th class="border border-gray-300 p-1">Description</th>
                </tr>
            </thead>
            <tbody>
                {#each transactionData as t (t.id)}
                <tr>
                    <td class="border border-gray-300 p-1">{t.id}</td>
                    <td class="border border-gray-300 p-1">{new Date(t.timestamp).toLocaleString()}</td>
                    <td class="border border-gray-300 p-1">${t.amount}</td>
                    <td class="border border-gray-300 p-1 cursor-context-menu" on:contextmenu|preventDefault|stopPropagation={(e) => handleRightClick(e, t)}>{t.category}</td>
                    <td class="border border-gray-300 p-1">{t.description}</td>
                </tr>
                {/each}
            </tbody>
        </table>


    </div>
</div>

<!-- right click menu for setting categories (redo styling) -->
{#if showMenu} 
    <div 
        class="fixed z-100 bg-white shadow-2xl border border-gray-300 rounded-lg py-2 w-48 flex flex-col"
        style="top: {pos.y}px; left: {pos.x}px;"
    >
        <div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b mb-1">
            Set Category
        </div>

        <div class="max-h-60 overflow-y-auto"> 
                {#each categoryData as c (c.name)} 
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
