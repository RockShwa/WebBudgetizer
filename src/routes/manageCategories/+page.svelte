<script lang="ts">
    import { resolve } from '$app/paths';
	import { Category } from '$lib/classes/Category';
	import { Transaction } from '$lib/classes/Transaction';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

    export let data: { 
        transactionData: Transaction[];
        categoryData: Category[];
    };

    let categoryData = data.categoryData ?? [];
    let transactionData = data.transactionData ?? [];
    let categoryName = '';

    onMount(() => {
        createYearOptions();
        createMonthOptions();
    });

    async function handleAddCategory() {
        await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName, goal: 0, defaultGoal: 0, categoryTotal: 0})
        });

        const newCategory = new Category({name: categoryName, goal: 0, defaultGoal: 0});

        categoryData = [...categoryData, newCategory]; 
        categoryName = ''; 
    }

    async function handleDeleteCategory(c: { name: string }) {
        await fetch('/api/categories', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: c.name })
        });

        categoryData = categoryData.filter(t => t.name !== c.name); 
    }

    async function handleEditedGoal(action: string, c: { name: string}, event: Event) {
        const element = event.target as HTMLElement;
        const newGoal = element.innerText;

        if (action === 'UPDATE_GOAL') {
            // query database with input
            await fetch('/api/categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'UPDATE_GOAL',
                    name: c.name,
                    goal: newGoal
                })
            });
        } else if (action === 'UPDATE_DEFAULT_GOAL') {
            // query database with input
            await fetch('/api/categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'UPDATE_DEFAULT_GOAL',
                    name: c.name,
                    goal: newGoal
                })
            });
        }
    }

    $: categoryTotals = categoryData.map(c => {
        const total = Math.abs(calculateCategorySum(c, selectedMonth, selectedYear));

        const activeGoal = c.goal !== 0 ? c.goal : c.defaultGoal;
        const diff = activeGoal - total;

        return {
            name: c.name,
            total: total,
            difference: diff
        };
    });


    let selectedMonth = "July";
    let selectedYear = "2024";

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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

    function updateColorCoding(difference: number) {
            // if difference < 0 -> yellow
            // if difference > 0 -> blue
            // if difference === 0 -> green; 

            if (difference < 0) {
                return "bg-[rgb(235,230,148)]";
            } else if (difference > 0) {
                return "bg-[rgb(186,214,255)]";
            } else if (difference === 0) {
                return "bg-[rgb(129,204,149)]";
            }

        }

    function calculateCategorySum(c: {name: string}, month: string, year: string) {
        const categorySum = transactionData.filter((t: Transaction) => {
                const isCorrectMonth = new Date(t.timestamp).getMonth() === monthNames.indexOf(month);
                const isCorrectYear = new Date(t.timestamp).getFullYear() === parseFloat(year);
                const isCorrectCateogry = t.category.trim().toLowerCase() === c.name.toLowerCase();
                return isCorrectCateogry && isCorrectMonth && isCorrectYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return categorySum;    
    }
</script>

<svelte:head>
    <title>Manage Categories | FreeBudgetPro</title>
</svelte:head>

<main class="min-h-screen bg-black text-white p-6 flex flex-col gap-6">
    
    <div class="flex flex-row justify-between items-center pb-4 border-b border-zinc-800">
        <h1 class="text-2xl font-black tracking-tight">
            Manage <span class="text-[#72b0cf]">Categories</span>
        </h1>
        <a href={resolve("/transactions")} class="text-xs font-bold tracking-wide uppercase bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-2.5 transition-all active:scale-95">
            Back
        </a>  
    </div>

    <form class="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md flex flex-col md:flex-row md:items-end justify-between gap-6" on:submit|preventDefault={handleAddCategory}>
        
        <div class="flex flex-col gap-2 w-full md:max-w-md">
            <label class="text-xs font-bold tracking-widest text-zinc-400 uppercase" for="category">Add Category</label>
            <div class="flex items-center gap-2 text-sm w-full">
                <input 
                    type="text" 
                    bind:value={categoryName} 
                    name="category" 
                    placeholder="Enter Category Here"
                    class="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-[#72b0cf] placeholder-zinc-600 transition-colors"
                />
                <button type="submit" class="shadow-sm rounded-lg bg-[#72b0cf] hover:bg-[#5fa1c2] text-black font-black uppercase tracking-wider text-xs px-5 py-3 transition-all active:scale-95 shrink-0">
                    Add
                </button>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
            <label class="text-xs font-bold tracking-wide uppercase bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2 text-zinc-400 focus-within:border-[#72b0cf] transition-colors cursor-pointer">
                Month
                <select class="bg-transparent text-white font-medium outline-none ml-1 cursor-pointer" id="month-select" bind:value={selectedMonth}>
                </select>
            </label>

            <label class="text-xs font-bold tracking-wide uppercase bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2 text-zinc-400 focus-within:border-[#72b0cf] transition-colors cursor-pointer">
                Year
                <select class="bg-transparent text-white font-medium outline-none ml-1 cursor-pointer" id="year-select" bind:value={selectedYear}>
                </select>
            </label>
        </div>
    </form>

    <div class="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
        <table class="w-full border-collapse text-left text-sm">
            <thead>
                <tr class="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-semibold tracking-wider text-xs uppercase和">
                    <th class="p-4">Category Name</th>
                    <th class="p-4">Monthly Goal</th>
                    <th class="p-4">Default Goal</th>
                    <th class="p-4">Category Total</th>
                    <th class="p-4">Difference</th>
                    <th class="p-4 text-center">Delete?</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-zinc-900">
                {#each categoryData as c (c.name)}
                <tr class="hover:bg-zinc-900/20 transition-colors duration-150">
                    <td class="p-4 font-semibold text-zinc-200">
                        {c.name}
                    </td>
                    
                    <td class="p-4">
                        <div 
                            contenteditable="true" 
                            id="editor" 
                            class="bg-zinc-950/40 border border-zinc-800/60 focus:border-[#72b0cf] focus:bg-zinc-900 rounded px-2 py-1 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text inline-block min-w-[60px]"
                            on:blur={(e) => handleEditedGoal('UPDATE_GOAL', c, e)}
                        >
                            {c.goal}
                        </div>
                    </td>
                    
                    <td class="p-4">
                        <div 
                            contenteditable="true" 
                            id="editor" 
                            class="bg-zinc-950/40 border border-zinc-800/60 focus:border-[#72b0cf] focus:bg-zinc-900 rounded px-2 py-1 outline-none font-mono text-zinc-300 focus:text-white transition-all cursor-text inline-block min-w-[60px]"
                            on:blur={(e) => handleEditedGoal('UPDATE_DEFAULT_GOAL', c, e)}
                        >
                            {c.defaultGoal}
                        </div>
                    </td>
                    
                    <td class="p-4 font-medium text-zinc-300">
                        <span>${categoryTotals.find(t => t.name === c.name)?.total || 0}</span>
                    </td>
                    
                    <td class="p-4 font-mono text-xs" id="color-coded">
                        {#each categoryTotals.filter(t => t.name === c.name) as item (item.name)}
                            <div class="{updateColorCoding(item.difference)} text-zinc-950 font-black px-2 py-1 rounded-md inline-block shadow-sm">
                                {item.difference}
                            </div>
                        {/each}
                    </td>
                    
                    <td class="p-4 text-center">
                        <button
                            type='button'
                            class='text-xs font-bold uppercase tracking-wider bg-red-950/40 hover:bg-red-900 border border-red-900/40 hover:border-red-600 text-red-400 hover:text-white py-1.5 px-3 rounded-lg transition-all active:scale-95'
                            on:click={() => handleDeleteCategory(c)}
                        >
                            Delete
                        </button>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div> 
</main>

<style>
    /* Prevent raw dropdown popups from breaking light/dark browser assumptions */
    select {
        color-scheme: dark;
    }

    /* Keep dynamically rendered child options legible */
    :global(select option) {
        background-color: #09090b !important; 
        color: #ffffff !important;            
    }
</style>