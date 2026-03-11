<script>
    import { categories } from "../../stores/categoryStore";
    import Category from "../../components/Category.svelte";
    import { resolve } from '$app/paths';
</script>

<svelte:head>
    <title>Manage Goals</title>
</svelte:head>

<main>
    <div class="flex flex-row justify-between m-3">
        <div class="text-2xl font-bold">Manage Goals</div>
        <a href={resolve("/transactions")}>
            <button class="w-20 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-1">Back</button>
        </a>
    </div>

    <!-- 
    3. make each category have a goal property
    4. make each category have a default proerty
    5. make space for an actual and difference for later
    6. get rid of the delete button
     -->

    {#each $categories as category (category.id)}
    <!-- get goal and default once u make a store for goals -->
        <Category category={category} index={category.id} goal={0} defaultGoal={0}></Category>
    {/each}
</main>