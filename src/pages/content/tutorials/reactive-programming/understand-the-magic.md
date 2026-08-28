at first, reactive programming seems like magic. you wouldn't be blamed for thinking so


code runs, dependencies somehow appear, and changing one value can cause seemingly unrelated code to run


but if you break it down logically, there's actually very little going on

## the "magic"
look at this code:
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
end) --> 10 (5 * 2)

flag:set(false) --> 6 (3 * 2)
a:set(6) -- ignored in the graph
b:set(2) --> 4 (2 * 2)
flag:set(true) --> 12 (6 * 2)
```

if you break it down logically, it makes sense:
- `selective` depends on `flag` and whichever of `a` or `b` it reads during its latest run
- `doubled` depends on `selective` and `c`
- the effect depends on `doubled`
- when a dependency changes, its observers are notified


the graph looks like:
```
flag ──────► selective ◄────── a
                │
                ▼
             doubled ◄────── c
                │
                ▼
              effect
```


and after `flag = false`:
```lua
flag ──────► selective ◄────── b
                │
                ▼
             doubled ◄────── c
                │
                ▼
              effect
```


when `selective` re-runs, it tracks the sources it reads again. because it reads `b` instead of `a`, the old `a → selective` dependency is removed and `b → selective` is added


---


however, when you really to think about the implementation without understanding the core of reactive programming, it can seem like arbitrary magic connects sources to observers


but the funniest part? it's actually simple. a lot more simple than you may initially think

## the simplicity

there are two key components:
- sources, which can be subscribed to by observers
- and observers, which can subscribe to sources


a reactive node can be both a source and an observer


in that example:
- `a`, `b`, and `c` are sources
- `selective` is a source and an observer
- `doubled` is a source and an observer
- the effect is an observer


for the library we will be making, and many on Roblox, it breaks down into these 3 core pieces:
- every source knows every observer that is tracking it
- every observer knows every source that it is tracking
- whenever an observer re-runs, its dependencies are updated to match what it actually reads


**that's it**


these 3 components are all that a simple reactive state library needs to reproduce that magic