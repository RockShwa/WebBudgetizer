<script lang="ts">
// <!-- Okay so:
//     1. Pull Category Data - DONE
//     2. Checkbox next to each category indicating whether it's selected to be included in checking or savings - DONE
//     3. Store selection in category database - DONE
//     4. Maybe add starting checking and savings... idk whether to hardcode or put here
//     5. Make it look nice (thanks AI)
//     6. Link category selection to account calculations
// -->
    import { resolve } from '$app/paths';
    import type { Category } from '$lib/classes/Category';

    export let data: { 
        categoryData: Category[];
    };

    $: categoryData = data.categoryData ?? [];

    async function handleCheckChange(action: string, event: Event, categoryName: string) {
        let bitSS = Number(categoryData.find(c => c.name === categoryName)?.includedInSelfSpending);
        let bitSTS = Number(categoryData.find(c => c.name === categoryName)?.includedInShortTermSavings);
        let bitSO = Number(categoryData.find(c => c.name === categoryName)?.includedInSavingsOthers);
        
        if (action === 'SELF SPENDING') {
            if (bitSS === 0) {
                bitSS = 1;
            } else {
                bitSS = 0;
            }
            // query database with input
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'SELF SPENDING',
                    categoryName: categoryName,
                    isCheckingChecked: bitSS
                })
            });
        }

        if (action === 'SHORT TERM SAVINGS') {
            if (bitSTS === 0) {
                bitSTS = 1;
            } else {
                bitSTS = 0;
            }
            // query database with input
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'SHORT TERM SAVINGS',
                    categoryName: categoryName,
                    isSavingsChecked: bitSTS
                })
            });
        }

        if (action === 'SAVINGS FOR OTHERS') {
            if (bitSO === 0) {
                bitSO = 1;
            } else {
                bitSO = 0;
            }
            // query database with input
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'SAVINGS FOR OTHERS',
                    categoryName: categoryName,
                    isSavingsChecked: bitSO
                })
            });
        }
    }

</script>

<svelte:head>
    <title>Settings | FreeBudgetPro</title>
</svelte:head>

<main class="min-h-screen bg-black text-white p-6 flex flex-col gap-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">

        <div>
            <h1 class="text-2xl font-bold text-white">
                Income Management Settings
            </h1>
            <p class="text-xs text-zinc-500 mt-1">
                Choose which categories count toward self spending, short terms savings, and savings for others
            </p>
        </div>

        <a
            href={resolve("/manageIncome")}
            class="text-xs font-bold tracking-wide uppercase bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-2.5 transition-all active:scale-95"
        >
            Back
        </a>

    </div>

    <!-- Categories -->
    <div class="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">

        <div class="p-4 border-b border-zinc-800 bg-zinc-900/40">
            <h2 class="text-xs font-bold tracking-widest uppercase text-zinc-400">
                Categories
            </h2>
            <p class="text-xs text-zinc-600 mt-1">
                Toggle inclusion for each category
            </p>
        </div>

        <table class="w-full border-collapse text-left text-sm">
            <thead>
                <tr class="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                    <th class="p-4">Category</th>
                    <th class="p-4">Include in Self Spending Balance?</th>
                    <th class="p-4">Include in Short Term Savings Balance?</th>
                    <th class="p-4">Include in Savings for Others Balance?</th>
                </tr>
            </thead>

            <tbody class="divide-y divide-zinc-900">
                {#each categoryData as c (c.name)}
                <tr class="hover:bg-zinc-900/40 transition-colors duration-150 group">

                    <td class="p-4 text-[#72b0cf] font-medium">
                        {c.name}
                    </td>

                    <td class="p-4">
                        <input 
                            type="checkbox" 
                            id="donated"
                            class="accent-[#72b0cf] cursor-pointer w-4 h-4"
                            checked = {Boolean(c.includedInSelfSpending)}
                            on:change={(e) => handleCheckChange("SELF SPENDING", e, c.name)}
                        >
                    </td>

                    <td class="p-4">
                        <input 
                            type="checkbox" 
                            id="donated"
                            class="accent-[#72b0cf] cursor-pointer w-4 h-4"
                            checked = {Boolean(c.includedInShortTermSavings)}
                            on:change={(e) => handleCheckChange("SHORT TERM SAVINGS", e, c.name)}
                        >
                    </td>

                    <td class="p-4">
                        <input 
                            type="checkbox" 
                            id="donated"
                            class="accent-[#72b0cf] cursor-pointer w-4 h-4"
                            checked = {Boolean(c.includedInSavingsOthers)}
                            on:change={(e) => handleCheckChange("SAVINGS FOR OTHERS", e, c.name)}
                        >
                    </td>

                </tr>
                {/each}
            </tbody>
        </table>

    </div>

</main>

<style>
    select {
        color-scheme: dark;
    }

    :global(select option) {
        background-color: #09090b !important;
        color: #ffffff !important;
    }
</style>