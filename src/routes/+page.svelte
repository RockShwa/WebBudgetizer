<script>
    import { resolve } from '$app/paths';
</script>

<svelte:head>
    <title>Dashboard</title>
</svelte:head>

<main>
    <h1 class="text-2xl font-bold text-center text-gray-800 md:text-3xl my-6">FreeBudgetPro</h1>

    <div class="button-grid flex justify-self-center">
        <!-- px-[70%] and properties like it will adapt to the viewport -->
        <a href={resolve("/transactions")}>
            <button type="button" class="shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white w-100% px-[70%] py-[15%]">
                Transactions</button>
        </a>     
        <a href={resolve("/yearlySummaries")}>
            <button type="button" class="shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white w-[150%] px-[30%] py-[10%]">
                Yearly Summaries</button>
        </a>  
            <button></button>
        <a href={resolve("/monthlySummaries")}>   
            <button type="button" class="shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white w-[150%] px-[15%] py-[10%]">
                Monthly Summaries
            </button>
        </a> 
    </div>

    <style> 
        .button-grid {
            flex-direction: column;
            display: grid;
            grid-template-columns: auto auto;
            gap: 10px 150px;
            justify-content: center;
            align-items: center; 
        }
    </style>
</main>

