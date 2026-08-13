<script>
    import { resolve } from '$app/paths';
</script>

<svelte:head>
    <title>Dashboard | FreeBudgetPro</title>
</svelte:head>

<main class="min-h-screen bg-black text-white flex flex-col justify-center p-6 relative overflow-hidden">
    
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#72b0cf]/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="w-full max-w-2xl mx-auto z-10">
        <div class="text-center mb-12">
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-white my-2">
                FreeBudget<span class="text-[#72b0cf]">Pro</span>
            </h1>
            <p class="text-zinc-400 font-medium tracking-widest text-xs sm:text-sm uppercase">
                Taking control of your finances
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href={resolve("/transactions")} class="w-full flex">
                <button type="button" class="w-full py-6 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-[#72b0cf] hover:text-white hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(114,176,207,0.15)] active:scale-95">
                    Transactions
                </button>
            </a>     
            
            <a href={resolve("/yearlySummaries")} class="w-full flex">
                <button type="button" class="w-full py-6 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-[#72b0cf] hover:text-white hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(114,176,207,0.15)] active:scale-95">
                    Yearly Summaries
                </button>
            </a>  

            <a href={resolve("/monthlySummaries")} class="w-full flex">    
                <button type="button" class="w-full py-6 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-[#72b0cf] hover:text-white hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(114,176,207,0.15)] active:scale-95">
                    Monthly Summaries
                </button>
            </a> 

            <a href={resolve("/manageIncome")} class="w-full">    
                <button type="button" class="w-full py-6 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-[#72b0cf] hover:text-white hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(114,176,207,0.15)] active:scale-95">
                    Income Categorization
                </button>
            </a> 
        </div>
    </div>
</main>