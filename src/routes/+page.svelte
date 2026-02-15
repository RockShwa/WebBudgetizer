<script>
	import TodoExample from "../components/example/TodoExample.svelte";
    import Todo from "../components/example/Todo.svelte";
    import {todos} from "../stores/todoStore.ts";
</script>

<main>
    <h1 class="text-2xl font-bold text-center text-gray-800 md:text-3xl my-6">FreeBudgetPro</h1>
    
    <!-- <TodoExample/> -->
    <!--writable can't really be accessed directly but it kinda can with the $, the $ gets the data-->
    <!-- this is a for each loop
    {#each $todos as todo}
        <Todo todo={todo} index={todo.id} />
    {/each} -->
</main>

<div class="button-grid">
        <button type="submit" class="w-60 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2">Transactions</button>
        <button type="submit" class="w-60 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2">Yearly Summaries</button>
        <button></button>
        <button type="submit" class="w-60 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2">Monthly Summaries</button>
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
