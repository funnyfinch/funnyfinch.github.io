## overview
flight has two kinds of states:
- **value states**, which hold a single value
- **container states**, which map keys to values

states are a form of <a href="https://gist.github.com/staltz/868e7e9bc2a7b8c1f754">reactive programming</a>

for my tutorial on reactive programming, see my guide <a href="/tutorials/reactive-programming/overview">here</a>

## values

### api

```lua
value<T> {
    ._d: {
        alive: boolean,

    }

    :peek(): T -- untracked
    :get(): T -- tracked
    :set(T)
    :update( (T) -> T ): T

    :validator( (T, T) -> boolean ): () -> () -- disconnector
    :validate(T): boolean
    :destroy()
}
```

### basic usage
```lua
const myNumber = state.value(0)

myNumber:
```

### type validator

the first value to be set will determine the state's type validator

for example, if you create a state of type `number`, it will not accept any other type

this includes states constructed without an initial value

```lua
const myNumber = state.value<<number>>()
myNumber:set(5)
myNumber:set("hi")
print(myNumber:peek()) --> 5
```

## containers

## effect observers

### basic usage
```lua
const myState = state.value(0)
const otherState = state.value("hi")

state.effect(function()
    print(myState:get(), otherState:get()) -- use :get() when tracking a state
end)

-- mutating a tracked state will cause the effect observer to rerun immediately
myState:set(5) --> 5, "hi"
```

observers automatically unsubscribe from stale states

take this example where the observer selectively observes a state depending on a condition

```lua
const flag = state.value(true)
const a = state.value(5)
const b = state.value("hi")

state.effect(function()
    if flag:get() then
        print(a:get())
    else
        print(b:get())
    end
end) --> 5

flag:set(false) --> "hi"
```

## derived observers

derived observers derive their value from other states

they are commonly known as computed observers

### basic usage

```lua
const a = state.value(5)
const b = state.value(3)

const derivedState = state.derived(function()
    return a:get() + b:get()
end)

print(derivedState:peek()) --> 8

a:set(3)

print(derivedState:peek()) --> 6
```

### chain them

```lua
const flag = state.value(true)
const a = state.value(5)
const b = state.value(3)
const c = state.value(2)

const selective = state.derived(function()
    if flag:get() then
        return a:get()
    else
        return b:get()
    end
end)

const doubled = state.derived(function()
    return selective:get() * c:get()
end)

state.effect(function()
    print(doubled:get())
end) --> 10

flag:set(false) --> 6
a:set(6)
b:set(2) --> 4
flag:set(true) --> 12
```