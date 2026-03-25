<script lang="ts">
    import * as regression from 'regression';
    import Chart from "chart.js/auto";
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount } from 'svelte';

    onMount(() => {
        createYearOptions();
        createMonthOptions();
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
    let selectedYear = "";
    let selectedMonth = "";
    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;

    export async function graphRegression(categoryName: string, startYear: string, endYear: string) {
        const response = await fetch(`/api/monthlySummaries?name=${categoryName}`);
        const transactions = await response.json();

        if (!transactions || transactions.length === 0) {
            if (chartInstance) chartInstance.destroy();
            return;
        }

        const filteredTransactions = transactions.filter((t: { timestamp: string, amount: number}) => {
            const year = new Date(t.timestamp).getFullYear();
            return year >= parseFloat(startYear) && year <= parseFloat(endYear);
        })

        const formattedData = filteredTransactions.map((t: { timestamp: string, amount: number}) => {
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
            await graphRegression(selectedCategory, selectedYear, selectedYear);
        }   
        
    }

    export function caluclateSavingPrediction(a: number, income: number, m: number) {

        // m is slope of the line of best fit with data of change in income over change in savings
        // income is disposable income
        // a is the amount you would save with no income
        // the linear equation - returns the amount saved at a particular amount of disposable income
        return a + m * income;
    }

    let pieCanvas: HTMLCanvasElement;
    let pieChartInstance: Chart;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    async function renderPieChart() {

        // filter transactions for month chosen
        // sum according to categories


        if (pieChartInstance) pieChartInstance.destroy();

        const chartPoints = categoryData.map(c => {
            const categorySum = transactionData.filter((t: { id: number, timestamp: string, amount: number, category: string, description: string}) => {
                const isCorrectMonth = new Date(t.timestamp).getMonth() === monthNames.indexOf(selectedMonth);
                const isCorrectCateogry = t.category.trim().toLowerCase() === c.name.toLowerCase();
                return isCorrectCateogry && isCorrectMonth;
            })
            .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: c.name,
                amount: categorySum
            };
            }).filter(c => c.amount);

        const total = chartPoints.reduce((sum, c) => sum + c.amount, 0); 

        if (total === 0) return;

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

    $: if (pieCanvas && categoryData.length > 0 && selectedMonth) {
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

    // need starting
    // need total for all
    // need slope

    //$: prediciton = caluclateSavingPrediction();

</script>

<svelte:head>
    <title>Monthly Summaries</title>
</svelte:head>

<div class="flex flex-col">
    <div class="flex flex-row items-center">
        <h1 class="text-3xl p-3 font-bold">
            Monthly Summaries
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

        <label class="font-bold bg-white rounded-sm m-0.5 p-1">Year
            <select class="select" id="year-select">
            </select>
        </label>
    </div>

    <div class="flex flex-col">
        <canvas bind:this={canvas}></canvas>

        <div id="pi-chart-container" class="w-full h-64 mx-auto flex flex-row">
            <label class="font-bold bg-white rounded-sm m-0.5 p-1">Month
                <select class="select" id="month-select" bind:value={selectedMonth}>
                </select>
            </label>
            <canvas bind:this={pieCanvas}></canvas>

            <!-- <div>
                here will be predicted savings
                Predicted Savings: ${prediction};
            </div> -->
        </div>
    </div>
</div>

