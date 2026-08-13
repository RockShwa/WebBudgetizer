<script lang="ts">
    //import { resolve } from '$app/paths';
	import type { Transaction } from '$lib/classes/Transaction';
	import type { Category } from '$lib/classes/Category';

    export let data: { 
        transactionData: Transaction[];
        categoryData: Category[];
    };

    $: transactionData = data.transactionData ?? [];
    let positiveTransactions: Transaction[] = [];

    $: positiveTransactions = transactionData.filter(
        (transaction) => transaction.amount > 0
    );
</script>

<svelte:head>
    <title>Manage Income | FreeBudgetPro</title>
</svelte:head>

<main class="min-h-screen bg-black text-white flex flex-col justify-center p-6 relative overflow-hidden">
                    
    
</main>