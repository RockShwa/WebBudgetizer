<script>
    let category = '';
    import { addCategory, categories } from "./categoryStore";
    import Category from "./Category.svelte";

    // we want a centralized store for all of our todos, so we're gonna import that here
    const handleSubmit = () => {
        addCategory(category);
        category = ''; // reset todo text
    }
</script>

<head>
    <title>Manage Categories</title>
</head>

<main>
    <div class="flex flex-row justify-between m-3">
        <div class="text-2xl font-bold">Manage Categories</div>
        <button class="w-20 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-1">Back</button>
    </div>

    <form class="my-6 mx-3" on:submit|preventDefault={handleSubmit}>
        <label class="font-bold text-gray-800 m-3" for="todo">Add Category</label>
        <div class="flex flex-row text-sm mb-2">
            <!-- bind todo value inside input (to store the variable there)-->
            <input type="text" bind:value={category} name="category" placeholder="Enter Category Here"
            class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-non focus:border-gray-500
            rounded-lg"/>
            <button type="submit" class="w-auto shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 m-2">Add</button>
        </div>
    </form>

    {#each $categories as category}
        <Category category={category} index={category.id}></Category>
    {/each}
</main>