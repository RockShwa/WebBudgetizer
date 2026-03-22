<script lang="ts">
	import { deleteCategory } from "../stores/categoryStore";

    interface Category {
            text: string;
            exclude: boolean;
            id: number;
            goal: number;
            defaultGoal: number;
        }

        export let category: Category;
        export let index: number;
        export let goal: number;
        export let defaultGoal: number;        
</script>

<!-- TODO: exclude category from transaction display on:change={() => excludeTodo(category.id)} -->

<li class="bg-white flex items-center shadow-sm border-gray-200 rounded-lg my-2 py-2 px-4">
    <input
        name="excluded"
        type="checkbox"
        checked={category.exclude}
        class="mr-2 form-checkbox h-5 w-5"/>
        <!-- we use brackets after the class bc we're going to be using some variables-->
        <!-- display things in addition to text here -->
        <span class="flex-1 text-gray-800">Category: {category.text} Goal: {category.goal} Default Goal: {category.defaultGoal}</span>
        <button
            type='button'
            class='text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline'
            on:click={() => deleteCategory(category.id)}>Delete</button>
    
</li>