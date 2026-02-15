import { writable } from "svelte/store";

interface Todo {
    text: string;
    completed: boolean;
    id: number;
}
// our writable thing starts out as an empty array
export const todos = writable<Todo[]>([]);

export const addTodo = (text: string) => {
    // this is going to look kind of weird bc we need to update the array
    // and then reassign it

    // cur is current array
    todos.update( (cur) => {
        // id: Date.now() is an easy way to make a semi-unique id
        // new Todo is cur + the New Todo
        const newTodos = [... cur, {text, completed: false, id: Date.now()}];
        return newTodos;
    })
}

export const deleteTodo = (id: number) => {
    // uses implicit return (thing in brackets will be returned)
    // filtering out todo that matches given id (that we're trying to delete)
    todos.update(todos => todos.filter(todo => todo.id != id));
}

export const toggleTodoCompleted = (id: number) => {
    // grab existing todos
    todos.update(todos => {
        // go find todo in that array with that id
        let index: number = -1;
        // try and find the todo
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].id == id) {
                index = i;
                break;
            }
        }
        // didn't find it
        if (index != -1) {
            todos[index].completed = !todos[index].completed; // if we found the todo, flip the existing value
        }
        return todos;
    })
}