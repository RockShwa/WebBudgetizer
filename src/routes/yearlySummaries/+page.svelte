<script lang="ts">
    import * as regression from 'regression';
    import Chart from "chart.js/auto";
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount } from 'svelte';

    onMount(() => {
        createYearOptions();
    });

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


    let selectedCategory = "";
    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;
    let selectedYear = "";


    export async function graphRegression(categoryName: string) {
        const response = await fetch(`/api/yearlySummaries?name=${categoryName}`);
        const transactions = await response.json();

        if (!transactions || transactions.length === 0) {
            if (chartInstance) chartInstance.destroy();
            return;
        }

        const formattedData = transactions.map((t: { timestamp: string, amount: number}) => {
            const dateObj = new Date(t.timestamp);
            return {
                x: dateObj.getMonth(),
                y: t.amount
            }
        });

        const regInput = formattedData.map((d: { x: number, y: number})  => [d.x, d.y]);

        const reg = regression.linear(regInput);

        // create the best fit data (two relevant points) -> start and end
        const startX = regInput[0][0];
        const endX = regInput[regInput.length - 1][0];

        const bestFit = [
            // x is time, y is amount
            {x: startX, y: reg.equation[1]},
            {x: endX, y: reg.equation[0] * endX + reg.equation[1]}
        ];

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: "Category Transactions",
                        data: transactions.map((t: { timestamp: string, amount: number}) => ({
                            x: new Date(t.timestamp).getMonth(),
                            y: t.amount
                        })),
                        backgroundColor: 'blue'
                    },
                    {
                        label: "Line of Best Fit",
                        data: bestFit,
                        type: "line",
                        borderColor: "red"
                    }
                ]
            }
        });
    }

    async function handleCategorySelection() {
        if (selectedCategory) {
            await graphRegression(selectedCategory);
        }   
        
    }


    let pieCanvas: HTMLCanvasElement;
    let pieChartInstance: Chart;

    // figure out how to make diff from monthly summaries
    async function renderPieChart() {

        if (pieChartInstance) pieChartInstance.destroy();

        const chartPoints = categoryData.map(c => {
            const categorySum = transactionData.filter((t: { id: number, timestamp: string, amount: number, category: string, description: string}) => {
                const isCorrectYear = new Date(t.timestamp).getFullYear() === parseFloat(selectedYear);
                const isCorrectCateogry = t.category.trim().toLowerCase() === c.name.toLowerCase();
                return isCorrectCateogry && isCorrectYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: c.name,
                amount: categorySum
            };
            }).filter(c => c.amount);

        pieChartInstance = new Chart(pieCanvas, {
            type: 'pie',
            data: {
                labels: chartPoints.map(c => c.name),
                datasets: [{
                    data: chartPoints.map(c => c.amount),
                    backgroundColor: [
                        '#3b82f6',
                        '#ef4444',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6',
                        '#ec4899'
                    ]
                }]
            }
        })
    }

    $: if (pieCanvas && categoryData.length > 0 && selectedYear) {
        renderPieChart();
    }

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

</script>

<svelte:head>
    <title>Yearly Summaries</title>
</svelte:head>

<div class="flex flex-col">
    <div class="flex flex-row items-center">
        <h1 class="text-3xl p-3 font-bold">
            Yearly Summaries
        </h1>
        <div class="w-280 h-2 rounded-2xl bg-blue-500 mt-2"></div>
        <button class="w-20 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-1 ml-4">Back</button>
    </div>

    <div class="flex flex-row items-center">
        <label for="month" class="rounded-l bg-blue-500 h-7 ml-2">Category</label>
        <select bind:value={selectedCategory} on:change={handleCategorySelection} class="rounded-r bg-blue-500 h-7 mr-2">
            {#each categoryData as c (c.name)}
                <option>{c.name}</option>
            {/each}
        </select>
    </div>

    <div class="flex flex-col">
        <canvas bind:this={canvas}></canvas>

        <div id="pi-chart-container" class="w-full h-64 mx-auto flex flex-row">
            <label class="font-bold bg-white rounded-sm m-0.5 p-1">Year
                <select class="select" id="year-select" bind:value={selectedYear}>
                </select>
            </label>
            <canvas bind:this={pieCanvas}></canvas>
        </div>
    </div>
</div>

