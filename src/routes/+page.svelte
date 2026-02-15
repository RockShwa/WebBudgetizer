<script>
	import TodoExample from "../components/example/TodoExample.svelte";
    import Todo from "../components/example/Todo.svelte";
    import {todos} from "../stores/todoStore.ts";
</script>

<main>
    <h1 class="text-2xl font-bold text-center text-gray-800 md:text-3xl my-6">FreeBudgetPro</h1>
    <TodoExample/>
    <!-- writable can't really be accessed directly but it kinda can with the $, the $ gets the data-->
    <!-- this is a for each loop -->
    {#each $todos as todo}
        <Todo todo={todo} index={todo.id} />
    {/each}
</main>
