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
        const newTodos = [... cur, {text, completed: false, id: Date.now()}];
        return newTodos;
    })
}