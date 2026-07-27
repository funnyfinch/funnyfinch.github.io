# state.new()
```luau
state.value<T>(value: T): value<T>
```

## Methods
### value:get()
Returns the current value and registers itself as a dependency.
```luau
value<T>:get(): T (tracked)
```
### value:peek()
Returns the current value and does not register itself as a dependency.
```luau
value<T>:peek(): T
```
### value:set()
Sets the state to the provided value.
```luau
value<T>:set(value: T)
```
### value:update()
Updated the state's value by the result of the given function.
```luau
value<T>:update(update: (T) -> T)
```
```luau
local value = state.value(0)
function value:update(function(current)
    return current + 5
end)
```