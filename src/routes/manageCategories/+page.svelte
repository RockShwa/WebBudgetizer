<script lang="ts">
    import Category from "../../components/Category.svelte";
    import { resolve } from '$app/paths';

    export let data: { categoryData: { name: string; goal: number; defaultGoal: number; }[]};
    let categoryData = data.categoryData ?? [];
    let categoryName = '';

    async function handleAddCategory() {
        await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName, goal: 0, defaultGoal: 0 })
        });

        const newCategory = { name: categoryName, goal: 0, defaultGoal: 0 };
        categoryData = [...categoryData, newCategory]; // update website
        categoryName = ''; // reset input
    }

    async function handleDeleteCategory(c: { name: string }) {
        await fetch('/api/categories', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: c.name })
        });

        categoryData = categoryData.filter(t => t.name !== c.name); // remove from UI
    }

</script>

<svelte:head>
    <title>Manage Categories</title>
</svelte:head>

<main>
    <div class="flex flex-row justify-between m-3">
        <div class="text-2xl font-bold">Manage Categories</div>
        <a href={resolve("/transactions")}>
            <button class="w-20 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-1">Back</button>
        </a>
    </div>

    <!-- Add Category -->
    <form class="my-6 mx-3" on:submit|preventDefault={handleAddCategory}>
        <label class="font-bold text-gray-800 m-3" for="todo">Add Category</label>
        <div class="flex flex-row text-sm mb-2">
            <!-- bind todo value inside input (to store the variable there)-->
            <input type="text" bind:value={categoryName} name="category" placeholder="Enter Category Here"
            class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-non focus:border-gray-500
            rounded-lg"/>
            <button type="submit" class="w-auto shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 m-2">Add</button>
        </div>
    </form>

    <!-- Category List -->
    {#each categoryData as c (c.name)}
        <Category text={c.name} goal={c.goal} defaultGoal={c.defaultGoal}></Category>

        <li class="bg-white flex items-center shadow-sm border-gray-200 rounded-lg my-2 py-2 px-4">
        <input
            type="checkbox"
            class="mr-2 form-checkbox h-5 w-5"/>
            <!-- we use brackets after the class bc we're going to be using some variables-->
            <!-- display things in addition to text here -->
            <span class="flex-1 text-gray-800">Category: {c.name} Goal: {c.goal} Default Goal: {c.defaultGoal}</span>
            <button
                type='button'
                class='text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline'
                on:click={() => handleDeleteCategory(c)}>Delete</button>
        
        </li>
    {/each}

</main>