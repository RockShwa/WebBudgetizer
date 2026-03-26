<script lang="ts">
    import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

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
            categoryTotal: number;
        }[];
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

        const newCategory = { name: categoryName, goal: 0, defaultGoal: 0, categoryTotal: 0};
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
        location.reload();
    }

    async function calculateDifference(category: { name: string; goal: number; defaultGoal: number; categoryTotal: number}) {
        const response = await fetch(`/api/categories?name=${category.name}`);
        const categoryTotal: number = await response.json();

        if (category.goal === 0 && category.defaultGoal === 0) {
            return category.categoryTotal;
        } else {
            return Number(category.goal) - Number(categoryTotal);
        }
    }

    let selectedMonth = "";
    let selectedYear = "";

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
                selectedYear = opt.textContent;
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
                selectedMonth = opt.textContent;
                monthSelect?.appendChild(opt);
                addedMonths.add(month)
            }
        }
    }

    function calculateCategorySum(c: {name: string}, month: string, year: string) {
        const categorySum = transactionData.filter((t: { id: number, timestamp: string, amount: number, category: string, description: string}) => {
                const isCorrectMonth = new Date(t.timestamp).getMonth() === monthNames.indexOf(month);
                const isCorrectYear = new Date(t.timestamp).getFullYear() === parseFloat(year);
                const isCorrectCateogry = t.category.trim().toLowerCase() === c.name.toLowerCase();
                return isCorrectCateogry && isCorrectMonth && isCorrectYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return categorySum;    
    }

    $: categoryTotals = categoryData.map(c => ({
        name: c.name,
        total: calculateCategorySum(c, selectedMonth, selectedYear)
    }));
</script>

<svelte:head>
    <title>Manage Categories</title>
</svelte:head>

<main>
    <div class="flex flex-row justify-between m-3">
        <div class="text-2xl font-bold">Manage Categories</div>
        <a href={resolve("/transactions")}>
            <button class="w-20 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-1">Back</button>
        </a>
    </div>

    <!-- Add Category -->
    <form class="my-6 bg-white" on:submit|preventDefault={handleAddCategory}>
        <label class="font-bold text-gray-800 m-3 bg-white" for="todo">Add Category</label>
        <div class="flex flex-row text-sm mb-2 bg-white">
            <!-- bind todo value inside input (to store the variable there)-->
            <input type="text" bind:value={categoryName} name="category" placeholder="Enter Category Here"
            class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-non focus:border-gray-500
            rounded-lg"/>
            <button type="submit" class="w-auto shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 m-2">Add</button>
        </div>

        <label class="font-bold bg-white rounded-sm m-0.5 p-1">Month
                <select class="select" id="month-select" bind:value={selectedMonth}>
                </select>
        </label>

        <label class="font-bold bg-white rounded-sm m-0.5 p-1">Year
            <select class="select" id="year-select" bind:value={selectedYear}>
            </select>
        </label>
    </form>

    <!-- Category List -->

    <div class="flex m-3">
        <table class="border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-300">
                    <th class="border border-gray-300 p-1">Category Name</th>
                    <th class="border border-gray-300 p-1">Goal</th>
                    <th class="border border-gray-300 p-1">Default Goal</th>
                    <th class="border border-gray-300 p-1">Category Total</th>
                    <th class="border border-gray-300 p-1">Difference</th>
                    <th class="border border-gray-300 p-1">Delete?</th>
                </tr>
            </thead>
            <tbody>
                {#each categoryData as c (c.name)}
                <tr>
                    <td class="border border-gray-300 p-1">
                        {c.name}
                    </td>
                    <td class="border border-gray-300 p-1">
                    <!-- on change, add goal to database -->
                        <div contenteditable="true" id="editor" on:blur={(e) => handleEditedGoal('UPDATE_GOAL', c, e)}>
                            {c.goal}
                        </div>
                    </td>
                    <td class="border border-gray-300 p-1">
                        <div contenteditable="true" id="editor" on:blur={(e) => handleEditedGoal('UPDATE_DEFAULT_GOAL', c, e)}>
                            {c.defaultGoal}
                        </div>
                    </td>
                    <td class="border border-gray-300 p-1">
                        <span>{categoryTotals.find(t => t.name === c.name)?.total || 0}</span>
                    </td>
                    <td class="border border-gray-300 p-1">
                        {#await calculateDifference(c)}
                            <span></span>
                        {:then diff}
                            <span>{diff}</span>
                        {/await}
                    </td>
                    <td class="border border-gray-300 p-1"><button
                            type='button'
                            class='text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline'
                            on:click={() => handleDeleteCategory(c)}>Delete
                    </button></td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div> 

</main>

<style>
    :global(body) {
        background-color: rgb(143, 201, 163)
    }
    tr:nth-child(even) {
        background-color: white;
    }
    tr:nth-child(odd) {
        background-color: var(--color-gray-300);
    }
</style>