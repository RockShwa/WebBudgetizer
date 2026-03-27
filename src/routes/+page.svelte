<script>
    import { resolve } from '$app/paths';
</script>

<svelte:head>
    <title>Dashboard</title>
</svelte:head>

<main class="p-6">
    <h1 class="text-3xl font-extrabold text-center text-gray-900 my-2">FreeBudgetPro</h1>
    <p class="font-bold text-center text-gray-600 mb-10">Taking control of your finances</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <a href={resolve("/transactions")} class="w-full flex">
            <button type="button" class="w-full py-6 px-4 rounded-xl bg-blue-600 font-bold transition-all active:scale-95">
                Transactions</button>
        </a>     
        <a href={resolve("/yearlySummaries")} class="w-full flex">
            <button type="button" class="w-full py-6 px-4 rounded-xl bg-blue-600 font-bold transition-all active:scale-95">
                Yearly Summaries</button>
        </a>  
        <a href={resolve("/monthlySummaries")} class="w-full flex md:col-span-2">    
            <button type="button" class="w-full py-6 px-4 rounded-xl bg-blue-600 font-bold transition-all active:scale-95">
                Monthly Summaries
            </button>
        </a> 
    </div>
</main>

