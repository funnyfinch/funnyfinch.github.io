## basics
variables are the life blood of programming in Luau

::: tip
the simplest explanation: **a variable is a name that refers to some data**
:::

let's start with a simple example. we will create a variable "age" and have it reference the number `20`:
```lua
local age = 20
```

here, `20` is the data, and `age` is the name we use to refer to it

<br>

you can think of it like an arrow:

`age --> 20`

<br>

---
### mutating a variable
variables can be made to refer to different data

```lua
local age = 20
age = 21
```

now the reference has changed

`age --> 21`

<br>

the `20` did not turn into `21`. `age` simply stopped referring to `20` and started referring to `21`

::: warn remember!
a variable is not the data itself. it is a reference to the data. this fact may seem confusing or irrelevant, but it will be incredibly important to understand this distiction for when we get to tables
:::

## scopes
scopes are slightly out of place this early, but engraving good habits and core concepts early is imperative

<br>

let's build this mental model:
- `local` creates a variable that can only be accessed from its scope
- a variable's **scope** is the region of code where its name is available
- `local` does not necessarily restrict the data itself. it restricts access to the variable name that refers to that data

### what is a scope?
look at these code snippets:
```lua
-- new scope
if true then
    -- new scope
end
```
```lua
-- new scope
do
    -- new scope
end
```
don't worry about if statements or for loops yet. we will cover those soon

general rule of thumb: if an `end` is involved, there is a scope