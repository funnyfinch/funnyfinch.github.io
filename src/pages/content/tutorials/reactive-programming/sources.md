## setting it up
to start, create a new ModuleScript. call it whatever you want. i appreciate literal names, so i keep mine "state"


before we work on the implementation, lets get the types figured out. this will help us to not overscope and to get am early feel for everything we will implement


we will have 3 core objects in our library:
- sources, containing read methods
- values, which are sources that can be set
- observers, which automatically track dependency sources


first, we will define the source
```lua
export type source<T = any> = {
    observers: { observer},
    version: number,

    get: (self: source<T>) -> T,
    peek: (self: source<T>) -> T
}
```
never seen the `<T>` before? thats a generic. see my full type tutorial here (SOON)


```lua
export type observer = {
    sources: { source }
}
```


```lua
export type value<T> = source<T> & {
    set: (self: value<T>, T) -> (),
    update: (self: value<T>, (T) -> T) -> ()
}
```
