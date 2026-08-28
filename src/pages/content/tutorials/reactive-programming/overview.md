- if you know me, you know i have a deep obsession with reactive programming
- this is not without reason. reactive programming completely flipped my workflow on its head for the better
- my <a href="/flightframework/">flightframework</a> is essentially an extensive framework centered around one core concept: **reactive state.**

::: warn important!
- this tutorial is not solely for utilizing existing reactive state
- you will literally be **creating** a reactive state library
:::

## why use it?

first, understand the purpose

lets say you want this functionality:
```lua
local a = 1
local b = 2
local c = a + b
a = 10
print(c) --> 12
```
this looks awesome, but of course: `c` does not automatically react to `a`'s change, so this example would actually print `3`

<br>

however, this fantasy is exactly what functionality reactive programming provides

<br>

with many implementations, it may look something like this:
```lua
local a = state.new(1)
local b = state.new(2)

local c = state.computed(function()
    return a:get() + b:get()
end)

print(a:peek()) --> 3

a:set(10)

print(c:peek()) --> 12
```

with this simple api, we now get the functionality we wanted earlier. `c` automatically reacts to the changes of `a` and `b`

## by the end,
**of this tutorial**, you will create and understand the following code:
```lua

```

## how long will this take?

## is it always better?

**no.**

<br>

- reactive programming is incredibly powerful, but not without cost
- of course, the performance hit is negligible in a vast majority of applications
- however, for those who are not used to reactive programming, excessive use of it—especially in systems where reactive programming is overkill—can create an extremely confusing data flow with very little benefit