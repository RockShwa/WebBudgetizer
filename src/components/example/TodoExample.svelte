<script>
    let todo = '';
    import {addTodo} from "../../stores/todoStore.ts"
    // we want a centralized store for all of our todos, so we're gonna import that here
    const handleSubmit = () => {
        addTodo(todo);
        todo = ''; // reset todo text
        console.log("submitting")
    }
</script>

<!-- basically on submit, we handle the preventDefault error, and then that will call
 the handleSubmit function which logs to the user that the form is submitting-->
<form class="my-6" on:submit|preventDefault={handleSubmit}>
    <div class="flex flex-col text-sm mb-2">
        <label class="font-bold mb-2 text-gray-800" for="todo">Todo</label>
        <!-- bind todo value inside input (to store the variable there)-->
        <input type="text" bind:value={todo} name="todo" placeholder="Watcha gotta do?"
        class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-non focus:border-gray-500
        rounded-lg"/>
    </div>
    <button type="submit" class="w-full shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4">Submit</button>
</form>