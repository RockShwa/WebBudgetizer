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

    // get class

    let categoryData = data.categoryData ?? [];
    let transactionData = data.transactionData ?? [];


    let selectedCategory = "Out to Eat";
    let selectedMonth = "all";
    //let canvas: HTMLCanvasElement;
    // let chartInstance: Chart;
    let selectedYear = "2024";


    // export async function graphRegression(categoryName: string) {
    //     const response = await fetch(`/api/yearlySummaries?name=${categoryName}`);
    //     const transactions = await response.json();

    //     if (!transactions || transactions.length === 0) {
    //         if (chartInstance) chartInstance.destroy();
    //         return;
    //     }

    //     const formattedData = transactions.map((t: { timestamp: string, amount: number}) => {
    //         const dateObj = new Date(t.timestamp);
    //         return {
    //             x: dateObj.getMonth(),
    //             y: Math.abs(t.amount)
    //         }
    //     });

    //     const regInput = formattedData.map((d: { x: number, y: number})  => [d.x, d.y]);

    //     const reg = regression.linear(regInput);

    //     // create the best fit data (two relevant points) -> start and end
    //     const startX = regInput[0][0];
    //     const endX = regInput[regInput.length - 1][0];

    //     const bestFit = [
    //         { 
    //             x: startX, 
    //             y: reg.equation[0] * startX + reg.equation[1] // Calculate y for the first x
    //         },
    //         { 
    //             x: endX, 
    //             y: reg.equation[0] * endX + reg.equation[1]   // Calculate y for the last x
    //         }
    //     ];

    //     if (chartInstance) chartInstance.destroy();

    //     chartInstance = new Chart(canvas, {
    //         type: 'scatter',
    //         data: {
    //             datasets: [
    //                 {
    //                     label: "Category Transactions",
    //                     data: transactions.map((t: { timestamp: string, amount: number}) => ({
    //                         x: new Date(t.timestamp).getMonth(),
    //                         y: Math.abs(t.amount)
    //                     })),
    //                     backgroundColor: 'blue'
    //                 },
    //                 {
    //                     label: "Line of Best Fit",
    //                     data: bestFit,
    //                     type: "line",
    //                     borderColor: "red"
    //                 }
    //             ]
    //         }
    //     });
    // }

    // async function handleCategorySelection() {
    //     if (selectedCategory) {
    //         await graphRegression(selectedCategory);
    //     }   
        
    // }

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

