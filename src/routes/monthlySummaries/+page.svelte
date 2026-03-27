<script lang="ts">
    import * as regression from 'regression';
    import Chart, { type TooltipItem } from "chart.js/auto";
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

    onMount(() => {
        createYearOptions();
        createMonthOptions();
        handleCategorySelection();
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
    $: transactionData = data.transactionData ?? [];

    let selectedCategory = "Out to Eat";
    let selectedYear = "2024";
    let selectedMonth = "July";
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

        const regInput: [number, number][] = filteredTransactions.map((t: { timestamp: string, amount: number }) => [
            new Date(t.timestamp).getMonth(),
            Math.abs(t.amount)
        ]);

        

        regInput.sort((a, b) => a[0] - b[0]);
        
        const reg = regression.linear(regInput);

        const bestFit = [
            // x is time, y is amount
            { x: 0, y: reg.predict(0)[1] },
            { x: 11, y: reg.predict(11)[1] }
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
                            y: Math.abs(t.amount)
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

    let pieCanvas: HTMLCanvasElement;
    let pieChartInstance: Chart;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    async function renderPieChart() {
        if (pieChartInstance) pieChartInstance.destroy();

        const chartPoints = categoryData.map(c => {
            const categorySum = transactionData.filter((t: { id: number, timestamp: string, amount: number, category: string, description: string}) => {
                const isCorrectMonth = new Date(t.timestamp).getMonth() === monthNames.indexOf(selectedMonth);
                const isCorrectYear = new Date(t.timestamp).getFullYear().toString() === selectedYear;
                const isCorrectCateogry = t.category.trim().toLowerCase() === c.name.toLowerCase();
                return isCorrectCateogry && isCorrectMonth && isCorrectYear && t.amount < 0;
            })
            .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: c.name,
                amount: Math.abs(categorySum)
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
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context: TooltipItem<'pie'>): string {
                                const value = context.raw as number;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        })
    }

    $: if (pieCanvas && categoryData.length > 0 && selectedMonth && selectedYear) {
        renderPieChart();
    }

    function createYearOptions() {
        const selects = [
            document.getElementById('year-select-main'),
            document.getElementById('year-select-pie')
        ];

        const addedYears = new SvelteSet<number>(); // track months added

        for (const t of transactionData) {
            const year = new Date(t.timestamp).getFullYear(); 
            if (!addedYears.has(year)) {
                selects.forEach(select => {
                    if (select) {
                        const opt = document.createElement('option');
                        opt.textContent = new Date(t.timestamp).getFullYear().toString();
                        select?.appendChild(opt);
                        addedYears.add(year)
                    }
                })
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

    let regressionResults: regression.Result;    

    function computeRegression(transactionData: {id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        }[]) {
        const monthGroups: Record<string, { income: number, savings: number }> = {};

        transactionData.forEach(t => {
            const d = new Date(t.timestamp);
            const key = `${d.getMonth()}-${d.getFullYear()}`;

            if (!monthGroups[key]) {
                monthGroups[key] = { income: 0, savings: 0};
            }

            monthGroups[key].savings += t.amount;

            if (t.amount > 0) {
                monthGroups[key].income += t.amount;
            }
        });

        const points: regression.DataPoint[] = Object.values(monthGroups).map(m => 
            [m.income, 
            m.savings]
        );

        return regression.linear(points);
    }  
    
    $: if (transactionData.length > 0) {
        regressionResults = computeRegression(transactionData);
    }
    
    let prediction = 0;
    let currentIncome: number;
    let currentSpendings: number;

    $: if (regressionResults && selectedMonth && selectedYear) {
        const m = regressionResults.equation[0];
        const a = regressionResults.equation[1];

        currentIncome = transactionData
            .filter(t => {
                const d = new Date(t.timestamp);
                return d.toLocaleString('default', {month: 'long'}) === selectedMonth &&
                    d.getFullYear().toString() === selectedYear && t.amount > 0;
            })
            .reduce((sum, t) => sum + t.amount, 0);  
            
        currentSpendings = transactionData
        .filter(t => {
            const d = new Date(t.timestamp);
            return d.toLocaleString('default', {month: 'long'}) === selectedMonth &&
                d.getFullYear().toString() === selectedYear && t.amount < 0;
        })
        .reduce((sum, t) => sum + t.amount, 0);  

        if (a + (m * currentIncome) <= 0) {
            prediction = 0;
        } else {
            prediction = a + (m * currentIncome); 
        }
    }
    
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
        <a href={resolve("/")} class="font-bold bg-blue-500 rounded-sm m-0.5 p-1">Back</a>  
    </div>

    <div class="flex flex-row items-center">
        <label for="month" class="rounded-l bg-blue-500 font-bold h-7 ml-2">Category</label>
        <select bind:value={selectedCategory} on:change={handleCategorySelection} class="rounded-r bg-blue-500 h-7 mr-2">
            {#each categoryData as c (c.name)}
                <option>{c.name}</option>
            {/each}
        </select>

        <label class="font-bold bg-blue-500 rounded-sm m-0.5 p-1">Year
            <select class="select" id="year-select-main" bind:value={selectedYear}>
            </select>
        </label>
    </div>

    <div class="flex flex-col">
        <canvas bind:this={canvas}></canvas>

        <div id="pi-chart-container" class="mx-auto flex flex-row">
            <label class="h-fit font-bold bg-blue-500 rounded-sm m-0.5 p-1">Month
                <select class="select" id="month-select" bind:value={selectedMonth}>
                </select>
            </label> 

            <label class="h-fit font-bold bg-blue-500 rounded-sm m-0.5 p-1">Year
                <select class="select" id="year-select-pie" bind:value={selectedYear}>
                </select>
            </label>
            <canvas class="h-1/12 w-1/12" bind:this={pieCanvas}></canvas>

            <div class="font-bold">
                <!-- here will be predicted savings -->
                <p>Current Spendings: ${currentSpendings}</p>
                <p>Current Income: ${currentIncome}</p>
                Predicted Savings: ${prediction}
            </div>
        </div>
    </div>
</div>

