<script lang="ts">
    import * as regression from 'regression';
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Transaction } from '$lib/classes/Transaction';
	import type { Category } from '$lib/classes/Category';
    import PieChart from '$lib/PieChart.svelte';
	import RegressionChart from '$lib/RegressionChart.svelte';

    onMount(() => {
        createYearOptions();
        createMonthOptions();
    });

    export let data: { 
        transactionData: Transaction[];
        categoryData: Category[];
    };
    let categoryData = data.categoryData ?? [];
    $: transactionData = data.transactionData ?? [];

    let selectedCategory = "Out to Eat";
    let selectedYear = "2024";
    let selectedMonth = "July";

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

    function computeRegression(transactionData: Transaction[]) {
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

    // reactive $: so this block of code executes anytime regressionRes
    $: if (regressionResults && selectedMonth && selectedYear) {
        // m is the slope. the regression api object (regressionResults) returns the slope at equation[0]
        const m = regressionResults.equation[0];
        // a is the y-intercept. the regression api object (regressionResults) returns the y-intercept at equation[1]
        const a = regressionResults.equation[1];

        // filter transactions to only include income (amounts > 0)
        // displayed before pie chart
        currentIncome = transactionData
            .filter(t => {
                const d = new Date(t.timestamp);
                return d.toLocaleString('default', {month: 'long'}) === selectedMonth &&
                    d.getFullYear().toString() === selectedYear && t.amount > 0;
            })
            .reduce((sum, t) => sum + t.amount, 0);  
            
        // filter transactions to only include spendings (amount < 0)
        // displayed before pie chart
        currentSpendings = transactionData
        .filter(t => {
            const d = new Date(t.timestamp);
            return d.toLocaleString('default', {month: 'long'}) === selectedMonth &&
                d.getFullYear().toString() === selectedYear && t.amount < 0;
        })
        .reduce((sum, t) => sum + t.amount, 0);  

        // minimum savings is 0
        if (a + (m * currentIncome) <= 0) {
            prediction = 0;
        // MPS equation for calculating savings, displayed before pie chart
        } else {
            prediction = a + (m * currentIncome); 
        }
    }
</script>

<svelte:head>
    <title>Monthly Summaries</title>
</svelte:head>

<div class="flex flex-col">
    <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl p-3 font-bold">
            Monthly Summaries
        </h1>
        <a href={resolve("/")} class="font-bold mr-3 bg-blue-500 rounded-sm m-0.5 p-1 active:scale-95">Back</a>  
    </div>

    <div class="flex flex-row items-center">
        <label for="month" class="rounded-l bg-blue-500 font-bold h-7 ml-2">Category</label>
        <select bind:value={selectedCategory} class="rounded-r bg-blue-500 h-7 mr-2">
            {#each categoryData as c (c.name)}
                <option class="font-bold">{c.name}</option>
            {/each}
        </select>

        <label class="font-bold bg-blue-500 rounded-sm m-0.5 p-1">Year
            <select class="select" id="year-select-main" bind:value={selectedYear}>
            </select>
        </label>
    </div>

    <div class="flex flex-col">

        <h2 class="ml-2 mt-2 font-bold text-2xl">{selectedCategory} Trend for {selectedYear}</h2>

        <RegressionChart {selectedMonth} {selectedYear} {selectedCategory} {categoryData}></RegressionChart>

        <div id="pi-chart-container" class="mx-auto flex flex-row">
            <div class="flex flex-col">
                <label class="h-fit w-fit font-bold bg-blue-500 rounded-sm m-0.5 p-1">Month
                    <select class="select" id="month-select" bind:value={selectedMonth}>
                    </select>
                </label> 

                <label class="h-fit w-fit font-bold bg-blue-500 rounded-sm m-0.5 p-1">Year
                    <select class="select" id="year-select-pie" bind:value={selectedYear}>
                    </select>
                </label>

                <div class="font-bold rounded-sm h-fit m-0.5 bg-blue-500 p-2">
                    <!-- here will be predicted savings -->
                    <p>Current Spendings: ${currentSpendings}</p>
                    <p>Current Income: ${currentIncome}</p>
                    Predicted Savings: ${prediction}
                </div>
            </div>
            
            <PieChart {selectedMonth} {selectedYear} {transactionData} {categoryData}></PieChart>
        </div>
    </div>
</div>

