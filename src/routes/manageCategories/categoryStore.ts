import { writable } from "svelte/store";

interface Category {
    text: string;
    id: number;
}
// our writable thing starts out as an empty array
export const categories = writable<Category[]>([]);

export const addCategory = (text: string) => {
    // this is going to look kind of weird bc we need to update the array
    // and then reassign it

    // cur is current array
    categories.update( (cur) => {
        // id: Date.now() is an easy way to make a semi-unique id
        // new Todo is cur + the New Todo
        const newCategories = [... cur, {text, id: Date.now()}];
        return newCategories;
    })
}

export const deleteCategory = (id: number) => {
    // uses implicit return (thing in brackets will be returned)
    // filtering out todo that matches given id (that we're trying to delete)
    categories.update(todos => todos.filter(todo => todo.id != id));
}