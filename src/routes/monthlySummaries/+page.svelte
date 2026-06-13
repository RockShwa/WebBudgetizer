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
    <title>Monthly Summaries | FreeBudgetPro</title>
</svelte:head>

<div class="min-h-screen min-w-screen bg-black text-white flex flex-col p-4 sm:p-8 relative overflow-hidden w-full max-w-7xl mx-auto z-10 gap-6">
    
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-[#72b0cf]/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="flex flex-row items-center justify-between border-b border-zinc-900 pb-4 z-10">
        <h1 class="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Monthly <span class="text-[#72b0cf]">Summaries</span>
        </h1>
        <a href={resolve("/")} class="flex py-2 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-[#72b0cf] hover:text-white hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(114,176,207,0.15)] active:scale-95 text-sm">
            Back
        </a>  
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start z-10 w-full">

        <div class="lg:col-span-2 flex flex-col gap-6 w-full">

            <div class="flex flex-col gap-2">
                <label for="month" class="font-bold text-zinc-400 tracking-wider text-xs uppercase px-1">
                    Category
                </label>
                <select bind:value={selectedCategory} class="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#72b0cf]/80 focus:ring-1 focus:ring-[#72b0cf]/20">
                    {#each categoryData as c (c.name)}
                        <option class="bg-zinc-950 font-bold">{c.name}</option>
                    {/each}
                </select>
            </div>
            
            <div class="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
                <h2 class="font-black tracking-tight text-lg sm:text-xl text-white">
                    <span class="text-[#72b0cf]">{selectedCategory || 'Category'}</span> Trend for {selectedYear || 'Year'}
                </h2>
                <div class="w-full bg-zinc-950/30 border border-zinc-900/80 rounded-xl p-2 min-h-[300px] flex items-center justify-center">
                    <RegressionChart {selectedMonth} {selectedYear} {selectedCategory} {categoryData}></RegressionChart>
                </div>
            </div>

        </div>

        <div class="flex flex-col gap-4 bg-zinc-900/30 border border-zinc-800/60 p-5 rounded-2xl backdrop-blur-sm">

            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label for="month-select" class="font-bold text-zinc-400 tracking-wider text-xs uppercase px-1">
                        Month
                    </label>
                    <select class="select w-full bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#72b0cf]/80" id="month-select" bind:value={selectedMonth}>
                    </select>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="year-select-pie" class="font-bold text-zinc-400 tracking-wider text-xs uppercase px-1">
                        Year
                    </label>
                    <select class="select w-full bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#72b0cf]/80" id="year-select-pie" bind:value={selectedYear}>
                    </select>
                </div>
            </div>

            <div class="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
                <h2 class="font-black tracking-tight text-lg sm:text-xl text-white">
                    Spending Distribution
                </h2>
                <div class="w-full bg-zinc-950/30 border border-zinc-900/80 rounded-xl p-2 min-h-[250px] flex items-center justify-center">
                    <PieChart {selectedMonth} {selectedYear} {transactionData} {categoryData}></PieChart>
                </div>
            </div>

            <div class="font-medium rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-zinc-300 flex flex-col gap-1.5 text-sm backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <p class="flex justify-between">
                    <span class="text-zinc-500">Current Spendings:</span> 
                    <span class="font-bold text-white">${currentSpendings}</span>
                </p>
                <p class="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span class="text-zinc-500">Current Income:</span> 
                    <span class="font-bold text-white">${currentIncome}</span>
                </p>
                <p class="flex justify-between items-center pt-1">
                    <span class="text-[#72b0cf] font-bold text-xs uppercase tracking-wider">Predicted Savings:</span> 
                    <span class="font-black text-white text-base">${prediction}</span>
                </p>
            </div>

        </div>
    </div>
</div>

