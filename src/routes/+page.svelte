<script>
    import { resolve } from '$app/paths';
</script>

<svelte:head>
    <title>Dashboard</title>
</svelte:head>

<main>
    <h1 class="text-2xl font-bold text-center text-gray-800 md:text-3xl my-6">FreeBudgetPro</h1>
</main>

<div class="button-grid">
    <a href={resolve("/transactions")}>
        <button type="button" class="w-60 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2">Transactions</button>
    </a>     
    <a href={resolve("/yearlySummaries")}>
        <button type="button" class="w-60 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2">Yearly Summaries</button>
    </a>  
        <button></button>
    <a href={resolve("/monthlySummaries")}>   
        <button type="button" class="w-60 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2">Monthly Summaries</button>
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
