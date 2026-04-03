<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Transaction } from '$lib/classes/Transaction';
	import type { Category } from '$lib/classes/Category';
	import PieChart from '$lib/PieChart.svelte';
	import RegressionChart from '$lib/RegressionChart.svelte';

    onMount(() => {
        createYearOptions();
    });

    export let data: { 
        transactionData: Transaction[];
        categoryData: Category[];
    };

    let categoryData = data.categoryData ?? [];
    let transactionData = data.transactionData ?? [];

    let selectedCategory = "Out to Eat";
    let selectedMonth = "all";
    let selectedYear = "2024";

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

</script>

<svelte:head>
    <title>Yearly Summaries</title>
</svelte:head>

<div class="flex flex-col">
    <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl p-3 font-bold">
            Yearly Summaries
        </h1>
        <a href={resolve("/")} class="flex mr-3 font-bold bg-blue-500 rounded-sm m-0.5 p-1 active:scale-95">Back</a>  
    </div>

    <div class="flex flex-row items-center">
        <label for="month" class="rounded-l font-bold bg-blue-500 h-7 ml-2">Category</label>
        <select bind:value={selectedCategory} class="rounded-r bg-blue-500 h-7 mr-2">
            {#each categoryData as c (c.name)}
                <option>{c.name}</option>
            {/each}
        </select>
    </div>

    <div class="flex flex-col">
        <h2 class="ml-2 mt-2 font-bold text-2xl">{selectedCategory} Trend for All Years</h2>

        <RegressionChart {selectedMonth} {selectedYear} {selectedCategory} {categoryData}></RegressionChart>

        <label class="w-fit font-bold bg-blue-500 rounded-sm m-0.5 p-1">Year
            <select class="select" id="year-select" bind:value={selectedYear}>
            </select>
        </label>

        <PieChart {selectedMonth} {selectedYear} {transactionData} {categoryData}></PieChart>
        
    </div>
</div>

