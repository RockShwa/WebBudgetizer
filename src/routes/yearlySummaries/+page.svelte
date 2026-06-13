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
    <title>Yearly Summaries | FreeBudgetPro</title>
</svelte:head>

<div class="min-h-screen min-w-screen bg-black text-white flex flex-col p-4 sm:p-8 relative overflow-hidden w-full max-w-7xl mx-auto z-10 gap-6">
    
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-[#72b0cf]/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="flex flex-row items-center justify-between border-b border-zinc-900 pb-4 z-10">
        <h1 class="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Yearly <span class="text-[#72b0cf]">Summaries</span>
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
                        <option class="bg-zinc-950">{c.name}</option>
                    {/each}
                </select>
            </div>
            
            <div class="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
                <h2 class="font-black tracking-tight text-lg sm:text-xl text-white">
                    <span class="text-[#72b0cf]">{selectedCategory || 'Category'}</span> Trend: All Time
                </h2>
                <div class="w-full bg-zinc-950/30 border border-zinc-900/80 rounded-xl p-2 min-h-[300px] flex items-center justify-center">
                    <RegressionChart {selectedMonth} {selectedYear} {selectedCategory} {categoryData}></RegressionChart>
                </div>
            </div>

        </div>

        <div class="flex flex-col gap-4 bg-zinc-900/30 border border-zinc-800/60 p-5 rounded-2xl backdrop-blur-sm">

            <div class="flex flex-col gap-2">
                <label for="year-select" class="font-bold text-zinc-400 tracking-wider text-xs uppercase px-1">
                    Year
                </label>
                <select class="select w-full bg-zinc-950 border border-zinc-800 text-zinc-200 font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#72b0cf]/80 focus:ring-1 focus:ring-[#72b0cf]/20" id="year-select" bind:value={selectedYear}>
                </select>

            </div>

             <div class="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
                <h2 class="font-black tracking-tight text-lg sm:text-xl text-white">
                    Spending Distribution for <span class="text-[#72b0cf]">{selectedYear || 'Year'}</span>
                </h2>
                <div class="w-full bg-zinc-950/30 border border-zinc-900/80 rounded-xl p-2 min-h-[300px] flex items-center justify-center">
                    <PieChart {selectedMonth} {selectedYear} {transactionData} {categoryData}></PieChart>
                </div>
            </div>

        </div>
    </div>
</div>

